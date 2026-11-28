import React, { useState, useEffect } from 'react';
import { Language } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { SchemesSection } from './components/SchemesSection';
import { PublicAnnouncements } from './components/PublicAnnouncements';
import { ChitCalculator } from './components/ChitCalculator';
import { HowItWorks } from './components/HowItWorks';
import { WhyChooseUs } from './components/WhyChooseUs';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { EnquiryForm } from './components/EnquiryForm';
import { Footer } from './components/Footer';
import { AdminPortal } from './components/AdminPortal';
import { UserPortal } from './components/UserPortal';
import { LegalModal } from './components/LegalModal';
import { VideoBackground } from './components/VideoBackground';
import { GoldCoinClickBurst } from './components/GoldCoinClickBurst';
import { LogoIntroAnimation } from './components/LogoIntroAnimation';
import { useScrollReveal } from './hooks/useScrollReveal';
import { publicSupabase } from './supabase';

export default function App() {
  useScrollReveal();

  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('teamstars_lang');
    return saved === 'ta' ? 'ta' : 'en';
  });

  const [activeSection, setActiveSection] = useState<string>('home');
  const [selectedSchemeForEnquiry, setSelectedSchemeForEnquiry] = useState<string>('₹2,00,000 Scheme');
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [userOpen, setUserOpen] = useState<boolean>(false);
  const [legalOpen, setLegalOpen] = useState<boolean>(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');

  // Sync html lang attribute and storage
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('teamstars_lang', newLang);
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (!publicSupabase) return;

    const supabase = publicSupabase;
    const refreshSchemes = () => window.dispatchEvent(new Event('teamstars:schemes-updated'));
    const refreshAnnouncements = () => window.dispatchEvent(new Event('teamstars:announcements-updated'));
    const channel = supabase
      .channel('public-website-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chit_schemes' }, refreshSchemes)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, refreshAnnouncements)
      .subscribe((status, error) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`[Supabase Realtime] Public content subscription ${status.toLowerCase()}: ${error?.message || 'No details.'}`);
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleSelectSchemeForEnquiry = (schemeName: string) => {
    setSelectedSchemeForEnquiry(schemeName);
    scrollToSection('enquiry-form');
  };

  const handleOpenLegal = (tab: 'privacy' | 'terms') => {
    setLegalTab(tab);
    setLegalOpen(true);
  };

  return (
    <div className={`min-h-screen text-[#052E22] flex flex-col font-sans relative ${lang === 'ta' ? 'font-tamil' : ''}`}>
      {/* Fixed Full-Screen Looping 3D Green Rupee Video Background (z-index: -1) */}
      <VideoBackground />

      {/* Non-Blocking Global Gold Coin & Sparkle Click Burst Overlay */}
      <GoldCoinClickBurst />

      {/* 3D Logo Loading / Intro Animation Overlay (plays once per session) */}
      <LogoIntroAnimation />

      {/* Navigation Bar */}
      <Navbar
        lang={lang}
        onLanguageChange={handleLanguageChange}
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenUser={() => setUserOpen(true)}
        onOpenEnquiry={() => scrollToSection('enquiry-form')}
      />

      {/* Main Content Sections with Translucent Frosted Glassmorphism Surfaces */}
      <main className="intro-page-content flex-1 relative z-10 w-full max-w-[1440px] mx-auto px-2.5 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 lg:space-y-10">
        {/* 1. Hero Section */}
        <div className="bg-gradient-to-br from-white/30 via-white/24 to-white/18 backdrop-blur-lg rounded-3xl border border-white/30 shadow-xl overflow-hidden isolate bg-clip-padding">
          <Hero
            lang={lang}
            onExploreSchemes={() => scrollToSection('schemes')}
            onEnquireNow={() => scrollToSection('enquiry-form')}
          />
        </div>

        {/* 2. About Us Section */}
        <div className="bg-gradient-to-br from-white/30 via-white/24 to-white/18 backdrop-blur-lg rounded-3xl border border-white/30 shadow-xl overflow-hidden isolate bg-clip-padding">
          <AboutSection lang={lang} />
        </div>

        {/* 3. Chit Fund Schemes Section with 20-Month Modal */}
        <div className="bg-gradient-to-br from-white/30 via-white/24 to-white/18 backdrop-blur-lg rounded-3xl border border-white/30 shadow-xl overflow-hidden isolate bg-clip-padding">
          <SchemesSection
            lang={lang}
            onSelectSchemeForEnquiry={handleSelectSchemeForEnquiry}
          />
        </div>

        <PublicAnnouncements lang={lang} />

        {/* 4. Interactive Chit Calculator */}
        <div className="bg-gradient-to-br from-white/30 via-white/24 to-white/18 backdrop-blur-lg rounded-3xl border border-white/30 shadow-xl overflow-hidden isolate bg-clip-padding">
          <ChitCalculator
            lang={lang}
            onEnquireScheme={handleSelectSchemeForEnquiry}
          />
        </div>

        {/* 5. How It Works Step-by-Step */}
        <div className="bg-gradient-to-br from-white/30 via-white/24 to-white/18 backdrop-blur-lg rounded-3xl border border-white/30 shadow-xl overflow-hidden isolate bg-clip-padding">
          <HowItWorks lang={lang} />
        </div>

        {/* 6. Why Choose Us */}
        <div className="bg-gradient-to-br from-white/30 via-white/24 to-white/18 backdrop-blur-lg rounded-3xl border border-white/30 shadow-xl overflow-hidden isolate bg-clip-padding">
          <WhyChooseUs lang={lang} />
        </div>

        {/* 7. Frequently Asked Questions Preview & Full Accordion */}
        <div className="bg-gradient-to-br from-white/30 via-white/24 to-white/18 backdrop-blur-lg rounded-3xl border border-white/30 shadow-xl overflow-hidden isolate bg-clip-padding">
          <FaqSection lang={lang} />
        </div>

        {/* 8. Office Contact & Interactive Google Maps */}
        <div className="bg-gradient-to-br from-white/30 via-white/24 to-white/18 backdrop-blur-lg rounded-3xl border border-white/30 shadow-xl overflow-hidden isolate bg-clip-padding">
          <ContactSection lang={lang} />
        </div>

        {/* 9. Join / Enquiry Form */}
        <div className="bg-gradient-to-br from-white/30 via-white/24 to-white/18 backdrop-blur-lg rounded-3xl border border-white/30 shadow-xl overflow-hidden isolate bg-clip-padding">
          <EnquiryForm
            lang={lang}
            preSelectedScheme={selectedSchemeForEnquiry}
          />
        </div>
      </main>

      {/* Footer */}
      <div className="intro-page-content">
        <Footer
          lang={lang}
          onNavigate={scrollToSection}
          onOpenLegal={handleOpenLegal}
          onOpenAdmin={() => setAdminOpen(true)}
        />
      </div>

      {/* Admin Chit Fund Management Console Modal */}
      <AdminPortal
        lang={lang}
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
      />

      {/* Member Portal & Dashboard Modal */}
      <UserPortal
        lang={lang}
        isOpen={userOpen}
        onClose={() => setUserOpen(false)}
      />

      {/* Legal & Privacy Policy Modal */}
      <LegalModal
        isOpen={legalOpen}
        onClose={() => setLegalOpen(false)}
        lang={lang}
        initialTab={legalTab}
      />
    </div>
  );
}
