'use client';

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-[15px] font-semibold text-cream transition hover:bg-forest-dark"
    >
      Print the card
    </button>
  );
}
