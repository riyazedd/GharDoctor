import Tesseract from 'tesseract.js';
import fs from 'fs';

/**
 * Verifies a citizenship card image using OCR.
 *
 * Runs two checks:
 *  1. Keyword check  — does the document contain citizenship-card keywords?
 *  2. Name match     — does the registered name appear in the extracted text?
 *
 * Both checks must pass for `verified` to be true (Option B: soft-flag if either fails).
 *
 * @param {string} imagePath  - Physical disk path to the uploaded image
 * @param {object} [nameOpts] - Optional name to match against
 * @param {string} [nameOpts.firstName]
 * @param {string} [nameOpts.lastName]
 *
 * @returns {Promise<{
 *   verified:      boolean,
 *   keywordMatch:  boolean,
 *   nameMatch:     boolean,
 *   nameMatchDetail: string,
 *   reason:        string,
 * }>}
 */
export const verifyCitizenshipImage = async (
  imagePath,
  { firstName = '', lastName = '', citizenshipNumber = '' } = {}
) => {
  if (!imagePath || !fs.existsSync(imagePath)) {
    console.warn('[OCR] Image path does not exist:', imagePath);
    return {
      verified: false,
      keywordMatch: false,
      nameMatch: false,
      nameMatchDetail: 'Image file not found.',
      citizenshipNumberMatch: false,
      citizenshipNumberMatchDetail: 'Image file not found.',
      reason: 'Image file not found for OCR verification.',
    };
  }

  let extractedText = '';

  try {
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'eng', // 'eng' correctly reads "CITIZENSHIP", "NEPAL", and Latin-script names
      { logger: () => {} } // suppress per-progress-step noise
    );

    extractedText = text;
    console.log('[OCR] Extracted text:\n', text);
  } catch (error) {
    console.error('[OCR] Tesseract error:', error.message);
    return {
      verified: false,
      keywordMatch: false,
      nameMatch: false,
      nameMatchDetail: 'OCR engine error.',
      citizenshipNumberMatch: false,
      citizenshipNumberMatchDetail: 'OCR engine error.',
      reason: 'OCR processing failed due to an internal error.',
    };
  }

  const lower = extractedText.toLowerCase();

  // ─── 1. Keyword check ───────────────────────────────────────────────────────
  const CITIZENSHIP_KEYWORDS = [
    'citizenship',
    'nepal',
    'नागरिकता',         // Nepali: citizenship
    'नेपाल',             // Nepali: Nepal
    'government of nepal',
    'nepal government',
    'citizenship certificate',
    'नागरिकता प्रमाण',
    'district',
    'municipality',
    'province',
    'ward',
  ];

  const matchedKeywords = CITIZENSHIP_KEYWORDS.filter(kw => lower.includes(kw.toLowerCase()));
  const keywordMatch = matchedKeywords.length > 0;

  // ─── 2. Name match ──────────────────────────────────────────────────────────
  // Normalise: OCR on ID cards often produces ALL-CAPS text.
  // We compare both the OCR text and the registered name in lowercase.
  const fn = firstName.trim().toLowerCase();
  const ln = lastName.trim().toLowerCase();
  const hasName = Boolean(fn || ln);

  let nameMatch = false;
  let nameMatchDetail = '';

  if (!hasName) {
    // No name supplied — skip name check, rely on keyword check only
    nameMatch = true;
    nameMatchDetail = 'Name check skipped (no name provided).';
  } else {
    const hasFirst = fn ? lower.includes(fn) : true;
    const hasLast  = ln ? lower.includes(ln) : true;

    if (hasFirst && hasLast) {
      nameMatch = true;
      nameMatchDetail = `Both "${firstName}" and "${lastName}" were found in the document.`;
    } else if (hasFirst) {
      nameMatch = false;
      nameMatchDetail = `First name "${firstName}" found, but last name "${lastName}" was not detected.`;
    } else if (hasLast) {
      nameMatch = false;
      nameMatchDetail = `Last name "${lastName}" found, but first name "${firstName}" was not detected.`;
    } else {
      nameMatch = false;
      nameMatchDetail = `Neither "${firstName}" nor "${lastName}" was detected in the document.`;
    }
  }

  // ─── Combined result ────────────────────────────────────────────────────────
  // Separators vary between cards and OCR output, so compare only
  // alphanumeric characters (for example, "12-34-56" and "123456" match).
  const normalizedCitizenshipNumber = citizenshipNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const normalizedDocumentText = extractedText.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const citizenshipNumberMatch = normalizedCitizenshipNumber.length >= 4
    && normalizedDocumentText.includes(normalizedCitizenshipNumber);
  const citizenshipNumberMatchDetail = citizenshipNumberMatch
    ? 'Citizenship number was found in the document.'
    : 'Citizenship number could not be confirmed in the document.';

  const verified = keywordMatch && nameMatch && citizenshipNumberMatch;

  let reason;
  if (verified) {
    reason = `Document verified — keywords matched (${matchedKeywords.slice(0, 3).join(', ')}) and name matched.`;
  } else if (!citizenshipNumberMatch) {
    reason = `The document's citizenship number could not be confirmed. ${citizenshipNumberMatchDetail}`;
  } else if (!keywordMatch && !nameMatch) {
    reason = 'Document does not appear to be a citizenship card, and the registered name was not found.';
  } else if (!keywordMatch) {
    reason = 'No citizenship-related keywords detected. Please upload a clear photo of your Nepali Citizenship Certificate.';
  } else {
    // keywordMatch but !nameMatch
    reason = `The document looks like a citizenship card, but the name could not be confirmed. ${nameMatchDetail}`;
  }

  return {
    verified,
    keywordMatch,
    nameMatch,
    nameMatchDetail,
    citizenshipNumberMatch,
    citizenshipNumberMatchDetail,
    reason,
  };
};

/**
 * Resolves the physical disk path of an uploaded file from req.files.
 * @param {object} reqFiles - req.files from multer
 * @param {string} fieldName - the multer field name
 * @returns {string|null}
 */
export const resolveUploadedFilePath = (reqFiles, fieldName) => {
  return reqFiles?.[fieldName]?.[0]?.path ?? null;
};
