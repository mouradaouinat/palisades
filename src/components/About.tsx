import { ImageWithFallback } from "./figma/ImageWithFallback";

export function About() {
  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block px-4 py-2 rounded-full glass-card border border-white/20 text-sm mb-6 text-purple-400">
              🤖 AI-First Approach
            </span>
            <h2 className="text-4xl lg:text-5xl mb-8 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent leading-tight">
              The Science of 
              <span className="block bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Smart Financing
              </span>
            </h2>
            <p className="text-lg text-white/70 mb-10 leading-relaxed">
              Where traditional finance meets artificial intelligence. 
              We're changing how businesses access capital.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-blue-400/30 transition-all group">
                <h4 className="text-3xl mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  $50M
                </h4>
                <p className="text-white/60">Advance Volume YTD</p>
                <div className="w-full h-1 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full mt-3">
                  <div className="w-4/5 h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-purple-400/30 transition-all group">
                <h4 className="text-3xl mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  4,372
                </h4>
                <p className="text-white/60">Active Merchants</p>
                <div className="w-full h-1 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full mt-3">
                  <div className="w-3/4 h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-pink-400/30 transition-all group">
                <h4 className="text-3xl mb-2 bg-gradient-to-r from-pink-400 to-blue-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  27mins
                </h4>
                <p className="text-white/60">Avg Decision Time</p>
                <div className="w-full h-1 bg-gradient-to-r from-pink-400/20 to-blue-500/20 rounded-full mt-3">
                  <div className="w-5/6 h-full bg-gradient-to-r from-pink-400 to-blue-500 rounded-full"></div>
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-blue-400/30 transition-all group">
                <h4 className="text-3xl mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  99.7%
                </h4>
                <p className="text-white/60">Platform Uptime</p>
                <div className="w-full h-1 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full mt-3">
                  <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6 relative">
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10 relative">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1750768145390-f0ad18d3e65b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjBtb2Rlcm4lMjBvZmZpY2UlMjBBSSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzU4OTI2NTg5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Modern business meeting with AI technology"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 glass-card px-4 py-2 rounded-xl border border-white/20">
                <div className="text-white/80 text-sm">Strategic Operations</div>
              </div>
            </div>
            
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10 relative">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBkYXRhJTIwYW5hbHl0aWNzJTIwZGFzaGJvYXJkfGVufDF8fHx8MTc1ODgxMDIxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Financial data analytics dashboard"
                className="w-full h-60 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 right-4 glass-card px-4 py-2 rounded-xl border border-white/20">
                <div className="text-white/80 text-sm">Intelligence Engine</div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-lg animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
      
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
    </section>
  );
}