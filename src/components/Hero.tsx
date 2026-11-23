import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ShieldCheck, Calendar, ArrowRight, PhoneCall, Sparkles, Wallet, BarChart3 } from 'lucide-react';
import { RupeeCoinScene } from './3d/RupeeCoinScene';
import { FintechCard3D } from './3d/FintechCard3D';
import { MotionSection } from './3d/MotionSection';

interface HeroProps {
  lang: Language;
  onExploreSchemes: () => void;
  onEnquireNow: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onExploreSchemes, onEnquireNow }) => {
  const t = TRANSLATIONS[lang];

  return (
    <section className="relative overflow-hidden bg-transparent pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-20">
      {/* Geometric Corner Accent Shapes */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute top-10 right-12 w-36 h-36 border-2 border-[#064E3B]/15 rotate-12 pointer-events-none pubzi-chamfer"
      />
      <div
        aria-hidden="true"
        className="absolute -top-24 right-0 w-[540px] h-[540px] rounded-full bg-gradient-to-br from-[#65E83A]/20 via-white/40 to-transparent blur-[110px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-[440px] h-[440px] rounded-full bg-[#A7F3D0]/30 blur-[100px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* Left Column: Oversized Display Statement + Kicker + CTAs */}
          <MotionSection className="lg:col-span-6 flex flex-col items-start text-left min-w-0">
            {/* Deep Emerald Sub-Text Ribbon */}
            <div className="inline-flex items-center gap-2.5 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-[#064E3B] border border-emerald-400/30 text-[#65E83A] px-3.5 py-1.5 text-[11px] font-extrabold tracking-widest uppercase pubzi-chamfer-sm shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-[#65E83A] shrink-0" />
                <span>{t.hero.kicker}</span>
              </span>
              <span className="hidden sm:inline-block h-0.5 w-8 bg-[#064E3B]/35" aria-hidden="true" />
            </div>

            {/* Architectural Display Headline */}
            <h1 className="heading-3d-pop text-[clamp(2rem,4.1vw,3.55rem)] font-extrabold text-[#052E22] tracking-tight leading-[1.06] mb-4 sm:mb-5 [text-wrap:balance]">
              {t.hero.title}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-[#264D40] leading-relaxed mb-6 sm:mb-7 max-w-xl font-normal">
              {t.hero.subtitle}
            </p>

            {/* 2x2 Chamfered Feature Tiles with 3D Extruded Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7 sm:mb-8 w-full max-w-xl">
              <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#052E22] bg-white border border-[#064E3B]/14 shadow-2xs pubzi-chamfer-sm px-3.5 py-2.5 group">
                <span className="w-8 h-8 rounded-lg fintech-3d-icon-forest flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5">
                  <ShieldCheck className="w-4 h-4 text-[#65E83A]" />
                </span>
                <span>{t.hero.badgeRegistered}</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#052E22] bg-white border border-[#064E3B]/14 shadow-2xs pubzi-chamfer-sm px-3.5 py-2.5 group">
                <span className="w-8 h-8 rounded-lg fintech-3d-icon-token flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5">
                  <Calendar className="w-4 h-4 text-[#064E3B]" />
                </span>
                <span>{t.hero.badgeDuration}</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#052E22] bg-white border border-[#064E3B]/14 shadow-2xs pubzi-chamfer-sm px-3.5 py-2.5 group">
                <span className="w-8 h-8 rounded-lg fintech-3d-icon-mint flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5">
                  <Wallet className="w-4 h-4 text-[#052E22]" />
                </span>
                <span>{t.hero.badgeBonus}</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#052E22] bg-white border border-[#064E3B]/14 shadow-2xs pubzi-chamfer-sm px-3.5 py-2.5 group">
                <span className="w-8 h-8 rounded-lg fintech-3d-icon-token flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5">
                  <BarChart3 className="w-4 h-4 text-[#064E3B]" />
                </span>
                <span>{t.hero.badgeDraw}</span>
              </div>
            </div>

            {/* Action Buttons + Direct Call Action */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={onEnquireNow}
                className="w-full sm:w-auto px-7 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white bg-[#064E3B] hover:bg-[#0B5D46] pubzi-chamfer-sm shadow-[0_12px_28px_-8px_rgba(6,78,59,0.42)] transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>{t.hero.enquireNow}</span>
                <ArrowRight className="w-4 h-4 text-[#65E83A]" />
              </button>

              <button
                onClick={onExploreSchemes}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-[#052E22] bg-white hover:bg-[#DCFCE7] border border-[#064E3B]/20 pubzi-chamfer-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.hero.exploreSchemes}</span>
              </button>

              <a
                href="tel:9789825684"
                className="w-full sm:w-auto px-4 py-3.5 text-xs font-bold text-[#052E22] hover:bg-[#65E83A]/30 bg-white border border-[#064E3B]/18 rounded-xl transition-colors flex items-center justify-center gap-2 tabular-nums"
              >
                <PhoneCall className="w-4 h-4 text-[#064E3B]" />
                <span>9789825684</span>
              </a>
            </div>
          </MotionSection>

          {/* Right Column: Geometric Showcase Frame + Floating 3D Rupee Stage */}
          <MotionSection delay={0.12} className="lg:col-span-6 flex flex-col items-center min-w-0 relative">
            <div className="w-full max-w-xl relative">
              {/* Architectural Backplate Accent Frame */}
              <div
                aria-hidden="true"
                className="hidden sm:block absolute -inset-2.5 translate-x-2 translate-y-2 rounded-2xl bg-[#65E83A]/20 border border-[#064E3B]/18 pubzi-chamfer pointer-events-none"
              />

              {/* Floating 3D Rendered Fintech Icons Flanking Perimeter */}
              <div
                aria-hidden="true"
                className="hidden sm:flex absolute -left-5 -top-5 z-20 w-14 h-14 rounded-2xl fintech-3d-icon-forest fintech-float-slow items-center justify-center pointer-events-none"
              >
                <ShieldCheck className="w-7 h-7 text-[#65E83A] drop-shadow-sm" />
              </div>

              <div
                aria-hidden="true"
                className="hidden sm:flex absolute -right-4 top-28 z-20 w-14 h-14 rounded-2xl fintech-3d-icon-token fintech-float-delayed items-center justify-center pointer-events-none"
              >
                <Wallet className="w-7 h-7 text-[#064E3B] drop-shadow-xs" />
              </div>

              <div
                aria-hidden="true"
                className="hidden sm:flex absolute -left-4 bottom-24 z-20 w-13 h-13 rounded-2xl fintech-3d-icon-mint fintech-float-reverse items-center justify-center pointer-events-none"
              >
                <BarChart3 className="w-6 h-6 text-[#052E22]" />
              </div>

              <FintechCard3D
                accent="mint"
                intensity="subtle"
                className="w-full rounded-2xl fintech-card overflow-hidden pubzi-chamfer relative"
              >
                {/* Crisp Light-Green to Emerald Top Accent Hairline */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#064E3B] via-[#65E83A] to-[#064E3B]" />

                {/* Interactive Three.js Bright White-Studio 3D Rupee Coin Ring Showcase */}
                <div className="relative bg-white border-b border-[#064E3B]/12">
                  <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-1 text-[11px] font-bold tracking-wider uppercase">
                    <span className="inline-flex items-center gap-1.5 text-[#064E3B]">
                      <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>
                        {lang === 'ta' ? '3D ₹ நாணய சுழல் வளையம்' : '3D ₹ Coin Ring'}
                      </span>
                    </span>
                  </div>

                  <RupeeCoinScene
                    variant="hero"
                    mode="carousel"
                    className="w-full h-[295px] sm:h-[360px]"
                  />
                </div>

                {/* Deep Emerald Executive Summary Panel */}
                <div className="p-4 sm:p-6 fintech-card-forest text-[#ECFDF5]">
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 border-2 border-[#65E83A]/85 shadow-[0_6px_18px_rgba(101,232,58,0.22)] bg-[#052E22] shrink-0">
                      <img
                        src="/images/team-stars-logo.jpeg"
                        alt="Team Stars Chits Official Emblem"
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="side-heading-3d-pop-dark text-base sm:text-lg font-extrabold text-white tracking-tight">
                        TEAM STARS CHITS
                      </h2>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#65E83A] font-mono tabular-nums">
                        PRIVATE LIMITED · CIN: U64990TN2025PTC181717
                      </p>
                    </div>
                  </div>

                  {/* Verified Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs mb-3.5">
                    <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-2">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#D1FAE5]">
                        {lang === 'ta' ? 'மாத தவணை' : 'Auction / Draw'}
                      </span>
                      <span className="font-bold text-[#65E83A]">
                        {lang === 'ta' ? 'மாதம் 11-ஆம் தேதி' : '11th Monthly'}
                      </span>
                    </div>
                    <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-2">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#D1FAE5]">
                        {lang === 'ta' ? 'தொகை வழங்கல்' : 'Disbursement'}
                      </span>
                      <span className="font-bold text-white">
                        {lang === 'ta' ? 'மாதம் 25-க்குள்' : 'By 25th'}
                      </span>
                    </div>
                    <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-2">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#D1FAE5]">
                        {lang === 'ta' ? 'அலுவலகம்' : 'Location'}
                      </span>
                      <span className="font-bold text-white truncate block">
                        {lang === 'ta' ? 'விள்ளுக்குறி, கன்னியாகுமரி' : 'Villukuri, KK Dist.'}
                      </span>
                    </div>
                  </div>

                  <div className="w-full rounded-xl p-2.5 bg-[#052E22]/90 border border-[#65E83A]/35 text-center">
                    <p className="text-[11px] text-[#65E83A] font-semibold">
                      {lang === 'ta'
                        ? '10-ஆம் தேதிக்குள் தவணை செலுத்தும் உறுப்பினர்களுக்கு சிறப்பு போனஸ் உண்டு!'
                        : 'Special Bonus rewarded to members paying instalments on or before the 10th!'}
                    </p>
                  </div>
                </div>
              </FintechCard3D>
            </div>
          </MotionSection>
        </div>

        {/* Architectural Full-Width Counter Wrap Strip */}
        <MotionSection delay={0.18} className="mt-10 sm:mt-14 rounded-2xl fintech-card-forest text-[#ECFDF5] p-5 sm:p-7 pubzi-chamfer">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 divide-y sm:divide-y-0 lg:divide-x divide-white/15 text-center">
            <div className="pt-2 sm:pt-0 lg:px-4">
              <div className="text-2xl sm:text-4xl font-black text-[#65E83A] font-mono tabular-nums tracking-tight">
                {t.hero.trustStat1Value}
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-[#D1FAE5] mt-1.5 uppercase tracking-widest">
                {t.hero.trustStat1Label}
              </div>
            </div>

            <div className="pt-2 sm:pt-0 lg:px-4">
              <div
                className={`font-black text-white tabular-nums tracking-tight ${
                  lang === 'ta' ? 'text-lg sm:text-2xl leading-snug' : 'text-2xl sm:text-4xl font-mono'
                }`}
              >
                {t.hero.trustStat2Value}
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-[#D1FAE5] mt-1.5 uppercase tracking-widest">
                {t.hero.trustStat2Label}
              </div>
            </div>

            <div className="pt-4 sm:pt-0 lg:px-4">
              <div className="text-2xl sm:text-4xl font-black text-[#65E83A] font-mono tabular-nums tracking-tight">
                {t.hero.trustStat3Value}
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-[#D1FAE5] mt-1.5 uppercase tracking-widest">
                {t.hero.trustStat3Label}
              </div>
            </div>

            <div className="pt-4 sm:pt-0 lg:px-4">
              <div className="text-2xl sm:text-4xl font-black text-white font-mono tabular-nums tracking-tight">
                {t.hero.trustStat4Value}
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-[#D1FAE5] mt-1.5 uppercase tracking-widest">
                {t.hero.trustStat4Label}
              </div>
            </div>
          </div>
        </MotionSection>
      </div>
    </section>
  );
};
