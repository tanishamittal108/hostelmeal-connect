import { createSlice } from '@reduxjs/toolkit';
const uiSlice = createSlice({
  name: 'ui',
  initialState: { darkMode: localStorage.getItem('darkMode') === 'true', sidebarOpen: false, mobileMenuOpen: false },
  reducers: {
    toggleDarkMode: (state) => { state.darkMode = !state.darkMode; localStorage.setItem('darkMode', state.darkMode); document.documentElement.classList.toggle('dark', state.darkMode); },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    closeMobileMenu: (state) => { state.mobileMenuOpen = false; },
  },
});
export const { toggleDarkMode, toggleSidebar, toggleMobileMenu, closeMobileMenu } = uiSlice.actions;
export default uiSlice.reducer;
