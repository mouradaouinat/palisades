import { Button } from "./ui/button";
import Logo from "./Logo";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a
              href="#services"
              className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105 relative group"
            >
              Solutions
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></div>
            </a>
            <a
              href="#about"
              className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105 relative group"
            >
              Technology
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></div>
            </a>
            <a
              href="#contact"
              className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105 relative group"
            >
              Contact
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></div>
            </a>
          </nav>

          {/* CTA Button */}
          <Button className="glass-card border-white/20 text-white hover:bg-white/10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg">
            Learn More
          </Button>
        </div>
      </div>
    </header>
  );
}
