import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Menu, X, Phone, ShieldCheck, Globe } from 'lucide-react';

interface NavbarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  onOpenEnquiry: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageChange,
  activeSection,
  onNavigate,
  onOpenAdmin,
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Top micro trust header */}
      <div className="bg-[#075C32] text-white text-[11px] md:text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold tracking-wider text-[#C9A64A]">CIN: U64990TN2025PTC181717</span>
            <span className="hidden sm:inline text-white/50">·</span>
            <span className="hidden sm:inline text-white/90">Madathattuvillai, Villukuri, Kanyakumari – 629180</span>
          </div>
          <div className="flex items-center gap-4 shrink-0 text-white/90">
            <a 
              href="tel:9789825684" 
              className="flex items-center gap-1.5 hover:text-[#C9A64A] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#C9A64A]" />
              <span className="font-semibold">9789825684</span>
            </a>
            <button
              onClick={onOpenAdmin}
              className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-100 hover:text-white transition-colors"
              title="Official Admin Management"
            >
              <ShieldCheck className="w-3 h-3 text-[#C9A64A]" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Zone 1: Brand Zone */}
          <div 
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-3 cursor-pointer select-none shrink-0 group"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#075C32] shadow-xs group-hover:scale-105 transition-transform bg-white shrink-0">
              <img
                src="/images/team-stars-logo.jpeg"
                alt="TEAM STARS CHITS PRIVATE LIMITED Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-[#075C32] leading-tight">
                {lang === 'ta' ? 'டீம் ஸ்டார்ஸ் சிட்ஸ்' : 'TEAM STARS CHITS'}
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
                Private Limited · Villukuri
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-6 text-[13px] font-semibold text-slate-600">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`whitespace-nowrap transition-colors py-1 relative ${
                  activeSection === link.id
                    ? 'text-[#075C32] font-bold'
                    : 'hover:text-[#12834B]'
                }`}
              >
                {link.label}
                {activeSection === link.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#12834B] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions (Language Switcher + Enquire CTA) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(lang === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:border-[#12834B] hover:text-[#075C32] transition-colors bg-slate-50/80"
              title="Switch Language / மொழியை மாற்றுக"
            >
              <Globe className="w-3.5 h-3.5 text-[#12834B]" />
              <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Primary Action CTA */}
            <button
              onClick={onOpenEnquiry}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#075C32] hover:bg-[#12834B] rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap active:scale-95"
            >
              {t.nav.enquireNow}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl transition-all">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeSection === link.id
                    ? 'bg-[#E5F2E8] text-[#075C32]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            
            <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#075C32]"
              >
                <ShieldCheck className="w-4 h-4 text-[#C9A64A]" />
                <span>{t.nav.adminPortal}</span>
              </button>

              <a
                href="tel:9789825684"
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#075C32] text-xs font-bold text-[#075C32]"
              >
                <Phone className="w-4 h-4 text-[#12834B]" />
                <span>{t.nav.callUs}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
