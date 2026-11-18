import { NextResponse } from 'next/server';
import { normalizePlz } from '@/lib/delivery';
import { availabilityForPlz } from '@/lib/orders';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const plz = normalizePlz(new URL(request.url).searchParams.get('plz'));
  if (!plz) return NextResponse.json({ error: 'Bitte gib eine fünfstellige Postleitzahl ein.' }, { status: 400 });
  const result = await availabilityForPlz(plz);
  if (!result) return NextResponse.json({ plz, zoneId: null });
  return NextResponse.json({ plz, ...result });
}
