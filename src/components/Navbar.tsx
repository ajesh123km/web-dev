import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { CHIT_SCHEMES } from '../data/schemes';
import {
  Menu,
  X,
  Phone,
  ShieldCheck,
  User,
  MapPin,
  Copy,
  Check,
  ChevronDown,
  Calculator,
  ArrowRight,
  Layers,
  Building2,
  ListChecks,
  Award,
  HelpCircle
} from 'lucide-react';

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
  const [openDropdown, setOpenDropdown] = useState<'schemes' | 'about' | null>(null);
  const [topBarHidden, setTopBarHidden] = useState(false);
  const [cinCopied, setCinCopied] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const t = TRANSLATIONS[lang];

  // Collapse top utility bar smoothly on scroll down; reveal near top
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY <= 16) {
        setTopBarHidden(false);
      } else if (currentY > 44 && currentY > lastScrollY) {
        setTopBarHidden(true);
      } else if (currentY < lastScrollY - 8 && currentY <= 44) {
        setTopBarHidden(false);
      }
      lastScrollY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close desktop dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCopyCin = () => {
    navigator.clipboard?.writeText('U64990TN2025PTC181717').catch(() => {});
    setCinCopied(true);
    setTimeout(() => setCinCopied(false), 2000);
  };

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  const aboutGroupLinks = [
    {
      id: 'about',
      label: t.nav.about,
      desc: lang === 'ta' ? 'நிறுவன பின்னணி & பதிவு விவரம்' : 'Corporate profile & registration',
      icon: Building2
    },
    {
      id: 'how-it-works',
      label: t.nav.howItWorks,
      desc: lang === 'ta' ? '6-படிநிலை சீட்டு நடைமுறை' : 'Step-by-step 20-month process',
      icon: ListChecks
    },
    {
      id: 'why-us',
      label: t.nav.whyUs,
      desc: lang === 'ta' ? 'நம்பகத்தன்மை & போனஸ் நன்மைகள்' : 'Transparent draws & bonus pillars',
      icon: Award
    },
    {
      id: 'faq',
      label: t.nav.faq,
      desc: lang === 'ta' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'Answers on schemes & payouts',
      icon: HelpCircle
    }
  ];

  const isAboutGroupActive = ['about', 'how-it-works', 'why-us', 'faq'].includes(activeSection);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 w-full">
      {/* 1. Top Utility Bar (Dark Emerald Green #06281c, smoothly collapses on scroll down) */}
      <div
        className={`bg-[#06281c] text-[#ECFDF5] border-b border-emerald-400/15 transition-all duration-300 ease-out overflow-hidden ${
          topBarHidden ? 'max-h-0 opacity-0 border-b-0' : 'max-h-14 opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-3 text-[11px] sm:text-xs">
          {/* Left side: Glowing lime status dot + CIN + copy button + divider + MapPin + Address */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                aria-hidden="true"
                className="w-2 h-2 rounded-full bg-[#65E83A] shadow-[0_0_8px_#65E83A] shrink-0"
              />
              <span className="font-mono tabular-nums truncate">
                <span className="text-[#65E83A] font-bold">CIN:</span>{' '}
                <span className="text-white font-semibold tracking-wide">
                  U64990TN2025PTC181717
                </span>
              </span>
              <button
                type="button"
                onClick={handleCopyCin}
                className="inline-flex items-center justify-center p-1 rounded hover:bg-emerald-500/20 text-[#A7F3D0] hover:text-[#65E83A] transition-colors shrink-0 cursor-pointer"
                title={cinCopied ? 'CIN Copied' : 'Copy CIN'}
                aria-label="Copy CIN number to clipboard"
              >
                {cinCopied ? (
                  <Check className="w-3 h-3 text-[#65E83A]" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>

            <span
              aria-hidden="true"
              className="hidden md:inline-block h-3.5 w-px bg-emerald-400/25 shrink-0"
            />

            <div className="hidden md:flex items-center gap-1.5 min-w-0 text-[#A7F3D0]">
              <MapPin className="w-3.5 h-3.5 text-[#65E83A] shrink-0" />
              <span className="truncate font-medium">
                Madathattuvillai, Villukuri, Kanyakumari – 629180
              </span>
            </div>
          </div>

          {/* Right side: Green Phone + clickable number + divider + Admin pill button */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <a
              href="tel:9789825684"
              className="inline-flex items-center gap-1.5 text-white hover:text-[#65E83A] font-semibold font-mono tabular-nums transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-[#65E83A] shrink-0" />
              <span>9789825684</span>
            </a>

            <span
              aria-hidden="true"
              className="hidden sm:inline-block h-3.5 w-px bg-emerald-400/25 shrink-0"
            />

            <button
              type="button"
              onClick={onOpenAdmin}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-[#65E83A]/35 text-[11px] font-semibold text-[#ECFDF5] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              title="Official Admin Management"
            >
              <ShieldCheck className="w-3 h-3 text-[#65E83A] shrink-0" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar (Clean White surface with subtle bottom border & shadow) */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/85 shadow-[0_4px_20px_-6px_rgba(6,40,28,0.10)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[72px] gap-3 lg:gap-4">
            {/* Left: Brand (Existing circular logo + TEAM STARS CHITS + REGISTERED CHIT FUND) */}
            <button
              type="button"
              onClick={() => handleLinkClick('home')}
              className="flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer select-none min-w-0 shrink-0 group focus-visible:outline-none"
            >
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#064E3B]/25 shadow-xs group-hover:scale-105 transition-transform bg-white shrink-0">
                <img
                  src="/images/team-stars-logo.jpeg"
                  alt="TEAM STARS CHITS PRIVATE LIMITED Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base lg:text-[17px] font-extrabold tracking-tight leading-none whitespace-nowrap">
                  <span className="text-[#0F172A]">
                    {lang === 'ta' ? 'டீம் ஸ்டார்ஸ் ' : 'TEAM STARS '}
                  </span>
                  <span className="text-[#059669]">
                    {lang === 'ta' ? 'சிட்ஸ்' : 'CHITS'}
                  </span>
                </div>
                <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 leading-none mt-1 whitespace-nowrap">
                  REGISTERED CHIT FUND
                </span>
              </div>
            </button>

            {/* Center: Consolidated 5-item Navigation (Desktop) */}
            <nav
              aria-label="Primary Navigation"
              className="hidden lg:flex items-center gap-0.5 xl:gap-1.5"
            >
              {/* 1. Home */}
              <button
                type="button"
                onClick={() => handleLinkClick('home')}
                className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-[12px] xl:text-[13px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSection === 'home'
                    ? 'bg-slate-100 text-[#06281c] font-bold'
                    : 'text-slate-600 font-semibold hover:text-[#06281c] hover:bg-slate-50'
                }`}
              >
                {t.nav.home}
              </button>

              {/* 2. Schemes (Dropdown) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown((prev) => (prev === 'schemes' ? null : 'schemes'))
                  }
                  aria-expanded={openDropdown === 'schemes'}
                  aria-haspopup="true"
                  className={`inline-flex items-center gap-1 px-2.5 xl:px-3.5 py-1.5 rounded-full text-[12px] xl:text-[13px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeSection === 'schemes' || openDropdown === 'schemes'
                      ? 'bg-slate-100 text-[#06281c] font-bold'
                      : 'text-slate-600 font-semibold hover:text-[#06281c] hover:bg-slate-50'
                  }`}
                >
                  <span>{t.nav.schemes}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                      openDropdown === 'schemes' ? 'rotate-180 text-[#059669]' : ''
                    }`}
                  />
                </button>

                {openDropdown === 'schemes' && (
                  <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl bg-white border border-slate-200/90 shadow-[0_18px_40px_-12px_rgba(6,40,28,0.18)] p-2 z-50 animate-in fade-in duration-150">
                    <button
                      type="button"
                      onClick={() => handleLinkClick('schemes')}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left hover:bg-emerald-50/80 transition-colors cursor-pointer group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-[#06281c] text-[#65E83A] flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-[#0F172A] group-hover:text-[#059669]">
                          {lang === 'ta' ? 'அனைத்து சீட்டு திட்டங்கள்' : 'All Chit Schemes'}
                        </span>
                        <span className="block text-[11px] text-slate-500 truncate">
                          {lang === 'ta' ? '20 மாத அதிகாரப்பூர்வ அட்டவணை' : 'Compare all 20-month rate cards'}
                        </span>
                      </div>
                    </button>

                    <div className="my-1.5 h-px bg-slate-100" />

                    <div className="space-y-0.5">
                      {CHIT_SCHEMES.map((scheme) => (
                        <button
                          key={scheme.id}
                          type="button"
                          onClick={() => handleLinkClick('schemes')}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#059669] transition-colors cursor-pointer"
                        >
                          <span className="font-mono font-bold text-[#06281c]">
                            {scheme.chitValueFormatted}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {scheme.durationMonths} {lang === 'ta' ? 'மாதம்' : 'Months'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Calculator (with small green calculator icon on the left) */}
              <button
                type="button"
                onClick={() => handleLinkClick('calculator')}
                className={`inline-flex items-center gap-1.5 px-2.5 xl:px-3.5 py-1.5 rounded-full text-[12px] xl:text-[13px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSection === 'calculator'
                    ? 'bg-slate-100 text-[#06281c] font-bold'
                    : 'text-slate-600 font-semibold hover:text-[#06281c] hover:bg-slate-50'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                <span>{t.nav.calculator}</span>
              </button>

              {/* 4. About (Dropdown grouping About Us, How It Works, Why Choose Us, FAQ) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown((prev) => (prev === 'about' ? null : 'about'))
                  }
                  aria-expanded={openDropdown === 'about'}
                  aria-haspopup="true"
                  className={`inline-flex items-center gap-1 px-2.5 xl:px-3.5 py-1.5 rounded-full text-[12px] xl:text-[13px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isAboutGroupActive || openDropdown === 'about'
                      ? 'bg-slate-100 text-[#06281c] font-bold'
                      : 'text-slate-600 font-semibold hover:text-[#06281c] hover:bg-slate-50'
                  }`}
                >
                  <span>{lang === 'ta' ? 'நிறுவனம்' : 'About'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                      openDropdown === 'about' ? 'rotate-180 text-[#059669]' : ''
                    }`}
                  />
                </button>

                {openDropdown === 'about' && (
                  <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-white border border-slate-200/90 shadow-[0_18px_40px_-12px_rgba(6,40,28,0.18)] p-2 z-50 animate-in fade-in duration-150">
                    {aboutGroupLinks.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleLinkClick(item.id)}
                          className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer group ${
                            isActive ? 'bg-emerald-50/90' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isActive
                                ? 'bg-[#06281c] text-[#65E83A]'
                                : 'bg-slate-100 text-[#059669] group-hover:bg-[#06281c] group-hover:text-[#65E83A]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-[#0F172A] group-hover:text-[#059669]">
                              {item.label}
                            </span>
                            <span className="block text-[11px] text-slate-500 leading-snug">
                              {item.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 5. Contact */}
              <button
                type="button"
                onClick={() => handleLinkClick('contact')}
                className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-[12px] xl:text-[13px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSection === 'contact'
                    ? 'bg-slate-100 text-[#06281c] font-bold'
                    : 'text-slate-600 font-semibold hover:text-[#06281c] hover:bg-slate-50'
                }`}
              >
                {t.nav.contact}
              </button>
            </nav>

            {/* Right: Action Controls (EN/தமிழ் Segmented Pill, Member Portal, Enquire Now →) */}
            <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
              {/* Language Switcher Segmented Pill */}
              <div
                role="group"
                aria-label="Language Switcher"
                className="inline-flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200/80 shrink-0"
              >
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={`px-2 xl:px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                    lang === 'en'
                      ? 'bg-white text-[#06281c] font-bold shadow-xs'
                      : 'text-slate-500 font-semibold hover:text-slate-800'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('ta')}
                  className={`px-2 xl:px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                    lang === 'ta'
                      ? 'bg-white text-[#06281c] font-bold shadow-xs'
                      : 'text-slate-500 font-semibold hover:text-slate-800'
                  }`}
                >
                  தமிழ்
                </button>
              </div>

              {/* Member Portal Outlined Pill */}
              <button
                type="button"
                onClick={onOpenUser}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 xl:px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[11px] xl:text-xs font-bold text-[#0F172A] shadow-2xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Chit Fund Member Portal / பயனர் தளம்"
              >
                <User className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>{lang === 'ta' ? 'பயனர் தளம்' : 'Member Portal'}</span>
              </button>

              {/* Enquire Now → High-Contrast Lime-to-Green Gradient Pill */}
              <button
                type="button"
                onClick={onOpenEnquiry}
                className="hidden min-[440px]:inline-flex items-center justify-center gap-1.5 px-3.5 xl:px-4 py-2 rounded-full bg-gradient-to-r from-[#65E83A] via-[#4ADE80] to-[#22C55E] hover:brightness-105 text-[#06281c] text-[11px] xl:text-xs font-extrabold tracking-wide shadow-[0_8px_20px_-6px_rgba(34,197,94,0.5)] transition-all whitespace-nowrap shrink-0 active:scale-95 cursor-pointer"
              >
                <span>{t.nav.enquireNow}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
              </button>

              {/* Mobile Hamburger Trigger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="lg:hidden p-2 rounded-full text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Toggle Navigation Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 shadow-2xl transition-all max-h-[82vh] overflow-y-auto">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => handleLinkClick('home')}
              className={`text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeSection === 'home'
                  ? 'bg-slate-100 text-[#06281c] font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t.nav.home}
            </button>

            <button
              type="button"
              onClick={() => handleLinkClick('schemes')}
              className={`text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeSection === 'schemes'
                  ? 'bg-slate-100 text-[#06281c] font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t.nav.schemes}
            </button>

            <button
              type="button"
              onClick={() => handleLinkClick('calculator')}
              className={`flex items-center gap-2 text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeSection === 'calculator'
                  ? 'bg-slate-100 text-[#06281c] font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Calculator className="w-4 h-4 text-[#059669]" />
              <span>{t.nav.calculator}</span>
            </button>

            <div className="mt-1 pt-2 border-t border-slate-100">
              <span className="px-3.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {lang === 'ta' ? 'நிறுவனம் & தகவல்கள்' : 'About & Resources'}
              </span>
              {aboutGroupLinks.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleLinkClick(item.id)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    activeSection === item.id
                      ? 'bg-slate-100 text-[#06281c] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleLinkClick('contact')}
              className={`text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeSection === 'contact'
                  ? 'bg-slate-100 text-[#06281c] font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t.nav.contact}
            </button>

            <div className="pt-3 mt-2 border-t border-slate-200 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onOpenEnquiry();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#65E83A] via-[#4ADE80] to-[#22C55E] text-[#06281c] text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>{t.nav.enquireNow}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenUser();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-[#0F172A] bg-white border border-slate-200 rounded-full"
              >
                <User className="w-4 h-4 text-slate-600" />
                <span>{lang === 'ta' ? 'பயனர் தளம் (Member Portal)' : 'Member Portal'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                  <span>{t.nav.adminPortal}</span>
                </button>

                <a
                  href="tel:9789825684"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 text-xs font-bold text-[#06281c] hover:bg-slate-50 tabular-nums"
                >
                  <Phone className="w-3.5 h-3.5 text-[#059669]" />
                  <span>9789825684</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
