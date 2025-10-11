import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Network, Zap, Brain, TrendingUp, Shield, Cpu } from "lucide-react";

export function Services() {
  return (
    <section id="services" className="py-24 bg-background relative">
      {/* Gradient blend overlay */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full glass-card border border-white/20 text-sm mb-4 text-blue-400">
            ⚡ Next-Gen Platform
          </span>
          <h2 className="text-4xl lg:text-5xl mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            How We're Different
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Advanced technology meets traditional finance
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Brokers */}
          <Card id="brokers" className="glass-card border-white/10 group hover:border-blue-400/30 transition-all duration-500 hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
            <CardContent className="p-8 relative z-10">
              <div className="relative mb-6">
                <div className="glass-card w-16 h-16 rounded-2xl flex items-center justify-center border border-blue-400/20 group-hover:border-blue-400/40 transition-all">
                  <Network className="h-8 w-8 text-blue-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-60 blur-sm"></div>
              </div>
              
              <h3 className="text-2xl mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                For Brokers
              </h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Streamlined processes. Enhanced returns. Intelligent matching.
              </p>
              
              <div className="space-y-3">
                {[
                  { icon: Zap, text: "Rapid approvals" },
                  { icon: TrendingUp, text: "Smart commissions" },
                  { icon: Cpu, text: "AI-powered insights" },
                  { icon: Shield, text: "Secure platform" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center text-sm text-white/80">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center mr-3 flex-shrink-0">
                      <item.icon className="w-3 h-3 text-white" />
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Merchants */}
          <Card id="merchants" className="glass-card border-white/10 group hover:border-purple-400/30 transition-all duration-500 hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
            <CardContent className="p-8 relative z-10">
              <div className="relative mb-6">
                <div className="glass-card w-16 h-16 rounded-2xl flex items-center justify-center border border-purple-400/20 group-hover:border-purple-400/40 transition-all">
                  <Zap className="h-8 w-8 text-purple-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-60 blur-sm"></div>
              </div>
              
              <h3 className="text-2xl mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                For Merchants
              </h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Faster decisions. Better terms. Smarter financing.
              </p>
              
              <div className="space-y-3">
                {[
                  { icon: Brain, text: "Intelligent assessment" },
                  { icon: Zap, text: "Quick funding" },
                  { icon: Shield, text: "Seamless process" },
                  { icon: Cpu, text: "Advanced analytics" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center text-sm text-white/80">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center mr-3 flex-shrink-0">
                      <item.icon className="w-3 h-3 text-white" />
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Underwriting */}
          <Card id="underwriting" className="glass-card border-white/10 group hover:border-pink-400/30 transition-all duration-500 hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-blue-500/5"></div>
            <CardContent className="p-8 relative z-10">
              <div className="relative mb-6">
                <div className="glass-card w-16 h-16 rounded-2xl flex items-center justify-center border border-pink-400/20 group-hover:border-pink-400/40 transition-all">
                  <Brain className="h-8 w-8 text-pink-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-pink-400 to-blue-500 rounded-full opacity-60 blur-sm"></div>
              </div>
              
              <h3 className="text-2xl mb-4 bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                Our Technology
              </h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Proprietary algorithms. Advanced security. Proven results.
              </p>
              
              <div className="space-y-3">
                {[
                  { icon: Brain, text: "Neural processing" },
                  { icon: Zap, text: "Real-time analysis" },
                  { icon: Shield, text: "Enhanced security" },
                  { icon: TrendingUp, text: "Predictive insights" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center text-sm text-white/80">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-400 to-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
                      <item.icon className="w-3 h-3 text-white" />
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
      
      {/* Floating connection elements */}
      <div className="absolute top-8 left-1/3 w-32 h-32 bg-gradient-to-br from-blue-400/5 to-purple-500/5 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute top-16 right-1/3 w-24 h-24 bg-gradient-to-br from-purple-400/5 to-pink-500/5 rounded-full blur-xl animate-pulse delay-1000"></div>
    </section>
  );
}