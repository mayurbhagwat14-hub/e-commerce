import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../features/orders/orderSlice';
import { ShoppingBag, ChevronRight, Eye, Calendar, MapPin, ExternalLink, Receipt } from 'lucide-react';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

export const Orders = () => {
  const dispatch = useDispatch();
  const { myOrders, loading } = useSelector((state) => state.orders);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <div className="py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center">
          <ShoppingBag className="h-6 w-6 mr-2 text-primary" /> Order History
        </h1>
        <p className="text-xs text-slate-400 mt-1">Review your invoices, shipping statuses, and order details.</p>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : myOrders.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/5 max-w-md mx-auto">
          <ShoppingBag className="h-10 w-10 mx-auto text-slate-500 mb-4" />
          <h3 className="text-lg font-bold text-white">No Orders Placed</h3>
          <p className="text-xs text-slate-400 mt-1">You haven't purchased anything yet. Take a look at our shop!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Orders Table/List */}
          <div className="lg:col-span-2 space-y-4">
            {myOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className={`glass-panel p-5 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${selectedOrder?._id === order._id ? 'border-primary bg-primary/10' : 'border-white/5 bg-slate-900/20 hover:border-white/10'}`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Order #{order._id.slice(-6)}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${order.orderStatus === 'Delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Invoice</span>
                    <span className="text-sm font-extrabold text-white">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500" />
                </div>
              </div>
            ))}
          </div>

          {/* Inline Detail panel */}
          <div className="lg:sticky lg:top-20">
            {selectedOrder ? (
              <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/30 space-y-6">
                <div className="border-b border-white/5 pb-3">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
                    <Receipt className="h-4.5 w-4.5 mr-2 text-primary" /> Invoice Details
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-1">Order ID: {selectedOrder._id}</p>
                </div>

                {/* Items details */}
                <div className="space-y-3">
                  <h3 className="text-xxs text-slate-500 uppercase tracking-wider font-bold">Items Purchased</h3>
                  <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                    {selectedOrder.orderItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center gap-3">
                        <div className="flex items-center space-x-2.5">
                          <img src={item.image} alt="" className="h-9 w-9 rounded-lg object-cover bg-slate-950/20" />
                          <div className="flex flex-col">
                            <span className="text-xxs font-bold text-white line-clamp-1 max-w-[120px]">{item.name}</span>
                            <span className="text-[10px] text-slate-400">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-200">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery details */}
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <h3 className="text-xxs text-slate-500 uppercase tracking-wider font-bold">Shipping Address</h3>
                  <div className="flex items-start space-x-2 text-xs">
                    <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xxs text-slate-300 font-semibold">{selectedOrder.shippingAddress.name}</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zipCode}
                      </p>
                      <p className="text-[9px] text-slate-500">Phone: {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Payment verification */}
                <div className="border-t border-white/5 pt-4 space-y-2 text-xxs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction ID</span>
                    <span className="text-slate-300 truncate max-w-[150px] font-mono">{selectedOrder.paymentInfo.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Status</span>
                    <span className="text-green-400 font-bold uppercase">{selectedOrder.paymentInfo.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shipping Mode</span>
                    <span className="text-slate-300">Standard Express</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/30 text-center py-12 text-slate-400 text-xs">
                Select an order from the list to view its complete invoice details, transaction IDs, and delivery addresses.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
