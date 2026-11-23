import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Menu, X, Phone, ShieldCheck, Globe, User } from 'lucide-react';

interface NavbarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  onOpenUser: () => void;
  onOpenEnquiry: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageChange,
  activeSection,
  onNavigate,
  onOpenAdmin,
  onOpenUser,
  onOpenEnquiry
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  const navLinks = [
    { id: 'home', label: t.nav.home },
    { id: 'about', label: t.nav.about },
    { id: 'schemes', label: t.nav.schemes },
    { id: 'calculator', label: t.nav.calculator },
    { id: 'how-it-works', label: t.nav.howItWorks },
    { id: 'why-us', label: t.nav.whyUs },
    { id: 'faq', label: t.nav.faq },
    { id: 'contact', label: t.nav.contact }
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#064E3B]/12 shadow-[0_12px_32px_-12px_rgba(6,78,59,0.14)] transition-all">
      {/* Top Deep Emerald Corporate Strip */}
      <div className="bg-[#064E3B] border-b border-emerald-400/20 text-[#D1FAE5] text-[11px] md:text-xs py-1.5 px-3 sm:px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 truncate">
            <span className="font-semibold tracking-wider text-[#65E83A] font-mono tabular-nums truncate">
              CIN: U64990TN2025PTC181717
            </span>
            <span className="hidden sm:inline text-emerald-300/60">·</span>
            <span className="hidden sm:inline text-[#ECFDF5]">
              Madathattuvillai, Villukuri, Kanyakumari – 629180
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:9789825684"
              className="flex items-center gap-1 text-white hover:text-[#65E83A] transition-colors"
            >
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#65E83A]" />
              <span className="font-semibold tabular-nums">9789825684</span>
            </a>
            <span className="hidden sm:inline text-emerald-300/40">|</span>
            <button
              onClick={onOpenAdmin}
              className="hidden sm:flex items-center gap-1 text-[11px] text-[#D1FAE5] hover:text-[#65E83A] transition-colors cursor-pointer"
              title="Official Admin Management"
            >
              <ShieldCheck className="w-3 h-3 text-[#65E83A]" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Single-Row 3-Zone Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[74px] gap-4">
          {/* Zone 1: Brand Lockup (Clean Single-Line Name) */}
          <div
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none min-w-0 shrink-0 group"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#064E3B]/30 shadow-[0_4px_14px_rgba(6,78,59,0.14)] group-hover:scale-105 transition-transform bg-white shrink-0">
              <img
                src="/images/team-stars-logo.jpeg"
                alt="TEAM STARS CHITS PRIVATE LIMITED Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-sm sm:text-base lg:text-lg font-extrabold tracking-tight text-[#052E22] leading-none whitespace-nowrap">
              {lang === 'ta' ? 'டீம் ஸ்டார்ஸ் சிட்ஸ்' : 'TEAM STARS CHITS'}
            </span>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav
            className={`hidden xl:flex items-center font-semibold text-[#264D40] ${
              lang === 'ta' ? 'gap-3 2xl:gap-4 text-[12px]' : 'gap-5 2xl:gap-6 text-[13px]'
            }`}
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1.5 relative cursor-pointer ${
                  activeSection === link.id
                    ? 'text-[#052E22] font-bold'
                    : 'hover:text-[#064E3B]'
                }`}
              >
                {link.label}
                {activeSection === link.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B5D46] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions (Language Switcher + Member Portal + Enquire CTA) */}
          <div
            className={`flex items-center shrink-0 ${
              lang === 'ta' ? 'gap-1.5 sm:gap-2' : 'gap-1.5 sm:gap-2.5'
            }`}
          >
            <button
              onClick={() => onLanguageChange(lang === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#064E3B]/20 text-[11px] sm:text-xs font-semibold text-[#052E22] hover:border-[#064E3B]/45 hover:bg-[#EAF7F0] transition-colors bg-white whitespace-nowrap cursor-pointer"
              title="Switch Language / மொழியை மாற்றுக"
            >
              <Globe className="w-3.5 h-3.5 text-[#064E3B] shrink-0" />
              <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            <button
              onClick={onOpenUser}
              className={`hidden sm:flex items-center gap-1.5 rounded-lg border border-[#064E3B]/25 text-xs font-bold text-[#052E22] hover:bg-[#EAF7F0] transition-colors bg-white shadow-2xs cursor-pointer whitespace-nowrap ${
                lang === 'ta' ? 'px-2.5 py-1.5' : 'px-3 py-1.5'
              }`}
              title="Chit Fund Member Portal / பயனர் தளம்"
            >
              <User className="w-3.5 h-3.5 text-[#064E3B]" />
              <span>{lang === 'ta' ? 'பயனர் உள்நுழைவு' : 'Member Portal'}</span>
            </button>

            <button
              onClick={onOpenEnquiry}
              className={`hidden min-[420px]:inline-flex items-center justify-center text-xs font-extrabold uppercase tracking-wider text-[#052E22] bg-[#65E83A] hover:bg-[#7CF056] pubzi-chamfer-sm shadow-[0_8px_20px_-6px_rgba(34,197,94,0.45)] transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                lang === 'ta' ? 'px-3.5 py-2' : 'px-4.5 py-2 sm:text-xs'
              }`}
            >
              {t.nav.enquireNow}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 sm:p-2 rounded-lg text-[#052E22] hover:bg-[#EAF7F0] transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#064E3B]/15 bg-white px-4 pt-3 pb-6 shadow-2xl transition-all">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeSection === link.id
                    ? 'bg-[#DCFCE7] text-[#052E22] border border-[#064E3B]/25 font-bold'
                    : 'text-[#264D40] hover:bg-[#F4FBF7] hover:text-[#052E22]'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-3 mt-2 border-t border-[#064E3B]/15 flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenEnquiry();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-[#65E83A] hover:bg-[#7CF056] text-[#052E22] text-xs font-extrabold text-center shadow-sm"
              >
                {t.nav.enquireNow}
              </button>

              <button
                onClick={() => {
                  onOpenUser();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-[#052E22] bg-[#F4FBF7] border border-[#064E3B]/20 rounded-lg"
              >
                <User className="w-4 h-4 text-[#064E3B]" />
                <span>{lang === 'ta' ? 'பயனர் உள்நுழைவு (Member Portal)' : 'Member Portal Login'}</span>
              </button>

              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#264D40] hover:text-[#052E22]"
              >
                <ShieldCheck className="w-4 h-4 text-[#064E3B]" />
                <span>{t.nav.adminPortal}</span>
              </button>

              <a
                href="tel:9789825684"
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#064E3B]/20 text-xs font-bold text-[#052E22] hover:bg-[#EAF7F0]"
              >
                <Phone className="w-4 h-4 text-[#064E3B]" />
                <span>{t.nav.callUs}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
