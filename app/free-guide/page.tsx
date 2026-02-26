import type { Metadata } from 'next';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PainPoint from '@/components/PainPoint';
import SkillsGrid from '@/components/SkillsGrid';
import WhyItWorks from '@/components/WhyItWorks';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '10 Life Skills Your Kids Can Learn This Week — Free Guide',
  description:
    'A free, no-prep activity guide for homeschool and worldschool families. Download 10 real-world life skills activities your kids can try this week.',
};

export default function FreeGuidePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PainPoint />
        <SkillsGrid />
        <WhyItWorks />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
