import { CategoryIcon } from './icons';

const categoryLabels: Record<string, string> = {
  'ai-literacy': 'AI & Digital Literacy',
  'creativity-anywhere': 'Creativity Anywhere',
  'communication-writing': 'Communication & Writing',
  'outdoor-learning': 'Outdoor Learning',
  'real-world-math': 'Real-World Math',
  'entrepreneurship': 'Entrepreneurship',
  'planning-problem-solving': 'Planning & Problem-Solving',
  'start-here': 'Start Here',
  bundle: 'Bundles',
};

const categoryDescriptions: Record<string, string> = {
  'ai-literacy': 'Responsible tech, critical thinking about AI, and digital citizenship.',
  'creativity-anywhere': 'Open-ended projects that build design thinking and creative confidence.',
  'communication-writing': 'Real-world writing and communication skills for kids who have something to say.',
  'outdoor-learning': 'Turn your backyard, park, or trail into a hands-on learning space.',
  'real-world-math': 'Budgeting, shopping math, fractions in the kitchen, and financial thinking.',
  'entrepreneurship': 'Plan, launch, and run real projects \u2014 from lemonade stands to micro-businesses.',
  'planning-problem-solving': 'Tackle real logistics, plan adventures, and solve problems that actually matter.',
  'start-here': 'The foundation for your learning journey \u2014 start with the big picture.',
  bundle: 'Get more value with curated activity pack bundles.',
};

const categoryBgColors: Record<string, string> = {
  'ai-literacy': 'from-[#7b88a8]/[0.08]',
  'creativity-anywhere': 'from-[#c47a8f]/20 to-[#d4a0b0]/10',
  'communication-writing': 'from-[#5b8fa8]/20 to-[#7dafc2]/10',
  'outdoor-learning': 'from-[#588157]/20 to-[#6b9e6b]/10',
  'real-world-math': 'from-[#8b7355]/[0.08]',
  'entrepreneurship': 'from-[#c4836a]/20 to-[#d9a08a]/10',
  'planning-problem-solving': 'from-[#7a6da8]/20 to-[#9a90be]/10',
  'start-here': 'from-[#d4a373]/20 to-[#e8c99a]/10',
  bundle: 'from-[#d4a373]/[0.08]',
};

const categoryIconColors: Record<string, string> = {
  'ai-literacy': 'text-[#7b88a8]',
  'creativity-anywhere': 'text-[#c47a8f]',
  'communication-writing': 'text-[#5b8fa8]',
  'outdoor-learning': 'text-[#588157]',
  'real-world-math': 'text-[#8b7355]',
  'entrepreneurship': 'text-[#c4836a]',
  'planning-problem-solving': 'text-[#7a6da8]',
  'start-here': 'text-[#d4a373]',
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
