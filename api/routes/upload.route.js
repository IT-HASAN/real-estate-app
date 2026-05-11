import express from 'express';
import multer from 'multer';
import { uploadImage, deleteImage } from '../controllers/upload.controller.js';
import { verifyUser } from '../utils/verifyUser.js';
import path from 'path';

const router = express.Router();

const upload = multer({
  dest: path.join(process.cwd(), 'uploads'),
  limits: { fileSize: 2 * 1024 * 1024 }
});

router.post('/', verifyUser, upload.single('file'), uploadImage);
router.post('/delete', verifyUser, deleteImage);

export default router;