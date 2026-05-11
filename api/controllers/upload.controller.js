import cloudinary from '../utils/cloudinary.js';
import fs from 'fs';

export const uploadImage = async (req, res, next) => {
  const file = req.file;
  const { type } = req.body;

  try {
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let folder = 'misc';

    if (type === 'user') {
      folder = `users/${req.user.id}`;
    } else if (type === 'listing') {
      folder = `listings/${req.user.id}`;
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder
    });

    fs.unlinkSync(file.path);

    res.status(200).json({
      secure_url: result.secure_url,
      public_id: result.public_id
    });
  } catch (err) {
    console.error('Cloudinary error:', err);
    
    if (file?.path) {
      fs.unlinkSync(file.path);
    }
    
    next(err);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ message: 'No public_id provided' });
    }

    await cloudinary.uploader.destroy(public_id);

    res.status(200).json({ message: 'Image deleted' });
  } catch (err) {
    next(err);
  }
};