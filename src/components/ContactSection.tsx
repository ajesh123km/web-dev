import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { MapPin, Phone, Mail, Clock, Copy, Check, ExternalLink } from 'lucide-react';
import { FintechCard3D } from './3d/FintechCard3D';
import { MotionSection } from './3d/MotionSection';

interface ContactSectionProps {
  lang: Language;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ lang }) => {
  const [copied, setCopied] = useState(false);
  const t = TRANSLATIONS[lang];

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(t.contact.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="contact" className="py-12 sm:py-16 lg:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <MotionSection className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 bg-[#064E3B] text-[#65E83A] border border-[#0B5D46] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest mb-3 pubzi-chamfer-sm">
            <MapPin className="w-3.5 h-3.5 text-[#65E83A]" />
            <span>{lang === 'ta' ? 'அலுவலக தொடர்பு' : 'Direct Assistance'}</span>
          </div>
          <h2 className="heading-3d-pop text-2xl sm:text-4xl font-extrabold text-[#052E22] tracking-tight leading-tight [text-wrap:balance]">
            {t.contact.title}
          </h2>
          <p className="mt-3 text-sm sm:text-lg text-[#0B3B2C] font-medium leading-relaxed">
            {t.contact.subtitle}
          </p>
        </MotionSection>

        {/* Contact Info Grid + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

          {/* Left Column: Official Contact Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 min-w-0">

            {/* Deep Emerald Forest Address Card */}
            <div className="reveal">
              <FintechCard3D accent="forest" className="p-4 sm:p-6 rounded-2xl fintech-card-forest pubzi-chamfer text-white">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-[#65E83A] font-bold text-sm">
                  <MapPin className="w-4 h-4 shrink-0 text-[#65E83A]" />
                  <span>{t.contact.addressLabel}</span>
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="text-xs text-white hover:text-[#65E83A] flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 border border-[#65E83A]/40 transition-colors shrink-0 cursor-pointer"
                  title="Copy address to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#65E83A]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t.contact.copied : t.contact.copyAddress}</span>
                </button>
              </div>
              <p className="text-sm font-bold text-white leading-relaxed">
                TEAM STARS CHITS PRIVATE LIMITED
              </p>
              <p className="text-xs sm:text-sm text-[#D1FAE5] leading-relaxed mt-1">
                {t.contact.address}
              </p>
              <div className="mt-3 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs text-[#65E83A] font-mono tabular-nums">
                <span>CIN: U64990TN2025PTC181717</span>
                <span>PIN: 629180</span>
              </div>
              </FintechCard3D>
            </div>

            {/* Direct Phone & Email Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="tel:9789825684"
                className="reveal reveal-delay-100 p-5 rounded-2xl fintech-card-ash hover:border-white/50 transition-all group block"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B3B2C] mb-2">
                  <Phone className="w-4 h-4 text-[#064E3B] group-hover:scale-110 transition-transform" />
                  <span>{t.contact.phoneLabel}</span>
                </div>
                <span className="text-base font-extrabold text-[#052E22] block font-mono tabular-nums">
                  +91 9789825684
                </span>
                <span className="text-[11px] text-[#0B3B2C] font-medium block mt-1">
                  {lang === 'ta' ? 'அழைக்க கிளிக் செய்க' : 'Click to Call directly'}
                </span>
              </a>

              <a
                href="mailto:teamstarschitsprivatelimited@gmail.com"
                className="reveal reveal-delay-200 p-5 rounded-2xl fintech-card-ash hover:border-white/50 transition-all group block min-w-0"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B3B2C] mb-2">
                  <Mail className="w-4 h-4 text-[#064E3B] group-hover:scale-110 transition-transform" />
                  <span>{t.contact.emailLabel}</span>
                </div>
                <span className="text-xs font-bold text-[#052E22] block truncate">
                  teamstarschitsprivatelimited@gmail.com
                </span>
                <span className="text-[11px] text-[#0B3B2C] font-medium block mt-1">
                  {lang === 'ta' ? 'மின்னஞ்சல் அனுப்புக' : 'Official correspondence'}
                </span>
              </a>
            </div>

            {/* Business Hours & Draw Timetable */}
            <div className="reveal reveal-delay-200 p-5 rounded-2xl fintech-card-mint flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#064E3B] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-[#052E22] block mb-0.5">
                  {t.contact.hoursLabel}: {t.contact.hours}
                </span>
                <p className="text-[#0B3B2C] leading-relaxed font-medium">
                  {t.contact.hoursNote}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Google Maps Embed and Directions */}
          <div className="reveal reveal-delay-200 lg:col-span-7 flex flex-col justify-between rounded-2xl border border-white/30 overflow-hidden bg-white/35 backdrop-blur-md pubzi-chamfer shadow-xl min-w-0">
            <div className="p-3.5 sm:p-4 bg-emerald-500/12 backdrop-blur-md border-b border-white/25 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#052E22]">
                <MapPin className="w-4 h-4 text-[#064E3B] shrink-0" />
                <span>{t.contact.locationHeading}</span>
              </div>
              <a
                href="https://maps.google.com/?q=Villukuri,+Kalkulam,+Kanyakumari+District,+Tamil+Nadu+629180"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#064E3B] hover:underline flex items-center gap-1 transition-colors shrink-0"
              >
                <span>{t.contact.openInMaps}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Embedded Interactive Map */}
            <div className="w-full h-64 sm:h-80 md:h-96 relative bg-emerald-500/10">
              <iframe
                title="Villukuri Kanyakumari Office Location"
                src="https://maps.google.com/maps?q=Villukuri,+Kalkulam,+Kanyakumari+District,+Tamil+Nadu+629180&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>

            <div className="p-3.5 sm:p-4 bg-emerald-500/12 backdrop-blur-md border-t border-white/25 text-xs text-[#0B3B2C] font-medium flex flex-wrap items-center justify-between gap-2">
              <span>Landmark: Madathattuvillai Road, Villukuri</span>
              <span className="font-bold text-[#052E22]">Kalkulam Taluk</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
