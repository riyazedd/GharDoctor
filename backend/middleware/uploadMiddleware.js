import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '..', 'uploads');
const privateUploadDir = path.join(__dirname, '..', 'private-uploads');

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(privateUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, file.fieldname === 'citizenshipImage' ? privateUploadDir : uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = new Map([
    ['image/jpeg', '.jpg'],
    ['image/png', '.png'],
    ['image/webp', '.webp'],
  ]);
  const extension = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.get(file.mimetype) !== extension) {
    return cb(new Error('Only JPEG, PNG, and WebP image uploads are allowed'));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 2,
  },
});

export default upload;
