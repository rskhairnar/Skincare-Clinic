// store/specializationStore.js

import { create } from 'zustand';
import api from '@/lib/api';

export const useSpecializationStore = create((set, get) => ({
  specializations: [],
  specialization: null,
  pagination: null,
  loading: false,
  error: null,

  // Fetch all specializations
  fetchSpecializations: async (params = {}) => {
    set({ loading: true, error: null });
    
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.status && params.status !== 'all') {
        queryParams.append('status', params.status);
      }
      if (params.all) queryParams.append('all', 'true');

      const response = await api.get(`/specializations?${queryParams.toString()}`);

      set({
        specializations: response.data.specializations || [],
        pagination: response.data.pagination,
        loading: false,
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch specializations';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Create specialization
  createSpecialization: async (data) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.post('/specializations', data);

      set((state) => ({
        specializations: [response.data, ...state.specializations],
        loading: false,
      }));

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create specialization';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update specialization
  updateSpecialization: async (id, data) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.put(`/specializations/${id}`, data);

      set((state) => ({
        specializations: state.specializations.map((s) =>
          s.id === id ? response.data : s
        ),
        loading: false,
      }));

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update specialization';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Delete specialization
  deleteSpecialization: async (id) => {
    set({ loading: true, error: null });
    
    try {
      await api.delete(`/specializations/${id}`);

      set((state) => ({
        specializations: state.specializations.filter((s) => s.id !== id),
        loading: false,
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete specialization';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
}));