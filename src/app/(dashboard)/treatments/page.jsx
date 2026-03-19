import TreatmentList from '@/components/treatments/TreatmentList';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function TreatmentsPage() {
  return <TreatmentList />;
}