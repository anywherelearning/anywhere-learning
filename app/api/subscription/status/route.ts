import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getActiveSubscription } from '@/lib/subscription';

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ active: false });
  }

  const sub = await getActiveSubscription(clerkId);

  if (!sub) {
    return NextResponse.json({ active: false });
  }

  return NextResponse.json({
    active: true,
    currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
  });
}
