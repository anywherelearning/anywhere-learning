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
  title: '7 Days of Real-World Learning \u2014 Free Guide',
  description:
    'A free, low-prep activity guide for families who love hands-on, real-world learning. One activity a day. A few hours each. Zero worksheets.',
  alternates: {
    canonical: 'https://anywherelearning.co/free-guide',
  },
  openGraph: {
    title: '7 Days of Real-World Learning | Free Guide',
    description:
      'A free, low-prep activity guide for families who love hands-on, real-world learning. One activity a day. A few hours each. Zero worksheets.',
    url: 'https://anywherelearning.co/free-guide',
    type: 'website',
    images: [
      {
        url: 'https://anywherelearning.co/images/free-guide-og.jpg',
        width: 1200,
        height: 630,
        alt: '7 Days of Real-World Learning Free Guide | Anywhere Learning',
      },
    ],
  },
};

const freeGuideLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: '7 Days of Real-World Learning',
  description:
    'A free, low-prep activity guide with 7 hands-on activities for families \u2014 outdoor & nature, real-world math, creativity, AI & digital, entrepreneurship, communication, and planning. Ages 6\u201314.',
  image: 'https://anywherelearning.co/images/free-guide-og.jpg',
  url: 'https://anywherelearning.co/free-guide',
  brand: {
    '@type': 'Organization',
    name: 'Anywhere Learning',
  },
  author: {
    '@type': 'Person',
    name: 'Amelie',
    jobTitle: 'Former Teacher & Founder',
    url: 'https://anywherelearning.co/about',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
};

export default function FreeGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(freeGuideLd) }}
      />
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
