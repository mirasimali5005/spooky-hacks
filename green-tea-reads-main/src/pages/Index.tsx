import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import FloatingElements from "@/components/FloatingElements";
import MatchaMosaicGenerator from "@/components/MatchaMosaicGenerator";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <FloatingElements />
      <Hero />
      <MatchaMosaicGenerator />
      <Footer />
    </div>
  );
};

export default Index;
