import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  // Allowed extensions
  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|mp4|webm|avi|mov|mp3|wav|ogg|m4a|aac|flac)$/i;
  const extname = allowedExtensions.test(file.originalname.toLowerCase());
  
  // Allowed mimetypes
  const allowedMimetypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/avi', 'video/quicktime',
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav',
    'audio/ogg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/flac'
  ];
  const mimetype = allowedMimetypes.includes(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. File: ${file.originalname}, Type: ${file.mimetype}. Only images, videos, and audio files are allowed.`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// Upload endpoint
router.post('/', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });
});

export default router;
