interface Testimonial {
  quote: string;
  name: string;
  location: string;
}

interface TestimonialBlockProps {
  testimonials: Testimonial[];
}

export default function TestimonialBlock({ testimonials }: TestimonialBlockProps) {
  return (
    <div className="space-y-6">
      {testimonials.map((t, i) => (
        <blockquote
          key={i}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <p className="text-lg leading-relaxed text-gray-700 italic">
            &ldquo;{t.quote}&rdquo;
          </p>
          <footer className="mt-3 text-sm font-semibold text-forest">
            &mdash; {t.name}, {t.location}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
