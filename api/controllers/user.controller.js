import cloudinary from '../utils/cloudinary.js';
import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';

export const test = (req, res) => {
  res.json({
    message: 'API route is working!',
  });
};

export const updateUser = async (req, res, next) => {
  if(req.user.id !== req.params.id) return next(errorHandler(401, "You can only update your own account"))
    try {
      if(req.body.password) {
        req.body.password = bcryptjs.hashSync(req.body.password, 10)
      }

      const user = await User.findById(req.params.id);
      if (!user) return next(errorHandler(404, 'User not found'));

      if (
        req.body.avatarPublicId &&
        user.avatarPublicId &&
        req.body.avatarPublicId !== user.avatarPublicId
      ) {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id, 
        {
          $set: {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            avatar: req.body.avatar,
            avatarPublicId: req.body.avatarPublicId
          }
        }, 
        {new: true}
      );

      const {password, ...rest} = updatedUser._doc

      res.status(200).json(rest);
    } catch (error) {
      next(error);
    }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, 'You can only delete your own account'));
  }
  
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    const listings = await Listing.find({ userRef: req.params.id });

    const imageDeletePromises = listings.flatMap((listing) => 
    (listing.images || [])
      .filter((img) => img?.path)
      .map((img) => cloudinary.uploader.destroy(img.path))
    );

    await Promise.allSettled(imageDeletePromises);

    await Promise.allSettled([
      cloudinary.api.delete_resources_by_prefix(`listings/${req.params.id}`),
      cloudinary.api.delete_folder(`users/${req.params.id}`),
      cloudinary.api.delete_folder(`listings/${req.params.id}`)
    ]);

    await Listing.deleteMany({ userRef: req.params.id });

    await User.findByIdAndDelete(req.params.id);

    res.clearCookie('access_token');
    res.status(200).json('User account has been deleted');
  } catch (error) {
    console.error('Delete user error:', error);
    next(error)
  }
};

export const getUserListings = async (req, res, next) => {
  if(req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own listings'));
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
  
    if (!user) return next(errorHandler(404, 'User not found'));
  
    const { password: hash, ...rest } = user._doc;
  
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};