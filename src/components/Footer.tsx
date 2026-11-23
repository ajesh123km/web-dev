import React, { useState, useEffect } from 'react';
import { ChitScheme, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { CHIT_SCHEMES } from '../data/schemes';
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
  const [schemes, setSchemes] = useState<ChitScheme[]>(CHIT_SCHEMES);

  useEffect(() => {
    let active = true;
    fetch('/api/schemes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.schemes && Array.isArray(data.schemes) && data.schemes.length > 0) {
          setSchemes(data.schemes);
        }
      })
      .catch(() => {
        // Fallback to static schemes
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <footer className="bg-[#052E22] text-[#ECFDF5] text-xs border-t border-emerald-400/25 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10">

          {/* Brand & Introduction (Zone 1) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#65E83A] shadow-[0_0_16px_rgba(101,232,58,0.25)] bg-white shrink-0">
                <img
                  src="/images/team-stars-logo.jpeg"
                  alt="Team Stars Chits Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-base font-extrabold text-white block tracking-tight">
                  {lang === 'ta' ? 'டீம் ஸ்டார்ஸ் சிட்ஸ்' : 'TEAM STARS CHITS'}
                </span>
                <span className="text-[10px] font-semibold text-[#65E83A] tracking-wider uppercase block">
                  PRIVATE LIMITED · VILLUKURI
                </span>
              </div>
            </div>

            <p className="text-[#D1FAE5] text-xs leading-relaxed max-w-sm font-normal">
              {t.footer.tagline}
            </p>

            <div className="pt-2 text-[11px] font-mono text-[#A7F3D0] space-y-1 tabular-nums">
              <div>
                CIN: <span className="text-[#65E83A] font-bold">U64990TN2025PTC181717</span>
              </div>
              <div>Incorporated under Companies Act, 2013</div>
            </div>
          </div>

          {/* Quick Links (Zone 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="side-heading-3d-pop-dark text-xs font-bold uppercase tracking-wider text-[#65E83A]">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-[#D1FAE5]">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
                  {t.nav.about}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('schemes')} className="hover:text-white transition-colors cursor-pointer">
                  {t.nav.schemes}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('calculator')} className="hover:text-white transition-colors cursor-pointer">
                  {t.nav.calculator}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-white transition-colors cursor-pointer">
                  {t.nav.howItWorks}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('why-us')} className="hover:text-white transition-colors cursor-pointer">
                  {t.nav.whyUs}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors cursor-pointer">
                  {t.nav.faq}
                </button>
              </li>
            </ul>
          </div>

          {/* Chit Schemes Links (Zone 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="side-heading-3d-pop-dark text-xs font-bold uppercase tracking-wider text-[#65E83A]">
              {t.footer.schemesLinks}
            </h4>
            <ul className="space-y-2 text-[#D1FAE5]">
              {schemes.map((scheme) => (
                <li key={scheme.id}>
                  <button
                    onClick={() => onNavigate('schemes')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {lang === 'ta'
                      ? `${scheme.chitValueFormattedTa} திட்டம் (${scheme.durationMonths} மாதங்கள்)`
                      : `${scheme.chitValueFormatted} Scheme (${scheme.durationMonths} Months)`}
                  </button>
                </li>
              ))}
              <li className="pt-2 text-[11px] text-[#65E83A] font-semibold">
                11th Draw / Auction · 25th Payout
              </li>
            </ul>

            <div className="pt-3">
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 text-xs text-[#D1FAE5] hover:text-white transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#65E83A]" />
                <span>{t.nav.adminPortal}</span>
              </button>
            </div>
          </div>

          {/* Registered Office Contact (Zone 4) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="side-heading-3d-pop-dark text-xs font-bold uppercase tracking-wider text-[#65E83A]">
              {t.footer.contactInfo}
            </h4>
            <div className="space-y-2.5 text-[#D1FAE5] text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#65E83A] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  41/5E, Madathattuvillai, Villukuri, Kalkulam, Kanyakumari District – 629180, Tamil Nadu.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#65E83A] shrink-0" />
                <a href="tel:9789825684" className="text-white hover:text-[#65E83A] hover:underline font-mono tabular-nums">
                  +91 9789825684
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#65E83A] shrink-0" />
                <a href="mailto:teamstarschitsprivatelimited@gmail.com" className="hover:text-white break-all">
                  teamstarschitsprivatelimited@gmail.com
                </a>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
              <button
                onClick={() => onOpenLegal('privacy')}
                className="text-[#D1FAE5] hover:text-[#65E83A] underline transition-colors cursor-pointer"
              >
                {t.legal.privacyTitle}
              </button>
              <button
                onClick={() => onOpenLegal('terms')}
                className="text-[#D1FAE5] hover:text-[#65E83A] underline transition-colors cursor-pointer"
              >
                {t.legal.termsTitle}
              </button>
            </div>
          </div>

        </div>

        {/* Legal & Regulatory Disclaimers */}
        <div className="mt-10 sm:mt-12 pt-6 border-t border-white/15 space-y-2 text-[11px] text-[#A7F3D0] leading-relaxed font-normal">
          <p>{t.footer.cinDisclaimer}</p>
          <p>{t.footer.schemeDisclaimer}</p>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-6 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#A7F3D0] text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} {t.footer.rightsReserved}
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
            <span>Villukuri · Kanyakumari · Tamil Nadu</span>
            <span className="hidden sm:inline">·</span>
            <button onClick={onOpenAdmin} className="text-[#D1FAE5] hover:text-[#65E83A] cursor-pointer">
              Admin Console
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
