import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Target, Compass, Building2, MapPin, Mail, Phone, ArrowUpRight, Calculator } from 'lucide-react';
import { FintechCard3D } from './3d/FintechCard3D';
import { MotionSection } from './3d/MotionSection';

interface AboutSectionProps {
  lang: Language;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <section id="about" className="py-12 sm:py-16 lg:py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Section Heading */}
        <MotionSection className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 bg-[#064E3B] border border-emerald-400/30 text-[#65E83A] px-3.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-widest mb-3">
            <Building2 className="w-3.5 h-3.5 text-[#65E83A]" />
            <span>{lang === 'ta' ? 'நிறுவன பின்னணி' : 'Corporate Profile'}</span>
          </div>
          <h2 className="heading-3d-pop text-2xl sm:text-4xl font-extrabold text-[#052E22] tracking-tight leading-tight [text-wrap:balance]">
            {t.about.title}
          </h2>
          <p className="mt-3 text-sm sm:text-lg text-[#0B3B2C] font-medium leading-relaxed">
            {t.about.subtitle}
          </p>
        </MotionSection>

        {/* Narrative & Deep Emerald Registered Letterhead Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch mb-12 sm:mb-16">

          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="reveal max-w-none text-[#0B3B2C] font-medium leading-relaxed space-y-4 text-base">
              <p className="text-lg font-semibold text-[#052E22]">
                {t.about.introParagraph1}
              </p>
              <p>
                {t.about.introParagraph2}
              </p>
              <p>
                {lang === 'ta'
                  ? 'எங்கள் நிறுவனத்தில் பங்குபெறும் ஒவ்வொரு உறுப்பினரின் முதலீடும் பாதுகாப்பான ஆவணங்கள் மற்றும் 2 உத்தரவாத கையொப்பங்கள் மூலம் முழுமையாக உறுதி செய்யப்படுகிறது. தவணைகள் மற்றும் குலுக்கல் நடைமுறைகள் யாவும் வெளிப்படையாக முன்கூட்டியே அறிவிக்கப்பட்டு முறைப்படுத்தப்படுகின்றன.'
                  : 'Every participant’s capital is protected through verified documentation, dual guarantors, and systematic banking channels. All auction procedures and bonus structures are strictly adhered to as published in our official rate cards.'}
              </p>
            </div>

            {/* Mission & Vision Bento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="reveal reveal-delay-100 flex">
                <FintechCard3D accent="mint" className="w-full p-5 rounded-xl fintech-card-mint">
                  <div className="flex items-center gap-2 mb-2 text-[#052E22]">
                    <Target className="w-5 h-5 text-[#064E3B]" />
                    <h3 className="side-heading-3d-pop font-bold text-base text-[#052E22]">{t.about.missionTitle}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#0B3B2C] leading-relaxed font-medium">
                    {t.about.missionText}
                  </p>
                </FintechCard3D>
              </div>

              <div className="reveal reveal-delay-200 flex">
                <FintechCard3D accent="ash" className="w-full p-5 rounded-xl fintech-card-ash">
                  <div className="flex items-center gap-2 mb-2 text-[#052E22]">
                    <Compass className="w-5 h-5 text-[#064E3B]" />
                    <h3 className="side-heading-3d-pop font-bold text-base text-[#052E22]">{t.about.visionTitle}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#0B3B2C] leading-relaxed font-medium">
                    {t.about.visionText}
                  </p>
                </FintechCard3D>
              </div>
            </div>
          </div>

          {/* Official Letterhead Card in Deep Emerald */}
          <MotionSection delay={0.1} className="lg:col-span-5 flex">
            <FintechCard3D accent="forest" className="w-full flex flex-col justify-between p-5 sm:p-8 rounded-2xl fintech-card-forest text-[#ECFDF5] relative overflow-hidden isolate">
              <div>
                <div className="border-b border-white/15 pb-4 mb-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="font-mono font-bold text-[#65E83A] uppercase tabular-nums">
                      CIN: U64990TN2025PTC181717
                    </span>
                    <span className="font-semibold text-[#65E83A]">
                      Active Entity
                    </span>
                  </div>
                  <h3 className="side-heading-3d-pop-dark text-base sm:text-lg font-extrabold text-white mt-2 tracking-tight">
                    TEAM STARS CHITS PRIVATE LIMITED
                  </h3>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-[#ECFDF5]">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#65E83A] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-white mb-0.5">
                        {t.about.registeredOfficeLabel}
                      </span>
                      <p className="text-[#D1FAE5] leading-relaxed">
                        41/5E, Madathattuvillai, Villukuri, Kalkulam, Kanyakumari District – 629180, Tamil Nadu, India.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-[#65E83A] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-white mb-0.5">Public Phone</span>
                      <a href="tel:9789825684" className="text-[#65E83A] font-bold hover:underline tabular-nums">
                        +91 9789825684
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-[#65E83A] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-white mb-0.5">Official Inquiries</span>
                      <a href="mailto:teamstarschitsprivatelimited@gmail.com" className="text-[#D1FAE5] hover:text-white break-all">
                        teamstarschitsprivatelimited@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-[#A7F3D0]">
                <span>Incorporated: 2025</span>
                <span className="text-[#65E83A] font-semibold">Kalkulam Jurisdiction</span>
              </div>
            </FintechCard3D>
          </MotionSection>

        </div>

        {/* "Trust Through Transparency" Showcase Banner */}
        <MotionSection delay={0.06} className="mb-12 sm:mb-16">
          <div className="rounded-2xl border border-white/30 bg-white/35 backdrop-blur-md overflow-hidden isolate bg-clip-padding shadow-xl grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-6 relative border-b lg:border-b-0 lg:border-r border-white/25 bg-emerald-500/10 overflow-hidden h-[240px] sm:h-[310px] lg:h-auto lg:min-h-[330px]">
              <img
                src="/assets/aistudio/image_f747490f.png"
                alt="Grow Your Wealth Safely with Team Stars Chit Funds"
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div className="lg:col-span-6 p-6 sm:p-10 bg-white/25 backdrop-blur-md flex flex-col justify-center">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#064E3B] mb-2">
                {lang === 'ta' ? 'முழுமையான வெளிப்படைத்தன்மை' : 'Audited Integrity'}
              </span>
              <h3 className="heading-3d-pop text-2xl sm:text-3xl font-extrabold text-[#052E22] tracking-tight leading-tight mb-3 [text-wrap:balance]">
                {lang === 'ta'
                  ? 'வெளிப்படைத்தன்மையால் வளரும் நம்பிக்கை'
                  : 'Trust Through Transparency'}
              </h3>
              <p className="text-xs sm:text-sm text-[#0B3B2C] font-medium leading-relaxed mb-6 max-w-lg">
                {lang === 'ta'
                  ? 'ஒவ்வொரு சீட்டுத் தொகையும் சரிபார்க்கப்பட்ட உறுப்பினர் ஆவணங்கள், 2 உத்தரவாத கையொப்பங்கள் மற்றும் மாதம் 11-ஆம் தேதி நடைபெறும் வெளிப்படையான குலுக்கல் மூலம் முழுமையாக பாதுகாக்கப்படுகிறது.'
                  : 'Every group pool is backed by verified KYC documentation, dual guarantor covenants, scheduled monthly draws on the 11th, and traceable banking disbursements by the 25th.'}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('schemes')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 text-xs font-extrabold text-white bg-[#064E3B] hover:bg-[#0B5D46] rounded-xl shadow-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{lang === 'ta' ? 'திட்டங்களைப் பார்க்க' : 'Explore Plans'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#65E83A]" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-[#052E22] bg-white hover:bg-[#DCFCE7] border border-[#064E3B]/20 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5 text-[#064E3B]" />
                  <span>{lang === 'ta' ? 'கணக்கீட்டு கருவி' : 'Open Calculator'}</span>
                </button>
              </div>
            </div>
          </div>
        </MotionSection>

        {/* 4 Core Business Values Grid */}
        <div>
          <div className="reveal text-center mb-8">
            <h3 className="side-heading-3d-pop text-xl sm:text-2xl font-extrabold text-[#052E22] tracking-tight">
              {t.about.valuesTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="reveal flex">
              <FintechCard3D accent="emerald" className="w-full p-6 rounded-2xl fintech-card hover:border-white/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#064E3B] text-[#65E83A] flex items-center justify-center font-extrabold font-mono mb-4 shadow-sm">
                  01
                </div>
                <h4 className="side-heading-3d-pop font-bold text-base text-[#052E22] mb-2">{t.about.value1Title}</h4>
                <p className="text-xs sm:text-sm text-[#0B3B2C] leading-relaxed font-medium">{t.about.value1Text}</p>
              </FintechCard3D>
            </div>

            <div className="reveal reveal-delay-100 flex">
              <FintechCard3D accent="ash" className="w-full p-6 rounded-2xl fintech-card-ash hover:border-white/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#064E3B]/20 flex items-center justify-center text-[#064E3B] font-extrabold font-mono mb-4 shadow-sm">
                  02
                </div>
                <h4 className="side-heading-3d-pop font-bold text-base text-[#052E22] mb-2">{t.about.value2Title}</h4>
                <p className="text-xs sm:text-sm text-[#0B3B2C] leading-relaxed font-medium">{t.about.value2Text}</p>
              </FintechCard3D>
            </div>

            <div className="reveal reveal-delay-200 flex">
              <FintechCard3D accent="emerald" className="w-full p-6 rounded-2xl fintech-card hover:border-white/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#064E3B] text-[#65E83A] flex items-center justify-center font-extrabold font-mono mb-4 shadow-sm">
                  03
                </div>
                <h4 className="side-heading-3d-pop font-bold text-base text-[#052E22] mb-2">{t.about.value3Title}</h4>
                <p className="text-xs sm:text-sm text-[#0B3B2C] leading-relaxed font-medium">{t.about.value3Text}</p>
              </FintechCard3D>
            </div>

            <div className="reveal reveal-delay-300 flex">
              <FintechCard3D accent="mint" className="w-full p-6 rounded-2xl fintech-card-mint hover:border-white/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#064E3B] flex items-center justify-center text-[#65E83A] font-extrabold font-mono mb-4 shadow-sm">
                  04
                </div>
                <h4 className="side-heading-3d-pop font-bold text-base text-[#052E22] mb-2">{t.about.value4Title}</h4>
                <p className="text-xs sm:text-sm text-[#0B3B2C] leading-relaxed font-medium">{t.about.value4Text}</p>
              </FintechCard3D>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
