import { createSlice } from '@reduxjs/toolkit';
const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], providerId: null, couponCode: null, couponDiscount: 0 },
  reducers: {
    addItem: (state, action) => { const { item, providerId } = action.payload; if (state.providerId && state.providerId !== providerId) { state.items = []; state.couponCode = null; state.couponDiscount = 0; } state.providerId = providerId; const existing = state.items.find(i => i._id === item._id); if (existing) existing.quantity += 1; else state.items.push({ ...item, quantity: 1 }); },
    removeItem: (state, action) => { state.items = state.items.filter(i => i._id !== action.payload); if (state.items.length === 0) state.providerId = null; },
    clearCart: (state) => { state.items = []; state.providerId = null; state.couponCode = null; state.couponDiscount = 0; },
    applyCoupon: (state, action) => { state.couponCode = action.payload.code; state.couponDiscount = action.payload.discount; },
    removeCoupon: (state) => { state.couponCode = null; state.couponDiscount = 0; },
  },
});
export const { addItem, removeItem, clearCart, applyCoupon, removeCoupon } = cartSlice.actions;
export default cartSlice.reducer;
