import EmailForm from "./EmailForm";

export default function FinalCTA() {
  return (
    <section className="bg-forest py-16 sm:py-20">
      <div className="mx-auto max-w-xl px-4 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-cream sm:text-4xl">
          Ready to start?
        </h2>
        <p className="mt-4 text-lg text-cream/80">
          Download the free guide and try your first activity this week. No
          curriculum. No worksheets. No prep.
        </p>

        <div className="mt-8">
          <EmailForm variant="dark" />
        </div>
      </div>
    </section>
  );
}
