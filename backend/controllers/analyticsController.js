import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get dashboard summary metrics (total sales, count of users, orders, products)
// @route   GET /api/analytics/summary
// @access  Private/Admin
export const getDashboardSummary = asyncHandler(async (req, res) => {
  // Count Metrics
  const usersCount = await User.countDocuments({ role: 'user' });
  const productsCount = await Product.countDocuments({});
  const ordersCount = await Order.countDocuments({});

  // Aggregation for Total Sales
  const salesAggregate = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$pricing.totalPrice' }
      }
    }
  ]);

  const totalSales = salesAggregate.length > 0 ? salesAggregate[0].totalSales : 0;

  // Products with low inventory (less than 5 units)
  const lowInventoryProducts = await Product.find({ inventory: { $lt: 5 } })
    .populate('category', 'name')
    .select('name inventory price');

  // Recent 5 orders
  const recentOrders = await Order.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    usersCount,
    productsCount,
    ordersCount,
    totalSales: Math.round(totalSales * 100) / 100,
    lowInventoryProducts,
    recentOrders
  });
});

// @desc    Get sales history grouped by date (last 30 days) for charts
// @route   GET /api/analytics/sales-chart
// @access  Private/Admin
export const getSalesChartData = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const salesData = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        sales: { $sum: '$pricing.totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json(salesData);
});

// @desc    Get category sales distribution for pie charts
// @route   GET /api/analytics/category-distribution
// @access  Private/Admin
export const getCategoryDistribution = asyncHandler(async (req, res) => {
  const categorySales = await Order.aggregate([
    { $match: { isPaid: true } },
    { $unwind: '$orderItems' },
    {
      $lookup: {
        from: 'products',
        localField: 'orderItems.product',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' },
    {
      $lookup: {
        from: 'categories',
        localField: 'productDetails.category',
        foreignField: '_id',
        as: 'categoryDetails'
      }
    },
    { $unwind: '$categoryDetails' },
    {
      $group: {
        _id: '$categoryDetails.name',
        value: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
      }
    },
    { $sort: { value: -1 } }
  ]);

  res.json(categorySales);
});
