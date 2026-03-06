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
    <div className="space-y-4">
      {testimonials.map((t, i) => (
        <blockquote
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <span className="text-gold text-sm tracking-wide">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
          <p className="mt-2 text-gray-700 leading-relaxed">
            &ldquo;{t.quote}&rdquo;
          </p>
          <footer className="mt-3 text-sm text-gray-500">
            &mdash; {t.name}, {t.location}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
