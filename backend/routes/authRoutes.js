import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  addAddress,
  deleteAddress,
  getAllUsers,
  updateUserRole,
  deleteUser
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, authUser);
router.post('/logout', protect, logoutUser);
router.post('/forgotpassword', authLimiter, forgotPassword);
router.put('/resetpassword/:resettoken', authLimiter, resetPassword);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/address')
  .post(protect, addAddress);

router.route('/address/:id')
  .delete(protect, deleteAddress);

// Admin user management routes
router.route('/users')
  .get(protect, admin, getAllUsers);

router.route('/users/:id')
  .delete(protect, admin, deleteUser);

router.route('/users/:id/role')
  .put(protect, admin, updateUserRole);

export default router;

