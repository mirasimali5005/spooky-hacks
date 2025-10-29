import { Button } from "@/components/ui/button";
import { BookOpen, Headphones, Coffee } from "lucide-react";
import heroImage from "@/assets/hero-matcha.jpg";
import { useState, useEffect } from "react";

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden perspective-lg">
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 z-0 parallax-layer"
        style={{
          transform: `translate3d(${mousePosition.x * 10}px, ${mousePosition.y * 10}px, 0) scale(1.1)`
        }}
      >
        <img 
          src={heroImage} 
          alt="Cozy reading scene with matcha and headphones" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      </div>

      {/* Hero Content */}
      <div 
        className="container relative z-10 px-4 py-20 mx-auto text-center preserve-3d"
        style={{
          transform: `translate3d(${mousePosition.x * -20}px, ${mousePosition.y * -20}px, 50px)`
        }}
      >
        <div className="flex items-center justify-center gap-4 mb-6 animate-in fade-in duration-700">
          <Coffee className="w-8 h-8 text-primary animate-float" />
          <BookOpen className="w-8 h-8 text-primary animate-float-delayed" style={{ animationDelay: "1s" }} />
          <Headphones className="w-8 h-8 text-primary animate-float" style={{ animationDelay: "2s" }} />
        </div>
        
        <h1 
          className="text-5xl md:text-7xl font-serif font-bold mb-6 text-balance animate-in fade-in duration-700 delay-100"
          style={{
            transform: `translate3d(${mousePosition.x * -15}px, ${mousePosition.y * -15}px, 80px)`,
            textShadow: "0 20px 40px rgba(120, 180, 120, 0.3)"
          }}
        >
          Matcha Moments
        </h1>
        
        <p 
          className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance animate-in fade-in duration-700 delay-200"
          style={{
            transform: `translate3d(${mousePosition.x * -10}px, ${mousePosition.y * -10}px, 60px)`
          }}
        >
          Your cozy corner for books, beats, and beautiful brews
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in duration-700 delay-300">
          <Button variant="hero" size="lg" className="text-lg">
            Get Started
          </Button>
          <Button variant="soft" size="lg" className="text-lg">
            Learn More
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
