import { BookOpen, Headphones, Coffee } from "lucide-react";
import FeatureCard from "./FeatureCard";
import booksImage from "@/assets/books-aesthetic.jpg";
import headphonesImage from "@/assets/headphones-aesthetic.jpg";
import matchaImage from "@/assets/matcha-aesthetic.jpg";

const Features = () => {
  const features = [
    {
      title: "Curated Books",
      description: "Discover your next favorite read from our carefully selected collection of books that inspire, comfort, and transport you to new worlds.",
      image: booksImage,
      icon: BookOpen,
      gradient: "blush" as const,
    },
    {
      title: "Perfect Playlists",
      description: "Immerse yourself in soundscapes designed for reading, studying, or simply unwinding with your favorite matcha in hand.",
      image: headphonesImage,
      icon: Headphones,
      gradient: "soft" as const,
    },
    {
      title: "Matcha Magic",
      description: "Explore the art of matcha preparation and find the perfect brew to accompany your cozy reading sessions and creative moments.",
      image: matchaImage,
      icon: Coffee,
      gradient: "matcha" as const,
    },
  ];

  return (
    <section className="py-24 px-4 gradient-soft relative z-10">
      <div className="container mx-auto perspective-lg">
        <div className="text-center mb-16" style={{ transform: "translateZ(50px)" }}>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Your Cozy Essentials
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need for the perfect moment of peace and inspiration
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 perspective">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="animate-in fade-in duration-700"
              style={{ 
                animationDelay: `${index * 150}ms`,
                transform: `translateZ(${(index + 1) * 20}px)`
              }}
            >
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
