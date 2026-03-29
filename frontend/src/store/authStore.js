import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,             // { id, name, email, role, company_id, currency }
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, token) => set({
    user,
    accessToken: token,
    isAuthenticated: true,
  }),

  logout: () => set({
    user: null,
    accessToken: null,
    isAuthenticated: false,
  }),

  updateToken: (token) => set({ accessToken: token }),
}));

export default useAuthStore;
