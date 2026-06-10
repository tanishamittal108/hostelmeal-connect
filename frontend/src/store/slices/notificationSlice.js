import { createSlice } from '@reduxjs/toolkit';
const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0 },
  reducers: {
    setNotifications: (state, action) => { state.items = action.payload.notifications; state.unreadCount = action.payload.unreadCount; },
    addNotification: (state, action) => { state.items.unshift(action.payload); state.unreadCount += 1; },
    markAllRead: (state) => { state.items = state.items.map(n => ({ ...n, isRead: true })); state.unreadCount = 0; },
  },
});
export const { setNotifications, addNotification, markAllRead } = notificationSlice.actions;
export default notificationSlice.reducer;
