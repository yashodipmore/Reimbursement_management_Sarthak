const fs = require('fs');
const { parseReceipt } = require('../utils/ocrService');

/**
 * POST /api/expenses/ocr
 *
 * Employee uploads a receipt image via multipart/form-data (field name: "receipt").
 * Claude Vision reads the image and returns pre-filled expense fields.
 * The employee can review/edit these fields and then call POST /api/expenses to submit.
 *
 * Returns:
 * {
 *   message: "Receipt scanned successfully",
 *   extracted: { title, vendor, amount, currency, category, date, description }
 * }
 */
const scanReceipt = async (req, res, next) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No receipt image uploaded. Use field name "receipt".' });
    }

    filePath = req.file.path;
    const mimeType = req.file.mimetype;

    const extracted = await parseReceipt(filePath, mimeType);

    res.json({
      message: 'Receipt scanned successfully',
      extracted,
    });
  } catch (error) {
    // Pass to error handler but clean up file first
    next(error);
  } finally {
    // Always clean up the temp file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, () => {});
    }
  }
};

module.exports = { scanReceipt };
