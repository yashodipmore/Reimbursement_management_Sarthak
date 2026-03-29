const https = require('https');
const fs = require('fs');

/**
 * OCR Service — uses Anthropic Claude Vision (claude-sonnet-4-20250514) to extract
 * structured expense fields from a receipt image.
 *
 * Returns an object with:
 *   { title, amount, currency, category, date, description, vendor }
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const OCR_PROMPT = `You are an expense receipt parser. Analyze the receipt image provided and extract the following fields.
Respond ONLY with a valid JSON object — no markdown, no explanation, no backticks.

Fields to extract:
{
  "title": "<short expense title, e.g. 'Dinner at Taj Hotel'>",
  "vendor": "<restaurant / shop / vendor name>",
  "amount": <total amount as a number, e.g. 1250.00>,
  "currency": "<3-letter ISO currency code, e.g. INR, USD, EUR — infer from receipt symbols if possible>",
  "category": "<one of: travel, food, accommodation, equipment, other>",
  "date": "<date in YYYY-MM-DD format>",
  "description": "<brief description of what was purchased>"
}

If a field cannot be determined from the receipt, use null for that field.
For currency: use INR for ₹, USD for $, EUR for €, GBP for £, etc.
For category: infer from vendor type — restaurant/cafe = food, hotel = accommodation, airline/taxi = travel, electronics = equipment.`;

/**
 * Call Anthropic Messages API with a base64 image
 */
const callAnthropicVision = (base64Image, mediaType) => {
  return new Promise((resolve, reject) => {
    if (!ANTHROPIC_API_KEY) {
      return reject(new Error('ANTHROPIC_API_KEY is not configured in environment variables'));
    }

    const payload = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: OCR_PROMPT,
            },
          ],
        },
      ],
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            return reject(new Error(`Anthropic API error: ${parsed.error.message}`));
          }
          resolve(parsed);
        } catch (e) {
          reject(new Error('Failed to parse Anthropic API response'));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

/**
 * Parse a receipt image file (from multer) and return structured expense data.
 * @param {string} filePath - absolute path to the uploaded image
 * @param {string} mimeType - e.g. 'image/jpeg', 'image/png', 'image/webp'
 * @returns {Object} extracted expense fields
 */
const parseReceipt = async (filePath, mimeType) => {
  // Read file and convert to base64
  const fileBuffer = fs.readFileSync(filePath);
  const base64Image = fileBuffer.toString('base64');

  // Validate mime type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const mediaType = allowedTypes.includes(mimeType) ? mimeType : 'image/jpeg';

  // Call Claude Vision
  const response = await callAnthropicVision(base64Image, mediaType);

  // Extract the text content from Anthropic response
  const textBlock = response.content && response.content.find((c) => c.type === 'text');
  if (!textBlock || !textBlock.text) {
    throw new Error('No text response from OCR service');
  }

  // Parse JSON from Claude's response
  let extracted;
  try {
    // Strip any accidental markdown fences just in case
    const clean = textBlock.text.replace(/```json|```/g, '').trim();
    extracted = JSON.parse(clean);
  } catch (e) {
    throw new Error(`OCR response was not valid JSON: ${textBlock.text}`);
  }

  // Normalize and validate the extracted data
  return {
    title: extracted.title || extracted.vendor || 'Receipt Expense',
    vendor: extracted.vendor || null,
    amount: extracted.amount ? parseFloat(extracted.amount) : null,
    currency: extracted.currency ? extracted.currency.toUpperCase() : null,
    category: ['travel', 'food', 'accommodation', 'equipment', 'other'].includes(extracted.category)
      ? extracted.category
      : 'other',
    date: extracted.date || null,
    description: extracted.description || null,
  };
};

module.exports = { parseReceipt };
