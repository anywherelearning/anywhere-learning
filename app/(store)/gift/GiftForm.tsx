'use client';

import { useEffect, useState } from 'react';
import { PAPER_SHADOW, Tape } from '@/components/shared/Paper';

/**
 * The /gift order form. Posts straight to /api/checkout/gift, which redirects
 * to Stripe. The only client-side state is the delivery toggle (show the date
 * picker when "on a date" is chosen) and the message counter.
 */
export default function GiftForm({
  priceUsd,
  minDate,
  maxDate,
  messageMax,
  error,
}: {
  priceUsd: number;
  minDate: string;
  maxDate: string;
  messageMax: number;
  error?: string;
}) {
  const [when, setWhen] = useState<'now' | 'date'>('now');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // After a failed checkout the server sends people back with ?error=; bring
  // the message into view instead of leaving them at the top of the page.
  useEffect(() => {
    if (error) document.getElementById('gift-form')?.scrollIntoView({ block: 'start' });
  }, [error]);

  const input =
    'w-full rounded-xl border border-[#D8D4C5] bg-white px-4 py-3 text-[16px] text-gray-900 outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20';
  const label = 'block text-[14px] font-semibold text-forest-dark mb-1.5';

  return (
    <form
      action="/api/checkout/gift"
      method="POST"
      onSubmit={() => setSubmitting(true)}
      className={`relative mx-auto max-w-[620px] bg-white px-6 pb-8 pt-10 sm:px-9 ${PAPER_SHADOW}`}
    >
      <Tape />
      <h2 className="font-display text-[28px] leading-tight text-gray-900">Who is it for?</h2>
      <p className="mt-1.5 text-[15px] text-gray-500">
        The parent gets the gift email. It opens the whole library for their family.
      </p>

      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-[#F6E3DC] px-4 py-3 text-[15px] text-[#7A3D24]">
          {error}
        </p>
      )}

      {/* Honeypot, hidden from people */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="recipientName">Parent&apos;s first name</label>
          <input id="recipientName" name="recipientName" required maxLength={60} autoComplete="off" className={input} placeholder="Sarah" />
        </div>
        <div>
          <label className={label} htmlFor="recipientEmail">Parent&apos;s email</label>
          <input id="recipientEmail" name="recipientEmail" type="email" required autoComplete="off" className={input} placeholder="sarah@example.com" />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="giftFrom">Your name, as they know you</label>
          <input id="giftFrom" name="giftFrom" required maxLength={60} className={input} placeholder="Grandma Jo" />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="giftMessage">
            A note for them <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            id="giftMessage"
            name="giftMessage"
            rows={3}
            maxLength={messageMax}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${input} resize-none`}
            placeholder="For all the adventures ahead. I can't wait to hear what you build first."
          />
          <p className="mt-1 text-right text-[12.5px] text-gray-400">
            {message.length}/{messageMax}
          </p>
        </div>
      </div>

      <fieldset className="mt-2">
        <legend className={label}>When should it arrive?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(['now', 'date'] as const).map((v) => (
            <label
              key={v}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition ${
                when === v ? 'border-forest bg-[#EEF2EC]' : 'border-[#D8D4C5] bg-white hover:border-forest/50'
              }`}
            >
              <input
                type="radio"
                name="when"
                value={v}
                checked={when === v}
                onChange={() => setWhen(v)}
                className="mt-1 accent-[#588157]"
              />
              <span>
                <span className="block text-[15.5px] font-semibold text-gray-900">
                  {v === 'now' ? 'Right away' : 'On a date I choose'}
                </span>
                <span className="block text-[13.5px] text-gray-500">
                  {v === 'now' ? 'They get the email in a few minutes.' : 'A birthday, Christmas morning, the first day of the year.'}
                </span>
              </span>
            </label>
          ))}
        </div>
        {when === 'date' && (
          <div className="mt-4">
            <label className={label} htmlFor="deliverOn">Delivery date</label>
            <input
              id="deliverOn"
              name="deliverOn"
              type="date"
              required
              min={minDate}
              max={maxDate}
              className={`${input} sm:max-w-[260px]`}
            />
            <p className="mt-1.5 text-[13px] text-gray-500">
              It lands in their inbox that morning. Their 12 months start that day, not today.
            </p>
          </div>
        )}
      </fieldset>

      <div className="mt-7 flex flex-wrap items-baseline justify-between gap-2 border-t border-dashed border-[#D8D4C5] pt-5">
        <span className="text-[15px] text-gray-600">12 months of full access, paid once</span>
        <span className="font-display text-[34px] italic leading-none text-forest-dark">${priceUsd}</span>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-forest px-6 py-4 text-[16.5px] font-semibold text-cream shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_10px_24px_-12px_rgba(58,90,64,.5)] transition-all hover:-translate-y-px hover:bg-forest-dark disabled:opacity-70"
      >
        {submitting ? 'Opening secure checkout…' : 'Give a year of adventures'}
        <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20" aria-hidden="true">→</span>
      </button>
      <p className="mt-3 text-center text-[13px] text-gray-500">
        Secure checkout by Stripe. One payment, nothing renews. You get a printable gift card right after.
      </p>
    </form>
  );
}
