import AppointmentList from '@/components/appointments/AppointmentList';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export default function AppointmentsPage() {
  return <AppointmentList />;
}