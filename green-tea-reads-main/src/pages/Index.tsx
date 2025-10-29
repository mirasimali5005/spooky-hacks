import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import FloatingElements from "@/components/FloatingElements";
import MatchaMosaicGenerator from "@/components/MatchaMosaicGenerator";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <FloatingElements />
      <Hero />
      <MatchaMosaicGenerator />
      <Features />
      <Footer />
    </div>
  );
};

export default Index;
