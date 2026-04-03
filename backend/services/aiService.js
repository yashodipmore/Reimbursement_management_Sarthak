const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Expense } = require('../models');
const { Op, fn, col } = require('sequelize');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });

/**
 * Checks for Duplicates, Padding (suspicious amounts), and Outliers.
 * This is an enhancement and DOES NOT block the system if it fails.
 */
const analyzeExpenseFraud = async (expense) => {
  try {
    const analysis = {
      is_flagged: false,
      reasons: [],
    };

    // 1. DUPLICATE CHECK
    const duplicate = await Expense.findOne({
      where: {
        user_id: expense.user_id,
        amount: expense.amount,
        currency: expense.currency,
        date: expense.date,
        category: expense.category,
        id: { [Op.ne]: expense.id }
      }
    });
    if (duplicate) {
      analysis.is_flagged = true;
      analysis.reasons.push("Duplicate submission detected (same amount, date, and category).");
    }

    // 2. PADDING / THRESHOLD CHECK (e.g., 490 instead of 500)
    // Common thresholds like 500, 1000, 5000. If amount is in [95% - 99.9%], flag it.
    const thresholds = [500, 1000, 5000, 10000];
    for (const t of thresholds) {
      if (expense.amount > t * 0.95 && expense.amount < t) {
        analysis.is_flagged = true;
        analysis.reasons.push(`Suspiciously close to ${t} approval threshold (Potential Padding).`);
        break;
      }
    }

    // 3. OUTLIER CHECK (300% of average for this user/category)
    const avgStats = await Expense.findAll({
      where: {
        user_id: expense.user_id,
        category: expense.category,
        id: { [Op.ne]: expense.id }
      },
      attributes: [[fn('AVG', col('amount_in_company_currency')), 'avg']],
      raw: true
    });
    
    if (avgStats[0] && avgStats[0].avg > 0) {
      const avg = parseFloat(avgStats[0].avg);
      if (expense.amount_in_company_currency > avg * 3) {
        analysis.is_flagged = true;
        analysis.reasons.push(`Amount is 300%+ higher than your typical average for ${expense.category}.`);
      }
    }

    // Update the expense with analysis
    await expense.update({
      is_flagged: analysis.is_flagged,
      ai_analysis: analysis
    });

    return analysis;
  } catch (error) {
    console.error('AI Fraud Analysis Error:', error.message);
    return null;
  }
};

/**
 * Generates spending forecast using historical data.
 */
const generateSpendingForecast = async (companyId) => {
  try {
    // Fetch last 6 months data grouped by month
    const history = await Expense.findAll({
      where: { company_id: companyId, status: 'APPROVED' },
      attributes: [
        [fn('DATE_FORMAT', col('date'), '%Y-%m'), 'month'],
        [fn('SUM', col('amount_in_company_currency')), 'total']
      ],
      group: ['month'],
      order: [[col('month'), 'DESC']],
      limit: 6,
      raw: true
    });

    if (history.length < 2) {
      return "Insufficient historical data for forecasting.";
    }

    // SIMPLE FORECAST PROMPT FOR GEMINI
    const dataString = history.map(h => `${h.month}: ${h.total}`).join('\n');
    const prompt = `Based on these last 6 months of corporate spending data (Month: Total), forecast next month's total spending and briefly explain why (e.g. upward trend, seasonability). Provide the response as a clear, concise summary. Data:\n${dataString}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI Forecasting Error:', error.message);
    return "Forecasting is currently unavailable.";
  }
};

/**
 * Scans an image and extracts structured expense data using Gemini.
 */
const extractReceiptData = async (filePath, mimeType) => {
  try {
    const fileData = fs.readFileSync(filePath);
    
    const prompt = `Directly extract data from this receipt image into a JSON object. 
    Fields: title (merchant name), amount (number), currency (3-letter code), date (YYYY-MM-DD), category (one of: travel, food, accommodation, equipment, other).
    If a field is missing, return null. 
    Return ONLY pure JSON, no markdown formatting.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: fileData.toString('base64'),
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    const text = response.text().trim();
    
    // Attempt to parse JSON (remove any ```json or other fluff if AI ignored the "NO MARKDOWN" instruction)
    const cleanedJson = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error('OCR Extraction Error:', error.message);
    return null;
  }
};

module.exports = {
  analyzeExpenseFraud,
  generateSpendingForecast,
  extractReceiptData
};
