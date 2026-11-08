import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { MapPin, Phone, Mail, Clock, Copy, Check, ExternalLink } from 'lucide-react';

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
    <section id="contact" className="py-16 lg:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E5F2E8] text-[#075C32] text-xs font-bold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#12834B]" />
            <span>{lang === 'ta' ? 'அலுவலக தொடர்பு' : 'Direct Assistance'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight [text-wrap:balance]">
            {t.contact.title}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            {t.contact.subtitle}
          </p>
        </div>

        {/* Contact Info Grid + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Official Contact Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            
            {/* Address Card */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 text-[#075C32] font-bold text-sm">
                  <MapPin className="w-4 h-4 shrink-0 text-[#12834B]" />
                  <span>{t.contact.addressLabel}</span>
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="text-xs text-slate-500 hover:text-[#075C32] flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 transition-colors"
                  title="Copy address to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t.contact.copied : t.contact.copyAddress}</span>
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                TEAM STARS CHITS PRIVATE LIMITED
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
                {t.contact.address}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>CIN: U64990TN2025PTC181717</span>
                <span>PIN: 629180</span>
              </div>
            </div>

            {/* Direct Phone & Email Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="tel:9789825684"
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#12834B] hover:shadow-xs transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                  <Phone className="w-4 h-4 text-[#12834B] group-hover:scale-110 transition-transform" />
                  <span>{t.contact.phoneLabel}</span>
                </div>
                <span className="text-base font-extrabold text-[#075C32] block font-mono">
                  +91 9789825684
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  {lang === 'ta' ? 'அழைக்க கிளிக் செய்க' : 'Click to Call directly'}
                </span>
              </a>

              <a
                href="mailto:teamstarschitsprivatelimited@gmail.com"
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#12834B] hover:shadow-xs transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                  <Mail className="w-4 h-4 text-[#12834B] group-hover:scale-110 transition-transform" />
                  <span>{t.contact.emailLabel}</span>
                </div>
                <span className="text-xs font-bold text-[#075C32] block truncate">
                  teamstarschitsprivatelimited@gmail.com
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  {lang === 'ta' ? 'மின்னஞ்சல் அனுப்புக' : 'Official correspondence'}
                </span>
              </a>
            </div>

            {/* Business Hours & Draw Timetable */}
            <div className="p-5 rounded-2xl bg-[#E5F2E8]/60 border border-[#12834B]/20 flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#075C32] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-[#075C32] block mb-0.5">
                  {t.contact.hoursLabel}: {t.contact.hours}
                </span>
                <p className="text-[#075C32]/80 leading-relaxed font-medium">
                  {t.contact.hoursNote}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Google Maps Embed and Directions */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-[#075C32]" />
                <span>{t.contact.locationHeading}</span>
              </div>
              <a
                href="https://maps.google.com/?q=Villukuri,+Kalkulam,+Kanyakumari+District,+Tamil+Nadu+629180"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#075C32] hover:text-[#12834B] flex items-center gap-1 transition-colors"
              >
                <span>{t.contact.openInMaps}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Embedded Interactive Map */}
            <div className="w-full h-80 sm:h-96 relative bg-slate-100">
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

            <div className="p-4 bg-white border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span>Landmark: Madathattuvillai Road, Villukuri</span>
              <span className="font-semibold text-slate-700">Kalkulam Taluk</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
