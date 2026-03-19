import DoctorList from '@/components/doctors/DoctorList';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DoctorsPage() {
  return <DoctorList />;
}