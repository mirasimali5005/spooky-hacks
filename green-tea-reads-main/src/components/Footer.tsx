import { BookOpen, Headphones, Coffee, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="container mx-auto">
        <div className="flex flex-col items-center gap-6">
          {/* Logo & Icons */}
          <div className="flex items-center gap-3">
            <Coffee className="w-6 h-6 text-primary" />
            <span className="text-xl font-serif font-semibold">Matcha Moments</span>
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          
          {/* Tagline */}
          <p className="text-muted-foreground text-center max-w-md">
            Creating cozy moments, one book, beat, and brew at a time
          </p>
          
          {/* Made with Love */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-accent fill-accent" />
            <span>and lots of matcha</span>
          </div>
          
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2025 Matcha Moments. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
