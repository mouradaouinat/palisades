import Logo from "./Logo";

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/10 py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Logo and Company Info */}
          <div className="col-span-1">
            <div className="flex items-center mb-6">
              <Logo size="small" />
            </div>
            <p className="text-sm text-white/70 mb-6 leading-relaxed">
              Revolutionizing merchant cash advance funding through AI,
              enterprise security, and lightning-fast fund transfer technology.
            </p>

            {/* Social links */}
            <div className="flex space-x-4">
              {["Twitter", "LinkedIn", "GitHub"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="glass-card w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 hover:border-blue-400/30 transition-all text-white/60 hover:text-white"
                >
                  <span className="text-xs">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-6 text-white">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#brokers"
                  className="text-white/70 hover:text-blue-400 transition-colors hover:translate-x-1 transform inline-block"
                >
                  AI Broker Network
                </a>
              </li>
              <li>
                <a
                  href="#merchants"
                  className="text-white/70 hover:text-blue-400 transition-colors hover:translate-x-1 transform inline-block"
                >
                  Smart Funding
                </a>
              </li>
              <li>
                <a
                  href="#underwriting"
                  className="text-white/70 hover:text-blue-400 transition-colors hover:translate-x-1 transform inline-block"
                >
                  Neural Underwriting
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-blue-400 transition-colors hover:translate-x-1 transform inline-block"
                >
                  Analytics Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-blue-400 transition-colors hover:translate-x-1 transform inline-block"
                >
                  API Integration
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-6 text-white">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#about"
                  className="text-white/70 hover:text-purple-400 transition-colors hover:translate-x-1 transform inline-block"
                >
                  About Palisades
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-purple-400 transition-colors hover:translate-x-1 transform inline-block"
                >
                  Engineering
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-purple-400 transition-colors hover:translate-x-1 transform inline-block"
                >
                  Research
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-purple-400 transition-colors hover:translate-x-1 transform inline-block"
                >
                  Newsroom
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-purple-400 transition-colors hover:translate-x-1 transform inline-block"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="mb-6 text-white">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-pink-400 transition-colors hover:translate-x-1 transform inline-block"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-pink-400 transition-colors hover:translate-x-1 transform inline-block"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-pink-400 transition-colors hover:translate-x-1 transform inline-block"
                >
                  Security
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-pink-400 transition-colors hover:translate-x-1 transform inline-block"
                >
                  Compliance
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-pink-400 transition-colors hover:translate-x-1 transform inline-block"
                >
                  Regulatory
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-white/60">
            © 2025 Palisades Financial Technology. All rights reserved. Licensed
            by state regulatory authorities.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-xs text-white/40">Powered by</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-white/60">AI Systems Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/5 to-transparent"></div>
    </footer>
  );
}
