import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag, Tag, Wallet, CreditCard, Trash2, Loader2, Plus, Minus, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI, couponAPI, walletAPI } from '../../services/api';
import { clearCart, applyCoupon, removeCoupon } from '../../store/slices/cartSlice';
import { PageHeader, EmptyState } from '../../components/common/index';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, providerId, couponCode, couponDiscount } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [address, setAddress] = useState({
    hostelName: '', roomNumber: '', street: '', city: 'Kota',
  });

  const { data: walletData } = useQuery({
    queryKey: ['wallet-checkout'],
    queryFn: () => walletAPI.get().then(r => r.data.data),
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = 20;
  const platformFee = 5;
  const total = subtotal + deliveryCharge + platformFee - couponDiscount;

  const applyCouponCode = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await couponAPI.validate(couponInput);
      const coupon = data.data;
      let discount = coupon.type === 'percentage'
        ? Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || 9999)
        : coupon.value;
      dispatch(applyCoupon({ code: coupon.code, discount: Math.round(discount) }));
      toast.success(`Coupon applied! ₹${Math.round(discount)} off 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const orderMutation = useMutation({
    mutationFn: (data) => orderAPI.createOrder(data),
    onSuccess: (res) => {
      const order = res.data.data.order;
      dispatch(clearCart());
      toast.success('Order placed successfully! 🎉');
      navigate(`/student/orders/${order._id}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to place order'),
  });

  const handleOrder = () => {
    if (!address.hostelName) return toast.error('Please enter your hostel name');
    if (paymentMethod === 'wallet' && (walletData?.balance || 0) < total) {
      return toast.error(`Insufficient wallet balance! Available: ₹${walletData?.balance}`);
    }
    orderMutation.mutate({
      providerId,
      items: items.map(i => ({ name: i.name, type: i.type || 'sabji', price: i.price, quantity: i.quantity })),
      paymentMethod,
      deliveryAddress: address,
      couponCode,
      subtotal,
      totalAmount: total,
    });
  };

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Checkout" />
        <EmptyState icon="🛒" title="Your cart is empty"
          description="Go browse providers and add items to your cart"
          action={<a href="/providers" className="btn-primary">Browse Providers</a>} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Checkout" subtitle={`${items.length} item${items.length > 1 ? 's' : ''} in cart`} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Cart + Address */}
        <div className="lg:col-span-2 space-y-5">
          {/* Cart Items */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">🍱 Order Items</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-orange-100 dark:from-primary-900/30 dark:to-orange-900/30 rounded-xl flex items-center justify-center text-lg">
                    🍛
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-gray-400">₹{item.price} each</p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              <MapPin size={16} className="inline text-primary-500 mr-2" />
              Delivery Address
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Hostel Name *</label>
                <input value={address.hostelName} onChange={e => setAddress({ ...address, hostelName: e.target.value })}
                  placeholder="e.g. Shiv Nagar Hostel" className="input-field text-sm" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Room Number</label>
                <input value={address.roomNumber} onChange={e => setAddress({ ...address, roomNumber: e.target.value })}
                  placeholder="e.g. 204" className="input-field text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Street / Area</label>
                <input value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })}
                  placeholder="e.g. Talwandi, Kota" className="input-field text-sm" />
              </div>
            </div>
          </div>

          {/* Coupon */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              <Tag size={16} className="inline text-primary-500 mr-2" />
              Apply Coupon
            </h3>
            {couponCode ? (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-green-700 dark:text-green-400">{couponCode} applied! 🎉</p>
                  <p className="text-xs text-green-600">Saving ₹{couponDiscount}</p>
                </div>
                <button onClick={() => dispatch(removeCoupon())} className="text-red-500 hover:text-red-700 p-1">
                  <Trash2 size={15} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code" className="input-field flex-1 text-sm uppercase" />
                <button onClick={applyCouponCode} disabled={couponLoading || !couponInput}
                  className="btn-primary text-sm px-4 flex items-center gap-2">
                  {couponLoading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                </button>
              </div>
            )}
            <div className="flex gap-2 mt-3 flex-wrap">
              {['WELCOME50', 'FLAT20', 'HOSTEL10'].map(code => (
                <button key={code} onClick={() => setCouponInput(code)}
                  className="text-xs px-2.5 py-1 border border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Summary */}
        <div className="space-y-4">
          {/* Bill Summary */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">💰 Bill Summary</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Subtotal', value: `₹${subtotal}` },
                { label: 'Delivery', value: `₹${deliveryCharge}` },
                { label: 'Platform Fee', value: `₹${platformFee}` },
                ...(couponDiscount > 0 ? [{ label: `Coupon (${couponCode})`, value: `-₹${couponDiscount}`, green: true }] : []),
              ].map(({ label, value, green }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className={green ? 'text-green-600 font-medium' : 'text-gray-700 dark:text-gray-300'}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-primary-600">₹{total}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">💳 Payment</h3>
            <div className="space-y-2">
              {[
                { value: 'wallet', label: 'Wallet', desc: `Balance: ₹${walletData?.balance || 0}`, icon: Wallet },
                { value: 'razorpay', label: 'Razorpay', desc: 'UPI, Card, Netbanking', icon: CreditCard },
                { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when delivered', icon: ShoppingBag },
              ].map(({ value, label, desc, icon: Icon }) => (
                <label key={value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-200'
                }`}>
                  <input type="radio" name="payment" value={value} checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)} className="accent-primary-500" />
                  <Icon size={16} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button onClick={handleOrder} disabled={orderMutation.isPending}
            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
            {orderMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <ShoppingBag size={20} />}
            Place Order • ₹{total}
          </button>
        </div>
      </div>
    </div>
  );
}
