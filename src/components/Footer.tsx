import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

interface FooterProps {
  lang: Language;
  onNavigate: (sectionId: string) => void;
  onOpenLegal: (tab: 'privacy' | 'terms') => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onNavigate,
  onOpenLegal,
  onOpenAdmin
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <footer className="bg-slate-900 text-white text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand & Introduction (Zone 1) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#C9A64A] bg-white shrink-0">
                <img
                  src="/images/team-stars-logo.jpeg"
                  alt="Team Stars Chits Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-base font-bold text-white block tracking-tight">
                  {lang === 'ta' ? 'டீம் ஸ்டார்ஸ் சிட்ஸ்' : 'TEAM STARS CHITS'}
                </span>
                <span className="text-[10px] font-semibold text-[#C9A64A] tracking-wider uppercase block">
                  PRIVATE LIMITED · VILLUKURI
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-normal">
              {t.footer.tagline}
            </p>

            <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1">
              <div>CIN: <span className="text-white font-bold">U64990TN2025PTC181717</span></div>
              <div>Incorporated under Companies Act, 2013</div>
            </div>
          </div>

          {/* Quick Links (Zone 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  {t.nav.about}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('schemes')} className="hover:text-white transition-colors">
                  {t.nav.schemes}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('calculator')} className="hover:text-white transition-colors">
                  {t.nav.calculator}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-white transition-colors">
                  {t.nav.howItWorks}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('why-us')} className="hover:text-white transition-colors">
                  {t.nav.whyUs}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">
                  {t.nav.faq}
                </button>
              </li>
            </ul>
          </div>

          {/* Chit Schemes Links (Zone 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t.footer.schemesLinks}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button 
                  onClick={() => onNavigate('schemes')} 
                  className="hover:text-white transition-colors text-left"
                >
                  ₹1,00,000 Scheme (20 Months)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('schemes')} 
                  className="hover:text-white transition-colors text-left"
                >
                  ₹2,00,000 Scheme (20 Months)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('schemes')} 
                  className="hover:text-white transition-colors text-left"
                >
                  ₹5,00,000 Scheme (20 Months)
                </button>
              </li>
              <li className="pt-2 text-[11px] text-[#C9A64A]">
                11th Draw / Auction · 25th Payout
              </li>
            </ul>

            <div className="pt-3">
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A64A]" />
                <span>{t.nav.adminPortal}</span>
              </button>
            </div>
          </div>

          {/* Registered Office Contact (Zone 4) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t.footer.contactInfo}
            </h4>
            <div className="space-y-2.5 text-slate-400 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#12834B] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  41/5E, Madathattuvillai, Villukuri, Kalkulam, Kanyakumari District – 629180, Tamil Nadu.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#12834B] shrink-0" />
                <a href="tel:9789825684" className="text-white hover:underline font-mono">
                  +91 9789825684
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#12834B] shrink-0" />
                <a href="mailto:teamstarschitsprivatelimited@gmail.com" className="hover:text-white break-all">
                  teamstarschitsprivatelimited@gmail.com
                </a>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4 text-xs">
              <button
                onClick={() => onOpenLegal('privacy')}
                className="text-slate-400 hover:text-white underline transition-colors"
              >
                {t.legal.privacyTitle}
              </button>
              <button
                onClick={() => onOpenLegal('terms')}
                className="text-slate-400 hover:text-white underline transition-colors"
              >
                {t.legal.termsTitle}
              </button>
            </div>
          </div>

        </div>

        {/* Legal & Regulatory Disclaimers */}
        <div className="mt-12 pt-6 border-t border-slate-800 space-y-2 text-[11px] text-slate-400 leading-relaxed font-normal">
          <p>{t.footer.cinDisclaimer}</p>
          <p>{t.footer.schemeDisclaimer}</p>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-6 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} {t.footer.rightsReserved}
          </div>
          <div className="flex items-center gap-3">
            <span>Villukuri · Kanyakumari · Tamil Nadu</span>
            <span>·</span>
            <button onClick={onOpenAdmin} className="text-slate-400 hover:text-white">
              Admin Console
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
