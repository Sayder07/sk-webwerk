import type { Metadata } from 'next';
import { DeliveryPicker } from '@/components/DeliveryPicker';

export const metadata: Metadata = { title: 'Lieferung wählen' };

export default function DeliveryPage() {
  return <DeliveryPicker />;
}
