import EmailForm from '@/components/EmailForm';

export default function BlogNewsletterCTA() {
  return (
    <div className="bg-forest-section rounded-3xl p-8 md:p-12 shadow-xl">
      <div className="max-w-lg mx-auto text-center">
        <h3 className="font-display text-2xl md:text-3xl text-cream mb-3">
          Get Inspiration Delivered
        </h3>
        <p className="text-cream/50 mb-6 text-sm md:text-base">
          Practical ideas, encouragement, and real-world learning tips, only
          when we have something worth sharing. No spam. Unsubscribe anytime.
        </p>
        <EmailForm variant="dark" buttonText="Subscribe" successHeading="You're in! Welcome to the list." successBody="You'll hear from us when we have something worth sharing." />
      </div>
    </div>
  );
}
