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
          className="bg-white rounded-2xl border border-gray-100/50 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="text-gray-700 italic mb-2 leading-relaxed">
            &ldquo;{t.quote}&rdquo;
          </p>
          <footer className="text-sm text-gray-500">
            &mdash; {t.name}, {t.location}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
