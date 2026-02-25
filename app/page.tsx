import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PainPoint from "@/components/PainPoint";
import SkillsGrid from "@/components/SkillsGrid";
import WhyItWorks from "@/components/WhyItWorks";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
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
