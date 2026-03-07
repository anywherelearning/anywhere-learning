import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PainPoint from '@/components/PainPoint';
import SkillsGrid from '@/components/SkillsGrid';
import WhyItWorks from '@/components/WhyItWorks';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '10 Life Skills Your Kids Can Learn This Week \u2014 Free Guide',
  description:
    'A free, no-prep activity guide for homeschool and worldschool families. Download 10 real-world life skills activities your kids can try this week.',
  alternates: {
    canonical: 'https://anywherelearning.co/free-guide',
  },
  openGraph: {
    title: '10 Life Skills Your Kids Can Learn This Week — Free Guide',
    description:
      'A free, no-prep activity guide for homeschool and worldschool families. Download 10 real-world life skills activities your kids can try this week.',
    url: 'https://anywherelearning.co/free-guide',
    type: 'website',
    images: [
      {
        url: 'https://anywherelearning.co/og-default.png',
        width: 1200,
        height: 630,
        alt: '10 Life Skills Free Guide — Anywhere Learning',
      },
    ],
  },
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
