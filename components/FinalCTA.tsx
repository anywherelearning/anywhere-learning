import EmailForm from "./EmailForm";

export default function FinalCTA() {
  return (
    <section className="bg-forest py-20 md:py-28">
      <div className="mx-auto max-w-2xl px-5 sm:px-8 text-center">
        <h2 className="font-display text-3xl md:text-5xl text-cream mb-4">
          Ready to start?
        </h2>
        <p className="text-lg text-cream/80 leading-relaxed mb-8">
          Download the free guide and try your first activity this week. No
          curriculum. No worksheets. No prep.
        </p>

        <EmailForm variant="dark" />

        <p className="text-cream/50 text-sm mt-4">
          No spam. No fluff. Unsubscribe any time.
        </p>
      </div>
    </section>
  );
}
