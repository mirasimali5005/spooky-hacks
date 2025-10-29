import { Coffee, BookOpen, Headphones } from "lucide-react";

const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Floating Icons */}
      <div className="absolute top-20 left-10 opacity-10 animate-float">
        <Coffee className="w-32 h-32 text-primary" />
      </div>
      <div className="absolute top-40 right-20 opacity-10 animate-float-delayed" style={{ animationDelay: "2s" }}>
        <BookOpen className="w-24 h-24 text-primary" />
      </div>
      <div className="absolute bottom-40 left-1/4 opacity-10 animate-float" style={{ animationDelay: "4s" }}>
        <Headphones className="w-28 h-28 text-primary" />
      </div>
      <div className="absolute bottom-20 right-1/3 opacity-10 animate-float-delayed" style={{ animationDelay: "1s" }}>
        <Coffee className="w-20 h-20 text-primary" />
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 right-10 w-96 h-96 gradient-matcha opacity-20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 left-10 w-80 h-80 gradient-blush opacity-20 rounded-full blur-3xl animate-float-delayed"></div>
    </div>
  );
};

export default FloatingElements;
