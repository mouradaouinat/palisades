import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Rocket, Users, Zap, ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            <span className="inline-block px-4 py-2 rounded-full glass-card border border-white/20 text-sm mb-6 text-green-400">
              💡 Learn More
            </span>
            <h2 className="text-4xl lg:text-5xl mb-8 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent leading-tight">
              Experience the 
              <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Difference
              </span>
            </h2>
            <p className="text-xl mb-10 text-white/70 leading-relaxed">
              Discover how intelligent financing is changing the game.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <Card className="glass-card border-white/10 hover:border-blue-400/30 transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="glass-card w-12 h-12 rounded-xl flex items-center justify-center border border-blue-400/20 group-hover:border-blue-400/40 transition-all">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white mb-2 font-medium">For Merchants</h4>
                      <p className="text-sm text-white/70">
                        Smart capital solutions designed for growth
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-white/10 hover:border-purple-400/30 transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="glass-card w-12 h-12 rounded-xl flex items-center justify-center border border-purple-400/20 group-hover:border-purple-400/40 transition-all">
                      <Rocket className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white mb-2 font-medium">For Brokers</h4>
                      <p className="text-sm text-white/70">
                        Enhanced partnerships with intelligent insights
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="glass-card bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700 text-white backdrop-blur-lg shadow-xl group">
                Request Information
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="glass border-white/20 text-white hover:bg-white/10 backdrop-blur-lg group">
                Contact Us
                <Zap className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center space-x-6 mt-8 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-green-400 text-sm font-medium">99.9% Uptime</div>
                <div className="text-white/60 text-xs">Platform Reliability</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 text-sm font-medium">Bank Grade</div>
                <div className="text-white/60 text-xs">Security Standards</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 text-sm font-medium">SOC 2 Type II</div>
                <div className="text-white/60 text-xs">Compliance Certified</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10 relative">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1709715357520-5e1047a2b691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBtZWV0aW5nfGVufDF8fHx8MTc1ODgxNjM0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Business team meeting"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              
              {/* Floating UI elements */}
              <div className="absolute top-6 left-6 glass-card px-4 py-3 rounded-xl border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="text-white/90 text-sm font-medium">AI Processing</div>
                </div>
                <div className="text-green-400 text-xs mt-1">Active</div>
              </div>
              
              <div className="absolute top-6 right-6 glass-card px-4 py-3 rounded-xl border border-white/20">
                <div className="text-white/90 text-sm font-medium">Intelligence</div>
                <div className="text-blue-400 text-lg font-bold">97%</div>
              </div>
              
              <div className="absolute bottom-6 left-6 glass-card px-4 py-3 rounded-xl border border-white/20">
                <div className="text-white/90 text-sm font-medium">Response Time</div>
                <div className="text-purple-400 text-lg font-bold">8min</div>
              </div>
              
              <div className="absolute bottom-6 right-6 glass-card px-4 py-3 rounded-xl border border-white/20">
                <div className="text-white/90 text-sm font-medium">Uptime</div>
                <div className="text-pink-400 text-lg font-bold">99.7%</div>
              </div>
            </div>
            
            {/* Glowing orbs */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(102,126,234,0.05),transparent_50%)]"></div>
    </section>
  );
}