import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Phone, Star, X, Loader2, CheckCircle, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '../../services/api';
import { StatusBadge, Modal } from '../../components/common/index';
import { format } from 'date-fns';

const STEPS = ['placed', 'accepted', 'preparing', 'ready', 'picked_up', 'out_for_delivery', 'delivered'];
const STEP_LABELS = { placed: 'Order Placed', accepted: 'Accepted', preparing: 'Preparing', ready: 'Ready', picked_up: 'Picked Up', out_for_delivery: 'On the Way', delivered: 'Delivered' };
const STEP_ICONS = { placed: '📋', accepted: '✅', preparing: '👨‍🍳', ready: '📦', picked_up: '🛵', out_for_delivery: '🚀', delivered: '🎉' };

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCancel, setShowCancel] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderAPI.getOrder(id).then(r => r.data.data),
    refetchInterval: 30000,
  });

  const cancelMutation = useMutation({
    mutationFn: (reason) => orderAPI.cancelOrder(id, reason),
    onSuccess: () => {
      toast.success('Order cancelled. Refund initiated!');
      queryClient.invalidateQueries(['order', id]);
      setShowCancel(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Cannot cancel now'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    );
  }

  const order = orderData;
  if (!order) return <div className="text-center py-20 text-gray-400">Order not found</div>;

  const currentStepIndex = STEPS.indexOf(order.status);
  const canCancel = ['placed', 'accepted'].includes(order.status);
  const isDelivered = order.status === 'delivered';

  return (
    <div>
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Orders
      </button>

      {/* Header */}
      <div className="card p-5 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">#{order.orderNumber}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{format(new Date(order.createdAt), 'EEEE, dd MMM yyyy • hh:mm a')}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Progress Steps */}
        {order.status !== 'cancelled' && order.status !== 'rejected' && (
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 min-w-max pb-2">
              {STEPS.map((step, i) => {
                const done = i <= currentStepIndex;
                const active = i === currentStepIndex;
                return (
                  <React.Fragment key={step}>
                    <div className={`flex flex-col items-center gap-1 ${done ? 'opacity-100' : 'opacity-30'}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all ${
                        active ? 'bg-primary-500 shadow-glow scale-110' :
                        done ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        {STEP_ICONS[step]}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{STEP_LABELS[step]}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 min-w-[20px] rounded-full transition-all ${i < currentStepIndex ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">🍱 Order Items</h3>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{item.type?.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{item.price * item.quantity}</p>
                    <p className="text-xs text-gray-400">×{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📍 Delivery Address</h3>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-primary-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{order.deliveryAddress.hostelName}</p>
                  {order.deliveryAddress.roomNumber && <p className="text-sm text-gray-500">Room {order.deliveryAddress.roomNumber}</p>}
                  {order.deliveryAddress.street && <p className="text-sm text-gray-500">{order.deliveryAddress.street}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📝 Special Instructions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{order.specialInstructions}</p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Price Breakdown */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">💰 Bill Summary</h3>
            <div className="space-y-2">
              {[
                { label: 'Subtotal', value: `₹${order.subtotal}` },
                { label: 'Delivery', value: `₹${order.deliveryCharge}` },
                { label: 'Platform Fee', value: `₹${order.platformFee}` },
                ...(order.couponDiscount > 0 ? [{ label: `Coupon (${order.couponCode})`, value: `-₹${order.couponDiscount}`, green: true }] : []),
              ].map(({ label, value, green }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className={green ? 'text-green-600 font-medium' : 'text-gray-700 dark:text-gray-300'}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-primary-600">₹{order.totalAmount}</span>
              </div>
            </div>
            <div className="mt-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Payment</span>
                <span className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentMethod} • {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Provider */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">👨‍🍳 Provider</h3>
            <p className="font-medium text-gray-900 dark:text-white">{order.provider?.businessName}</p>
            {order.provider?.user?.phone && (
              <a href={`tel:${order.provider.user.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline mt-2">
                <Phone size={14} /> {order.provider.user.phone}
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {['out_for_delivery', 'preparing', 'ready'].includes(order.status) && (
              <Link to={`/student/orders/${id}/track`} className="btn-primary w-full flex items-center justify-center gap-2">
                <Navigation size={16} /> Track Order
              </Link>
            )}
            {isDelivered && !order.isRated && (
              <button onClick={() => setShowReview(true)} className="btn-primary w-full flex items-center justify-center gap-2">
                <Star size={16} /> Rate & Review
              </button>
            )}
            {canCancel && (
              <button onClick={() => setShowCancel(true)} className="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                <X size={15} /> Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={showCancel} onClose={() => setShowCancel(false)} title="Cancel Order?">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Your payment of ₹{order.totalAmount} will be refunded to your wallet.</p>
        <div className="flex gap-3">
          <button onClick={() => setShowCancel(false)} className="btn-secondary flex-1">Keep Order</button>
          <button onClick={() => cancelMutation.mutate('Cancelled by student')} disabled={cancelMutation.isPending}
            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
            {cancelMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
            Cancel Order
          </button>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={showReview} onClose={() => setShowReview(false)} title="Rate Your Experience">
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">How was the food?</p>
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)}
                  className={`text-3xl transition-transform hover:scale-110 ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea value={review} onChange={e => setReview(e.target.value)} rows={3}
            placeholder="Share your experience with this meal..." className="input-field resize-none" />
          <button className="btn-primary w-full">Submit Review</button>
        </div>
      </Modal>
    </div>
  );
}
