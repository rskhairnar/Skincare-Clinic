'use client';

import { useAuthStore } from '@/store/authStore';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import DoctorDashboard from '@/components/dashboard/DoctorDashboard';

export const dynamic = 'force-dynamic';


export default function DashboardPage() {
  const { user } = useAuthStore();

  if (user?.role === 'SUPER_ADMIN') {
    return <AdminDashboard />;
  }

  return <DoctorDashboard />;
}