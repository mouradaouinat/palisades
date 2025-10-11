import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Hero() {
  return (
    <section className="relative h-[80vh] animated-bg text-white overflow-hidden pt-20">
      {/* Floating particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="mb-6">
              <span className="inline-block px-4 py-2 rounded-full glass-card border border-white/20 text-sm mb-4">
                🤖 AI-Powered Financing
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
              Business Funding 
              <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Evolved
              </span>
            </h1>
            <p className="text-lg mb-6 text-white/80 leading-relaxed">
              Advanced algorithms. Instant decisions. Exceptional results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="glass-card bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700 text-white backdrop-blur-lg shadow-xl">
                Learn More
              </Button>
              <Button size="lg" variant="outline" className="glass border-white/20 text-white hover:bg-white/10 backdrop-blur-lg">
                Get Started
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">8min</div>
                <div className="text-white/60 text-sm">Avg Decision</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">24/7</div>
                <div className="text-white/60 text-sm">AI Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold bg-gradient-to-r from-pink-400 to-blue-500 bg-clip-text text-transparent">142</div>
                <div className="text-white/60 text-sm">Active Partners</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative glass-card rounded-3xl overflow-hidden border border-white/20">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1750768145390-f0ad18d3e65b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjBtb2Rlcm4lMjBvZmZpY2UlMjBBSSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzU4OTI2NTg5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Modern business meeting with AI technology"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Floating UI elements */}
              <div className="absolute top-4 left-4 glass-card px-3 py-2 rounded-xl border border-white/20">
                <div className="text-xs text-white/80">Neural Processing</div>
                <div className="text-green-400 text-sm font-medium">Active</div>
              </div>
              
              <div className="absolute bottom-4 right-4 glass-card px-3 py-2 rounded-xl border border-white/20">
                <div className="text-xs text-white/80">AI Confidence</div>
                <div className="text-blue-400 text-sm font-medium">97%</div>
              </div>
            </div>
            
            {/* Glowing orbs */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-2xl"></div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="glass-card px-4 py-2 rounded-full border border-white/20 flex items-center space-x-2">
            <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce delay-100"></div>
            <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    </section>
  );
}