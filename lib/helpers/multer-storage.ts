import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storageDir = path.join(process.cwd(), 'temp');

// Create temp directory if it doesn't exist
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, storageDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 100, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, PNG, WebP, and DOCX are allowed.'));
    }
  },
});

export default upload;