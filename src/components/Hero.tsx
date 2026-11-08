import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ShieldCheck, Calendar, ArrowRight, Award, CheckCircle2, PhoneCall } from 'lucide-react';

interface HeroProps {
  lang: Language;
  onExploreSchemes: () => void;
  onEnquireNow: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onExploreSchemes, onEnquireNow }) => {
  const t = TRANSLATIONS[lang];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#E5F2E8]/40 via-white to-white pt-8 pb-16 lg:pt-14 lg:pb-20 border-b border-slate-200/60">
      {/* Background ambient pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#075C32_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Trust Kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#075C32]/8 border border-[#075C32]/15 text-[#075C32] text-xs font-bold tracking-wide mb-4">
              <ShieldCheck className="w-4 h-4 text-[#12834B]" />
              <span className="truncate">{t.hero.kicker}</span>
            </div>

            {/* Headline with text-wrap: balance */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18] mb-5 [text-wrap:balance]">
              {t.hero.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl font-normal">
              {t.hero.subtitle}
            </p>

            {/* Trust Bullet Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 w-full max-w-xl">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#12834B] shrink-0" />
                <span>{t.hero.badgeRegistered}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <Calendar className="w-4 h-4 text-[#12834B] shrink-0" />
                <span>{t.hero.badgeDuration}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <Award className="w-4 h-4 text-[#C9A64A] shrink-0" />
                <span>{t.hero.badgeBonus}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#12834B] shrink-0" />
                <span>{t.hero.badgeDraw}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={onEnquireNow}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-[#075C32] hover:bg-[#12834B] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{t.hero.enquireNow}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreSchemes}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-[#075C32] bg-[#E5F2E8] hover:bg-[#d6ebd9] border border-[#12834B]/20 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <span>{t.hero.exploreSchemes}</span>
              </button>

              <a
                href="tel:9789825684"
                className="w-full sm:w-auto px-4 py-3.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-[#12834B]" />
                <span>9789825684</span>
              </a>
            </div>
          </div>

          {/* Right Column: High-Impact Official Identity Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#075C32] via-[#12834B] to-[#C9A64A]" />

              <div className="flex flex-col items-center text-center">
                {/* Official Round Logo */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 border-4 border-[#075C32]/20 shadow-md mb-4 bg-white">
                  <img
                    src="/images/team-stars-logo.jpeg"
                    alt="Team Stars Chits Official Emblem"
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <h2 className="text-xl font-extrabold text-[#075C32] tracking-tight mb-1">
                  TEAM STARS CHITS
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest text-[#C9A64A] mb-3">
                  PRIVATE LIMITED
                </p>

                <div className="w-full h-px bg-slate-100 my-2" />

                {/* Verified Metadata List */}
                <div className="w-full space-y-2.5 text-left text-xs text-slate-600 my-3">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">CIN:</span>
                    <span className="font-mono font-bold text-slate-800">U64990TN2025PTC181717</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">{lang === 'ta' ? 'மாத தவணை' : 'Auction / Draw'}:</span>
                    <span className="font-semibold text-[#075C32]">11th of every month</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">{lang === 'ta' ? 'தொகை வழங்கல்' : 'Disbursement'}:</span>
                    <span className="font-semibold text-[#075C32]">By 25th of month</span>
                  </div>
                  <div className="flex items-start justify-between py-1">
                    <span className="font-semibold text-slate-500 shrink-0">{lang === 'ta' ? 'அலுவலகம்' : 'Location'}:</span>
                    <span className="text-right text-slate-700 font-medium">Villukuri, Kanyakumari</span>
                  </div>
                </div>

                <div className="w-full mt-2 pt-3 bg-[#E5F2E8]/60 rounded-xl p-3 border border-[#12834B]/15">
                  <p className="text-[11px] text-[#075C32] font-semibold">
                    {lang === 'ta' 
                      ? '10-ஆம் தேதிக்குள் தவணை செலுத்தும் உறுப்பினர்களுக்கு சிறப்பு போனஸ் உண்டு!'
                      : 'Special Bonus rewarded to members paying instalments on or before the 10th!'}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom 4-Column Stat Strip */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#075C32] font-mono tabular-nums">
              {t.hero.trustStat1Value}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
              {t.hero.trustStat1Label}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#075C32] font-mono tabular-nums">
              {t.hero.trustStat2Value}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
              {t.hero.trustStat2Label}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#075C32] font-mono tabular-nums">
              {t.hero.trustStat3Value}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
              {t.hero.trustStat3Label}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#C9A64A] font-mono tabular-nums">
              {t.hero.trustStat4Value}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
              {t.hero.trustStat4Label}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
