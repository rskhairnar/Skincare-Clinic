// store/doctorStore.js

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/lib/api";

export const useDoctorStore = create(
  devtools(
    (set, get) => ({
      // State
      doctors: [],
      selectedDoctor: null,
      loading: false,
      error: null,

      // Pagination
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalDoctors: 0,
        limit: 10,
      },

      // Filters
      filters: {
        search: "",
        status: "all",
        specializationId: "all",
      },

      // UI State
      isFormOpen: false,
      showFilters: false,

      // Specializations
      specializations: [],
      specializationsLoading: false,

      // Stats
      getStats: () => {
        const { doctors, pagination } = get();
        return {
          total: pagination.totalDoctors,
          active: doctors.filter((d) => d.status === "ACTIVE").length,
          inactive: doctors.filter((d) => d.status === "INACTIVE").length,
        };
      },

      // Fetch Specializations
      fetchSpecializations: async () => {
        set({ specializationsLoading: true });

        try {
          const response = await api.get('/specializations?all=true');
          set({
            specializations: response.data.specializations || [],
            specializationsLoading: false,
          });
          return { success: true };
        } catch (error) {
          console.error("Failed to fetch specializations:", error);
          set({ specializationsLoading: false });
          return { success: false };
        }
      },

      // Fetch Doctors
      fetchDoctors: async () => {
        const { pagination, filters } = get();
        set({ loading: true, error: null });

        try {
          const params = new URLSearchParams({
            page: pagination.currentPage.toString(),
            limit: pagination.limit.toString(),
          });

          if (filters.search) params.append("search", filters.search);
          if (filters.status !== "all") params.append("status", filters.status);
          if (filters.specializationId !== "all") {
            params.append("specializationId", filters.specializationId);
          }

          const response = await api.get(`/doctors?${params}`);

          set({
            doctors: response.data.doctors,
            pagination: {
              ...pagination,
              totalPages: response.data.pagination.totalPages,
              totalDoctors: response.data.pagination.total,
            },
            loading: false,
          });

          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || "Failed to fetch doctors";
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Create Doctor
      createDoctor: async (formData) => {
        set({ loading: true, error: null });

        try {
          const response = await api.post('/doctors', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          await get().fetchDoctors();

          set({ loading: false, isFormOpen: false, selectedDoctor: null });
          return { success: true, doctor: response.data };
        } catch (error) {
          const errorMessage = error.response?.data?.error || "Failed to create doctor";
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Update Doctor
      updateDoctor: async (id, formData) => {
        set({ loading: true, error: null });

        try {
          const response = await api.put(`/doctors/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          await get().fetchDoctors();

          set({ loading: false, isFormOpen: false, selectedDoctor: null });
          return { success: true, doctor: response.data };
        } catch (error) {
          const errorMessage = error.response?.data?.error || "Failed to update doctor";
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Delete Doctor
      deleteDoctor: async (id) => {
        set({ loading: true, error: null });

        try {
          await api.delete(`/doctors/${id}`);

          set((state) => ({
            doctors: state.doctors.filter((doctor) => doctor.id !== id),
            pagination: {
              ...state.pagination,
              totalDoctors: state.pagination.totalDoctors - 1,
            },
            loading: false,
          }));

          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || "Failed to delete doctor";
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Pagination & Filter Actions
      setPage: (page) => {
        set((state) => ({
          pagination: { ...state.pagination, currentPage: page },
        }));
      },

      setSearch: (search) => {
        set((state) => ({
          filters: { ...state.filters, search },
          pagination: { ...state.pagination, currentPage: 1 },
        }));
      },

      setStatusFilter: (status) => {
        set((state) => ({
          filters: { ...state.filters, status },
          pagination: { ...state.pagination, currentPage: 1 },
        }));
      },

      setSpecializationFilter: (specializationId) => {
        set((state) => ({
          filters: { ...state.filters, specializationId },
          pagination: { ...state.pagination, currentPage: 1 },
        }));
      },

      clearFilters: () => {
        set((state) => ({
          filters: { search: "", status: "all", specializationId: "all" },
          pagination: { ...state.pagination, currentPage: 1 },
        }));
      },

      hasActiveFilters: () => {
        const { filters } = get();
        return (
          filters.search !== "" ||
          filters.status !== "all" ||
          filters.specializationId !== "all"
        );
      },

      // UI Actions
      openForm: (doctor = null) => {
        set({ isFormOpen: true, selectedDoctor: doctor });
      },

      closeForm: () => {
        set({ isFormOpen: false, selectedDoctor: null });
      },

      toggleFilters: () => {
        set((state) => ({ showFilters: !state.showFilters }));
      },

      reset: () => {
        set({
          doctors: [],
          selectedDoctor: null,
          loading: false,
          error: null,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalDoctors: 0,
            limit: 10,
          },
          filters: { search: "", status: "all", specializationId: "all" },
          isFormOpen: false,
          showFilters: false,
          specializations: [],
        });
      },
    }),
    { name: "doctor-store" }
  )
);