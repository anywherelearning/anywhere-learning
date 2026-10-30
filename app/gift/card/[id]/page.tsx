import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GiftCard from '@/components/gift/GiftCard';
import PrintButton from '@/components/gift/PrintButton';
import { getGiftCard } from '@/lib/gift-card';

export const metadata: Metadata = {
  title: 'Your gift card',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * /gift/card/[id]: the printable card for a gift membership, linked from the
 * buyer's receipt email and the thank-you page. Lives outside the (store)
 * group on purpose: no site header or footer, so it prints as just the card.
 */
export default async function GiftCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await getGiftCard(id).catch(() => null);
  if (!card || card.revoked) notFound();

  return (
    <main className="min-h-screen bg-[#F2EFE4] px-4 py-10 print:bg-white print:p-0">
      <div className="mx-auto mb-6 flex max-w-[640px] flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-[15px] text-gray-600">Print it, tuck it in a card, or screenshot it to send.</p>
        <PrintButton />
      </div>
      <GiftCard card={card} />
      <style>{`@page { margin: 14mm; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>
    </main>
  );
}
