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
      <div className="mx-auto mb-8 flex max-w-[1000px] flex-wrap items-start justify-between gap-4 print:hidden">
        <div className="max-w-[560px] text-[15px] leading-relaxed text-gray-600">
          <p className="font-semibold text-gray-900">Prints as a little folded card on one sheet.</p>
          <p className="mt-1">
            Fold the sheet in half across the middle, so the upside-down half is on the outside. Then fold it in
            half again like a book, with the leaf wreath on the front.
          </p>
        </div>
        <PrintButton />
      </div>
      <GiftCard card={card} />
    </main>
  );
}
