import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { useState } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  image: string;
  icon: LucideIcon;
  gradient: "matcha" | "blush" | "soft";
}

const FeatureCard = ({ title, description, image, icon: Icon, gradient }: FeatureCardProps) => {
  const gradientClass = `gradient-${gradient}`;
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };
  
  return (
    <div 
      className="group relative overflow-hidden rounded-3xl shadow-card hover:shadow-glow card-3d perspective"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(20px)`,
        transition: "transform 0.3s ease-out"
      }}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${gradientClass} opacity-10`}></div>
      
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-smooth group-hover:scale-110"
          style={{
            transform: `translateZ(30px) scale(1.05)`,
          }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent"
          style={{ transform: "translateZ(40px)" }}
        ></div>
      </div>
      
      {/* Content */}
      <div className="relative p-8" style={{ transform: "translateZ(50px)" }}>
        <div 
          className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-light/30 group-hover:bg-primary-light transition-smooth shadow-soft"
          style={{ transform: "translateZ(60px)" }}
        >
          <Icon className="w-7 h-7 text-primary" />
        </div>
        
        <h3 className="text-2xl font-serif font-semibold mb-3">
          {title}
        </h3>
        
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {description}
        </p>
        
        <Button variant="ghost" className="group-hover:text-primary transition-smooth">
          Explore More →
        </Button>
      </div>
    </div>
  );
};

export default FeatureCard;
