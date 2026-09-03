export const buildUploadedFileUrl = (req, filename) => {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

export const buildPrivateDocumentUrl = (req, filename) => {
  return `${req.protocol}://${req.get('host')}/api/service-providers/documents/${filename}`;
};

export const resolveUploadedImage = (req, fieldName, fallback = '') => {
  const file = req.files?.[fieldName]?.[0] || (req.file?.fieldname === fieldName ? req.file : null);

  if (file?.filename) {
    return fieldName === 'citizenshipImage'
      ? buildPrivateDocumentUrl(req, file.filename)
      : buildUploadedFileUrl(req, file.filename);
  }

  const bodyValue = req.body?.[fieldName];
  if (typeof bodyValue === 'string' && bodyValue.trim()) {
    return bodyValue.trim();
  }

  return fallback;
};

export const parseBooleanField = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
};

export const parseNumberField = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? fallback : parsedValue;
};
