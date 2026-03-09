import { CategoryIcon } from './icons';

const categoryLabels: Record<string, string> = {
  'ai-literacy': 'AI & Digital Literacy',
  creativity: 'Creativity',
  'critical-thinking': 'Critical Thinking',
  'life-skills': 'Life Skills',
  literacy: 'Literacy',
  nature: 'Nature & Outdoor',
  'real-world-math': 'Real-World Math & Money',
  'self-management': 'Self-Management',
  bundle: 'Bundles',
};

const categoryDescriptions: Record<string, string> = {
  'ai-literacy': 'Responsible tech, critical thinking about AI, and digital citizenship.',
  creativity: 'Open-ended projects that build design thinking and creative confidence.',
  'critical-thinking': 'Data analysis, business planning, design challenges, and spatial reasoning.',
  'life-skills': 'Cooking, first aid, sewing, repairs \u2014 hands-on skills they\u2019ll use forever.',
  literacy: 'Communication, active listening, interviewing, and writing in the real world.',
  nature: 'Turn your backyard, park, or trail into a hands-on learning space.',
  'real-world-math': 'Budgeting, shopping math, fractions in the kitchen, and financial thinking.',
  'self-management': 'Morning routines, time management, organization, and emotional skills.',
  bundle: 'Get more value with curated activity pack bundles.',
};

const categoryBgColors: Record<string, string> = {
  'ai-literacy': 'from-[#7b88a8]/[0.08]',
  creativity: 'from-[#c47a8f]/[0.08]',
  'critical-thinking': 'from-[#7a6da8]/[0.08]',
  'life-skills': 'from-[#6b8e8b]/[0.08]',
  literacy: 'from-[#5b8fa8]/[0.08]',
  nature: 'from-[#588157]/[0.08]',
  'real-world-math': 'from-[#8b7355]/[0.08]',
  'self-management': 'from-[#b07d4b]/[0.08]',
  bundle: 'from-[#d4a373]/[0.08]',
};

const categoryIconColors: Record<string, string> = {
  'ai-literacy': 'text-[#7b88a8]',
  creativity: 'text-[#c47a8f]',
  'critical-thinking': 'text-[#7a6da8]',
  'life-skills': 'text-[#6b8e8b]',
  literacy: 'text-[#5b8fa8]',
  nature: 'text-forest',
  'real-world-math': 'text-[#8b7355]',
  'self-management': 'text-[#b07d4b]',
  bundle: 'text-gold',
};

interface CategoryHeroProps {
  category: string;
  productCount: number;
}

export default function CategoryHero({ category, productCount }: CategoryHeroProps) {
  const label = categoryLabels[category] || category;
  const description = categoryDescriptions[category] || '';
  const bgColor = categoryBgColors[category] || 'from-forest/[0.08]';
  const iconColor = categoryIconColors[category] || 'text-forest';

  return (
    <section className={`relative py-10 sm:py-14 overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-b ${bgColor} to-cream`} aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 text-center">
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 mb-4 ${iconColor}`}>
          <CategoryIcon category={category} className="w-7 h-7" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-forest mb-2">
          {label}
        </h1>
        <p className="text-gray-500 text-lg mb-1">{description}</p>
        <p className="text-sm text-gray-400">{productCount} activity {productCount === 1 ? 'pack' : 'packs'}</p>
      </div>
    </section>
  );
}
