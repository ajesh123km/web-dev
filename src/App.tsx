import React, { useState, useEffect } from 'react';
import { Language } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { SchemesSection } from './components/SchemesSection';
import { ChitCalculator } from './components/ChitCalculator';
import { HowItWorks } from './components/HowItWorks';
import { WhyChooseUs } from './components/WhyChooseUs';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { EnquiryForm } from './components/EnquiryForm';
import { Footer } from './components/Footer';
import { AdminPortal } from './components/AdminPortal';
import { LegalModal } from './components/LegalModal';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('teamstars_lang');
    return saved === 'ta' ? 'ta' : 'en';
  });

  const [activeSection, setActiveSection] = useState<string>('home');
  const [selectedSchemeForEnquiry, setSelectedSchemeForEnquiry] = useState<string>('₹2,00,000 Scheme');
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
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
    <div className={`min-h-screen bg-[#F8FAF9] text-slate-800 flex flex-col font-sans ${lang === 'ta' ? 'font-tamil' : ''}`}>
      {/* Navigation Bar */}
      <Navbar
        lang={lang}
        onLanguageChange={handleLanguageChange}
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenEnquiry={() => scrollToSection('enquiry-form')}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero
          lang={lang}
          onExploreSchemes={() => scrollToSection('schemes')}
          onEnquireNow={() => scrollToSection('enquiry-form')}
        />

        {/* 2. About Us Section */}
        <AboutSection lang={lang} />

        {/* 3. Chit Fund Schemes Section with 20-Month Modal */}
        <SchemesSection
          lang={lang}
          onSelectSchemeForEnquiry={handleSelectSchemeForEnquiry}
        />

        {/* 4. Interactive Chit Calculator */}
        <ChitCalculator
          lang={lang}
          onEnquireScheme={handleSelectSchemeForEnquiry}
        />

        {/* 5. How It Works Step-by-Step */}
        <HowItWorks lang={lang} />

        {/* 6. Why Choose Us */}
        <WhyChooseUs lang={lang} />

        {/* 7. Frequently Asked Questions Preview & Full Accordion */}
        <FaqSection lang={lang} />

        {/* 8. Office Contact & Interactive Google Maps */}
        <ContactSection lang={lang} />

        {/* 9. Join / Enquiry Form */}
        <EnquiryForm
          lang={lang}
          preSelectedScheme={selectedSchemeForEnquiry}
        />
      </main>

      {/* Footer */}
      <Footer
        lang={lang}
        onNavigate={scrollToSection}
        onOpenLegal={handleOpenLegal}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Admin Enquiry Management Modal */}
      <AdminPortal
        lang={lang}
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
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
