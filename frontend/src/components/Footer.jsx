import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#eadcc7] bg-[#f8f1ea] pb-8 pt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex cursor-pointer items-center gap-3" onClick={() => navigate('/')}>
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-[#ecd4b4] bg-gradient-to-br from-[#d77a4a] via-[#e0b76d] to-[#c8c98e] shadow-[0_12px_24px_rgba(201,109,66,0.18)]">
                <img src="logo.png" alt="GharDoctor logo" className="h-8 w-8 object-contain" />
              </div>
              <span className="text-lg font-black tracking-[-0.04em] text-[#201a17]">
                Ghar<span className="text-[#b86845]">Doctor</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#655c58]">
              Your trusted partner for professional, reliable, and convenient home maintenance services.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-[#5f514d]">
                <Phone className="h-3.5 w-3.5 text-[#b86845]" />
                <span>+977-9801112223</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#5f514d]">
                <Mail className="h-3.5 w-3.5 text-[#b86845]" />
                <span>support@ghardoctor.com</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#5f514d]">
                <MapPin className="h-3.5 w-3.5 text-[#b86845]" />
                <span>Kathmandu, Nepal</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#201a17]">Our Services</h3>
            <ul className="space-y-3 text-sm">
              {['Cleaning', 'Plumbing', 'Electrical', 'Painting', 'Gardening', 'Appliance Repair'].map((serv) => (
                <li key={serv}>
                  <button
                    onClick={() => navigate('/services')}
                    className="text-[#645b57] transition-colors duration-200 hover:text-[#b86845]"
                  >
                    {serv} Services
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#201a17]">Resources</h3>
            <ul className="space-y-3 text-sm text-[#645b57]">
              <li><a href="#about" className="hover:text-[#b86845] transition-colors duration-200">About Us</a></li>
              <li><a href="#safety" className="hover:text-[#b86845] transition-colors duration-200">Trust & Safety</a></li>
              <li><a href="#careers" className="hover:text-[#b86845] transition-colors duration-200">Join as Provider</a></li>
              <li><a href="#faqs" className="hover:text-[#b86845] transition-colors duration-200">FAQs & Help</a></li>
              <li><a href="#contact" className="hover:text-[#b86845] transition-colors duration-200">Contact Support</a></li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#e7d5c5] pt-8 text-xs text-[#70635f] sm:flex-row">
          <div>&copy; {currentYear} GharDoctor. All rights reserved.</div>
          <div>Designed by Riyaz & Manoj</div>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-[#b86845] transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-[#b86845] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}