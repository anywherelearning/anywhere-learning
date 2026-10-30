import type { GiftCardData } from '@/lib/gift-card';
import { deliveryLabel } from '@/lib/gift';

/**
 * The printable gift card itself. Shared by /gift/card/[id] (print page) and
 * /gift/thanks. Pure markup, sized to print on one page.
 */
export default function GiftCard({ card }: { card: GiftCardData }) {
  const script = { fontFamily: 'var(--font-display), cursive' };
  return (
    <div className="gift-card relative mx-auto w-full max-w-[640px] bg-[#FFFDF8] p-4 shadow-[0_18px_30px_-20px_rgba(45,58,46,0.55)] print:shadow-none sm:p-5">
      <div className="border-[1.5px] border-dashed border-gold px-6 py-9 text-center sm:px-12 sm:py-12">
        <img src="/email-logo-mark.png" alt="" width={44} height={44} className="mx-auto h-11 w-11" />
        <p className="mt-4 text-[12px] font-semibold uppercase tracking-[.22em] text-[#B5803E]">
          {card.recipientName ? `A gift for ${card.recipientName}'s family` : 'A gift for your family'}
        </p>
        <p className="mt-3 font-display text-[clamp(1.9rem,5vw,2.6rem)] leading-tight text-gray-900">
          A year of real-world adventures
        </p>
        <p className="mx-auto mt-3 max-w-[420px] text-[15.5px] leading-relaxed text-gray-600">
          Twelve months of Anywhere Learning: hands-on activities to cook, build, grow, budget and
          invent, together.
        </p>

        {card.giftMessage && (
          <p className="mx-auto mt-7 max-w-[440px] whitespace-pre-line font-display text-[18px] italic leading-relaxed text-gray-800">
            &ldquo;{card.giftMessage}&rdquo;
          </p>
        )}

        <p className="mt-7 text-[13px] uppercase tracking-[.16em] text-gray-400">with love from</p>
        <p className="mt-1 text-[42px] leading-none text-forest-dark" style={script}>
          {card.giftFrom}
        </p>

        <div className="mx-auto mt-8 max-w-[440px] border-t border-dashed border-[#D8D4C5] pt-5 text-[14px] leading-relaxed text-gray-600">
          {card.scheduled ? (
            <>
              Your library opens on <strong className="text-gray-900">{deliveryLabel(card.startsAt)}</strong>.
              Look for an email from Anywhere Learning that morning.
            </>
          ) : (
            <>It&apos;s already waiting in your inbox. Look for an email from Anywhere Learning.</>
          )}
        </div>
      </div>
    </div>
  );
}
