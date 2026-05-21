import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getOrders);

router.route('/checkout-session')
  .post(protect, createRazorpayOrder);

router.route('/verify')
  .post(protect, verifyRazorpayPayment);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

export default router;
