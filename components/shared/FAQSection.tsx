interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  items: FAQItem[];
}

export default function FAQSection({ items }: FAQSectionProps) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <details key={i} className="group bg-white rounded-2xl border border-gray-100/50 overflow-hidden">
          <summary className="flex justify-between items-center p-5 cursor-pointer text-gray-800 font-medium hover:text-forest transition-colors">
            {item.question}
            <span className="text-forest group-open:rotate-45 transition-transform text-xl flex-shrink-0 ml-4">
              +
            </span>
          </summary>
          <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
