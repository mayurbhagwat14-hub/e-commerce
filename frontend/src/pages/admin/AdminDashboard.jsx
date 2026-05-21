import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adminFetchAllOrders, adminUpdateOrderStatus } from '../../features/orders/orderSlice';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { IndianRupee, ShoppingCart, Users, Package, AlertTriangle, PlayCircle } from 'lucide-react';
import api from '../../utils/axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { allOrders, loading: ordersLoading } = useSelector((state) => state.orders);

  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    dailySales: [],
    categoryCounts: [],
    lowInventoryProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(adminFetchAllOrders());
    fetchAnalytics();
  }, [dispatch]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/analytics');
      setAnalytics(data);
    } catch (err) {
      toast.error('Failed to load dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'Processing' ? 'Delivered' : 'Processing';
    try {
      await dispatch(adminUpdateOrderStatus({ orderId, status: nextStatus })).unwrap();
      toast.success(`Order marked as ${nextStatus}`);
      dispatch(adminFetchAllOrders()); // Refresh list
    } catch (err) {
      toast.error(err || 'Failed to update order status');
    }
  };

  // Prepping Chart Data
  const salesChartData = analytics.dailySales?.map(item => ({
    date: new Date(item._id).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    sales: item.sales
  })) || [];

  const pieColors = ['#7C3AED', '#06B6D4', '#F59E0B', '#10B981', '#EC4899'];
  const pieData = analytics.categoryCounts?.map(item => ({
    name: item.categoryName || 'Unknown',
    value: item.count
  })) || [];

  return (
    <div className="py-6 flex flex-col md:flex-row gap-8 items-start">
      <AdminSidebar />

      <main className="flex-1 space-y-8 w-full">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time metrics, product distribution, and sales analytics charts.</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-24 bg-slate-800 rounded-2xl w-full"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-900/30 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xxs text-slate-400 uppercase tracking-wider font-semibold">Total Revenue</span>
                <h3 className="text-lg font-extrabold text-white">₹{analytics.totalSales.toLocaleString('en-IN')}</h3>
              </div>
              <div className="p-3 bg-primary/15 text-primary rounded-xl"><IndianRupee className="h-5 w-5" /></div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-900/30 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xxs text-slate-400 uppercase tracking-wider font-semibold">Total Orders</span>
                <h3 className="text-lg font-extrabold text-white">{analytics.totalOrders}</h3>
              </div>
              <div className="p-3 bg-secondary/15 text-secondary rounded-xl"><ShoppingCart className="h-5 w-5" /></div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-900/30 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xxs text-slate-400 uppercase tracking-wider font-semibold">Customers</span>
                <h3 className="text-lg font-extrabold text-white">{analytics.totalUsers}</h3>
              </div>
              <div className="p-3 bg-accent/15 text-accent rounded-xl"><Users className="h-5 w-5" /></div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-900/30 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xxs text-slate-400 uppercase tracking-wider font-semibold">Products catalog</span>
                <h3 className="text-lg font-extrabold text-white">{analytics.totalProducts}</h3>
              </div>
              <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl"><Package className="h-5 w-5" /></div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales history Line Chart */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/30 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Revenue History (Daily Sales)</h3>
              <div className="h-64">
                {salesChartData.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-20">No sales transactions documented yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff14', color: '#fff', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="sales" stroke="#7C3AED" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Category distribution Pie Chart */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/30 space-y-4 flex flex-col justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Product Categories</h3>
              <div className="h-48 relative flex items-center justify-center">
                {pieData.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center">No categories mapped.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff14', color: '#fff', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              {/* Pie Legends */}
              <div className="flex flex-wrap gap-2 justify-center">
                {pieData.map((item, idx) => (
                  <span key={item.name} className="flex items-center text-[10px] font-semibold text-slate-300">
                    <span className="h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: pieColors[idx % pieColors.length] }}></span>
                    {item.name} ({item.value})
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Low Inventory Warnings & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Low inventory alert feeds */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-900/30 space-y-4">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center">
              <AlertTriangle className="h-4.5 w-4.5 mr-1.5" /> Inventory Alerts
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {analytics.lowInventoryProducts?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">All catalog items have healthy inventory.</p>
              ) : (
                analytics.lowInventoryProducts?.map((prod) => (
                  <div key={prod._id} className="p-3 rounded-xl border border-red-500/15 bg-red-500/5 flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <span className="text-xxs font-bold text-white line-clamp-1 max-w-[150px]">{prod.name}</span>
                      <span className="text-[10px] text-slate-400">Category: {prod.category?.name || 'Curated'}</span>
                    </div>
                    <span className="text-xxs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg">
                      {prod.inventory} Left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Orders Tracking and Status updates */}
          <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-white/5 bg-slate-900/30 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Orders Operations</h3>
            <div className="overflow-x-auto">
              {allOrders.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10">No orders documented yet.</p>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400">
                      <th className="py-2.5 font-bold uppercase">Order ID</th>
                      <th className="py-2.5 font-bold uppercase">Customer</th>
                      <th className="py-2.5 font-bold uppercase">Total Price</th>
                      <th className="py-2.5 font-bold uppercase">Status</th>
                      <th className="py-2.5 font-bold uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.slice(0, 5).map((order) => (
                      <tr key={order._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-mono font-bold text-white">#{order._id.slice(-6)}</td>
                        <td className="py-3 text-slate-300 font-medium">{order.shippingAddress?.name || 'Customer'}</td>
                        <td className="py-3 text-slate-200 font-semibold">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${order.orderStatus === 'Delivered' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleUpdateStatus(order._id, order.orderStatus)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xxs font-bold text-white rounded-lg transition-colors"
                          >
                            Toggle Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
