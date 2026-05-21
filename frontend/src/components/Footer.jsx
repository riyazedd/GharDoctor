import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="p-2 bg-linear-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/10">
                <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="text-lg font-black bg-linear-to-r from-white to-cyan-400 bg-clip-text text-transparent">
                Ghar<span className="text-cyan-400">Doctor</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your trusted partner for professional, reliable, and convenient home maintenance services. We make home care hassle-free.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>+977-9801112223</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>support@ghardoctor.com</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Kathmandu, Nepal</span>
              </div>
            </div>
          </div>

          {/* Quick links: Services */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-5">Our Services</h3>
            <ul className="space-y-3 text-sm">
              {['Cleaning', 'Plumbing', 'Electrical', 'Painting', 'Gardening', 'Appliance Repair'].map((serv) => (
                <li key={serv}>
                  <button
                    onClick={() => navigate('/services')}
                    className="text-slate-400 hover:text-cyan-400 transition-colors duration-200"
                  >
                    {serv} Services
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer links */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-5">Resources</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#about" className="hover:text-cyan-400 transition-colors duration-200">About Us</a></li>
              <li><a href="#safety" className="hover:text-cyan-400 transition-colors duration-200">Trust & Safety</a></li>
              <li><a href="#careers" className="hover:text-cyan-400 transition-colors duration-200">Join as Provider</a></li>
              <li><a href="#faqs" className="hover:text-cyan-400 transition-colors duration-200">FAQs & Help</a></li>
              <li><a href="#contact" className="hover:text-cyan-400 transition-colors duration-200">Contact Support</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-5">Newsletter</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Subscribe to get seasonal home maintenance tips and exclusive service offers.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter email address"
                required
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 placeholder-slate-500 text-slate-200 transition-all duration-200"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide active:scale-95 transition-all duration-200 cursor-pointer shadow-lg shadow-cyan-500/10"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Panel bar */}
        <div className="pt-8 mt-12 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {currentYear} GharDoctor. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span>Designed by Riyaz & Manoj</span>
          </div>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}