import { NextResponse } from 'next/server';
import { getDashboardTier } from '@/lib/dashboard-access';

export const runtime = 'nodejs';

export async function GET() {
  const tier = await getDashboardTier();
  return NextResponse.json({ tier, isMember: tier === 'member' });
}
