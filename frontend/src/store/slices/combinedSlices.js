// store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode: localStorage.getItem('darkMode') === 'true',
    sidebarOpen: false,
    mobileMenuOpen: false,
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', action.payload);
      document.documentElement.classList.toggle('dark', action.payload);
    },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    closeMobileMenu: (state) => { state.mobileMenuOpen = false; },
  },
});

export const { toggleDarkMode, setDarkMode, toggleSidebar, toggleMobileMenu, closeMobileMenu } = uiSlice.actions;

// store/slices/cartSlice.js  
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    providerId: null,
    couponCode: null,
    couponDiscount: 0,
  },
  reducers: {
    addItem: (state, action) => {
      const { item, providerId } = action.payload;
      if (state.providerId && state.providerId !== providerId) {
        state.items = [];
        state.couponCode = null;
        state.couponDiscount = 0;
      }
      state.providerId = providerId;
      const existing = state.items.find(i => i._id === item._id);
      if (existing) existing.quantity += 1;
      else state.items.push({ ...item, quantity: 1 });
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(i => i._id !== action.payload);
      if (state.items.length === 0) state.providerId = null;
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(i => i._id === id);
      if (item) item.quantity = quantity;
    },
    clearCart: (state) => {
      state.items = [];
      state.providerId = null;
      state.couponCode = null;
      state.couponDiscount = 0;
    },
    applyCoupon: (state, action) => {
      state.couponCode = action.payload.code;
      state.couponDiscount = action.payload.discount;
    },
    removeCoupon: (state) => {
      state.couponCode = null;
      state.couponDiscount = 0;
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart, applyCoupon, removeCoupon } = cartSlice.actions;

// store/slices/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
  },
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
    },
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAllRead: (state) => {
      state.items = state.items.map(n => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
    decrementUnread: (state) => {
      if (state.unreadCount > 0) state.unreadCount -= 1;
    },
  },
});

export const { setNotifications, addNotification, markAllRead, decrementUnread } = notificationSlice.actions;

export default {
  uiReducer: uiSlice.reducer,
  cartReducer: cartSlice.reducer,
  notificationReducer: notificationSlice.reducer,
};
