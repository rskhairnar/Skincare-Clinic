import PatientList from '@/components/patients/PatientList';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PatientsPage() {
  return <PatientList />;
}