import express from 'express';
import {
  getDashboardSummary,
  getSalesChartData,
  getCategoryDistribution
} from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, admin); // Apply protect & admin to all analytics routes

router.get('/summary', getDashboardSummary);
router.get('/sales-chart', getSalesChartData);
router.get('/category-distribution', getCategoryDistribution);

export default router;
