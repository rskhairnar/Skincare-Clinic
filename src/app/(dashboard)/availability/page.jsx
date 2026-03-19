import AvailabilityManager from '@/components/availability/AvailabilityManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AvailabilityPage() {
  return <AvailabilityManager />;
}