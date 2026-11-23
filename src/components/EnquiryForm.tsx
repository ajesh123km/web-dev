import React, { useState, useEffect } from 'react';
import { ChitScheme, CustomerEnquiry, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { CHIT_SCHEMES } from '../data/schemes';
import { Send, CheckCircle2, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';

interface EnquiryFormProps {
  lang: Language;
  preSelectedScheme?: string;
  onSuccess?: () => void;
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({
  lang,
  preSelectedScheme = '',
  onSuccess
}) => {
  const t = TRANSLATIONS[lang];
  const [schemes, setSchemes] = useState<ChitScheme[]>(CHIT_SCHEMES);

  const [formData, setFormData] = useState<CustomerEnquiry>({
    full_name: '',
    mobile_number: '',
    email: '',
    city: '',
    preferred_scheme: preSelectedScheme || '₹2,00,000 Scheme',
    preferred_language: lang,
    message: '',
    consent: true
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadSchemes = () => {
      fetch('/api/schemes')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (active && data?.schemes && Array.isArray(data.schemes) && data.schemes.length > 0) {
            setSchemes(data.schemes);
          }
        })
        .catch(() => {
          // Fallback to static CHIT_SCHEMES
        });
    };
    loadSchemes();
    window.addEventListener('teamstars:schemes-updated', loadSchemes);
    return () => {
      active = false;
      window.removeEventListener('teamstars:schemes-updated', loadSchemes);
    };
  }, []);

  useEffect(() => {
    if (preSelectedScheme) {
      setFormData((prev) => ({ ...prev, preferred_scheme: preSelectedScheme }));
    }
  }, [preSelectedScheme]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, preferred_language: lang }));
  }, [lang]);

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!formData.full_name || formData.full_name.trim().length < 2) {
      errs.full_name =
        lang === 'ta'
          ? 'உங்கள் முழு பெயரை உள்ளிடவும் (குறைந்தது 2 எழுத்துக்கள்).'
          : 'Please enter your full name (minimum 2 characters).';
    }

    const cleanMobile = formData.mobile_number.replace(/[\s\-+]/g, '');
    const mobileRegex = /^[6-9]\d{9}$/;
    const stripped =
      cleanMobile.length === 12 && cleanMobile.startsWith('91') ? cleanMobile.slice(2) : cleanMobile;
    if (!mobileRegex.test(stripped)) {
      errs.mobile_number =
        lang === 'ta'
          ? 'சரியான 10 இலக்க இந்திய கைபேசி எண்ணை உள்ளிடவும் (6, 7, 8, அல்லது 9-ல் தொடங்க வேண்டும்).'
          : 'Please enter a valid 10-digit Indian mobile number.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      errs.email =
        lang === 'ta'
          ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.'
          : 'Please enter a valid email address.';
    }

    if (!formData.city || formData.city.trim().length < 2) {
      errs.city =
        lang === 'ta'
          ? 'உங்கள் ஊர் அல்லது மாவட்டத்தை குறிப்பிடவும்.'
          : 'Please enter your city or district.';
    }

    if (!formData.preferred_scheme) {
      errs.preferred_scheme =
        lang === 'ta'
          ? 'விருப்பமான சீட்டு திட்டத்தை தேர்வு செய்யவும்.'
          : 'Please select a preferred scheme.';
    }

    if (!formData.consent) {
      errs.consent =
        lang === 'ta'
          ? 'தனியுரிமை கொள்கை ஒப்புதல் அளிக்க வேண்டும்.'
          : 'You must consent to be contacted regarding this enquiry.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit enquiry. Please try again.');
      }

      setSubmittedRef(data.enquiryId || 'TS-' + Math.floor(100000 + Math.random() * 900000));
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Enquiry submission error:', err);
      setServerError(
        err.message ||
          'Network error occurred. Please check your connection or call +91 9789825684.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedRef(null);
    setFormData({
      full_name: '',
      mobile_number: '',
      email: '',
      city: '',
      preferred_scheme: '₹2,00,000 Scheme',
      preferred_language: lang,
      message: '',
      consent: true
    });
    setErrors({});
  };

  const getSchemeOptionLabel = (scheme: ChitScheme) => {
    if (scheme.id === 'scheme-1-lakh') return t.form.schemeOption1;
    if (scheme.id === 'scheme-2-lakh') return t.form.schemeOption2;
    if (scheme.id === 'scheme-5-lakh') return t.form.schemeOption3;
    if (scheme.id === 'scheme-10-lakh') return t.form.schemeOption4;
    return lang === 'ta'
      ? `${scheme.chitValueFormattedTa} (${scheme.durationMonths} மாதங்கள்)`
      : `${scheme.chitValueFormatted} Scheme (${scheme.durationMonths} Months)`;
  };

  const schemeOptions = schemes.map((s) => ({
    value: `${s.chitValueFormatted} Scheme`,
    label: getSchemeOptionLabel(s)
  }));

  const hasCustomPreSelected =
    formData.preferred_scheme &&
    formData.preferred_scheme !== 'Undecided' &&
    !schemeOptions.some((o) => o.value === formData.preferred_scheme);

  return (
    <section id="enquiry-form" className="py-12 sm:py-16 lg:py-24 bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Deep Emerald Forest CTA Contact Banner */}
        <div className="reveal mb-8 sm:mb-10 rounded-2xl fintech-card-forest text-white p-6 sm:p-8 pubzi-chamfer flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="mb-2.5">
              <span className="inline-block bg-[#65E83A] text-[#052E22] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest pubzi-chamfer-sm">
                {lang === 'ta' ? 'தொடங்குவோம்' : 'Start Your Plan'}
              </span>
            </div>
            <h2 className="heading-3d-pop-dark text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {lang === 'ta' ? 'உங்கள் சீட்டு சேமிப்பை இன்று தொடங்குங்கள்' : 'Let’s Secure Your Savings Plan Today'}
            </h2>
            <p className="text-xs sm:text-sm text-[#D1FAE5] mt-1.5 max-w-md">
              {lang === 'ta'
                ? 'டீம் ஸ்டார்ஸ் சீட்டுத் திட்டங்களில் சேர விரும்புகிறீர்களா? கீழே உள்ள படிவத்தை நிரப்பவும்.'
                : 'Ready to join an upcoming 20-month group? Submit your details below or call us directly.'}
            </p>
          </div>

          <a
            href="tel:9789825684"
            className="w-full md:w-auto px-6 py-4 bg-[#052E22] hover:bg-[#65E83A] text-white hover:text-[#052E22] border border-[#65E83A]/50 pubzi-chamfer-sm transition-all flex flex-col items-center md:items-end shrink-0 group cursor-pointer"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#65E83A] group-hover:text-[#052E22]">
              {lang === 'ta' ? 'நேரடி அழைப்பு' : 'Call Us Directly'}
            </span>
            <span className="text-lg font-black font-mono tabular-nums mt-0.5">
              +91 9789825684
            </span>
          </a>
        </div>

        {/* Elevated Crisp White Form Card */}
        <div className="reveal reveal-delay-100 fintech-card rounded-2xl p-4 sm:p-10 relative overflow-hidden pubzi-chamfer max-w-3xl mx-auto">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#064E3B] via-[#65E83A] to-[#064E3B]" />

          <div className="text-center mb-6 sm:mb-8 flex flex-col items-center">
            <h2 className="heading-3d-pop text-xl sm:text-3xl font-extrabold text-[#052E22] tracking-tight leading-tight">
              {t.form.title}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#0B3B2C] font-medium leading-relaxed max-w-xl mx-auto">
              {t.form.subtitle}
            </p>
          </div>

          {/* Submission Success Confirmation State */}
          {submittedRef ? (
            <div className="text-center py-8 px-4 space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-[#65E83A] border border-[#064E3B]/25 text-[#052E22] flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10 text-[#052E22]" />
              </div>

              <div>
                <h3 className="side-heading-3d-pop text-xl sm:text-2xl font-bold text-[#052E22]">
                  {t.form.successTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#0B3B2C] font-medium max-w-lg mx-auto mt-2 leading-relaxed">
                  {t.form.successMessage}
                </p>
              </div>

              <div className="inline-block p-4 rounded-xl bg-emerald-500/15 backdrop-blur-sm border border-white/30 text-xs text-[#052E22] font-mono tabular-nums shadow-sm">
                <span className="text-[#0B3B2C] block text-[11px] font-sans font-semibold mb-1">
                  {t.form.enquiryRef}
                </span>
                <span className="font-bold text-base text-[#052E22]">{submittedRef}</span>
              </div>

              <div className="pt-4">
                <button
                  onClick={resetForm}
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#064E3B] hover:bg-[#052E22] rounded-xl transition-all cursor-pointer"
                >
                  {lang === 'ta' ? 'மற்றொரு விண்ணப்பம் சமர்ப்பிக்க' : 'Submit Another Enquiry'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {serverError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Full Name & Mobile Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#052E22] mb-1.5">
                    {t.form.fullName}
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => {
                      setFormData({ ...formData, full_name: e.target.value });
                      if (errors.full_name) setErrors({ ...errors, full_name: '' });
                    }}
                    placeholder={t.form.fullNamePlaceholder}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white/75 backdrop-blur-sm text-[#052E22] placeholder:text-[#5C8274] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#65E83A]/50 ${
                      errors.full_name
                        ? 'border-rose-600 bg-rose-50/70'
                        : 'border-[#064E3B]/20 hover:border-[#064E3B]/40 focus:border-[#064E3B]'
                    }`}
                  />
                  {errors.full_name && (
                    <p className="text-[11px] text-rose-700 mt-1 font-medium">{errors.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#052E22] mb-1.5">
                    {t.form.mobile}
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile_number}
                    onChange={(e) => {
                      setFormData({ ...formData, mobile_number: e.target.value });
                      if (errors.mobile_number) setErrors({ ...errors, mobile_number: '' });
                    }}
                    placeholder={t.form.mobilePlaceholder}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white/75 backdrop-blur-sm text-[#052E22] placeholder:text-[#5C8274] font-mono transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#65E83A]/50 ${
                      errors.mobile_number
                        ? 'border-rose-600 bg-rose-50/70'
                        : 'border-[#064E3B]/20 hover:border-[#064E3B]/40 focus:border-[#064E3B]'
                    }`}
                  />
                  {errors.mobile_number && (
                    <p className="text-[11px] text-rose-700 mt-1 font-medium">{errors.mobile_number}</p>
                  )}
                </div>
              </div>

              {/* Email & City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#052E22] mb-1.5">
                    {t.form.email}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    placeholder={t.form.emailPlaceholder}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white/75 backdrop-blur-sm text-[#052E22] placeholder:text-[#5C8274] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#65E83A]/50 ${
                      errors.email
                        ? 'border-rose-600 bg-rose-50/70'
                        : 'border-[#064E3B]/20 hover:border-[#064E3B]/40 focus:border-[#064E3B]'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-rose-700 mt-1 font-medium">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#052E22] mb-1.5">
                    {t.form.city}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (errors.city) setErrors({ ...errors, city: '' });
                    }}
                    placeholder={t.form.cityPlaceholder}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white/75 backdrop-blur-sm text-[#052E22] placeholder:text-[#5C8274] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#65E83A]/50 ${
                      errors.city
                        ? 'border-rose-600 bg-rose-50/70'
                        : 'border-[#064E3B]/20 hover:border-[#064E3B]/40 focus:border-[#064E3B]'
                    }`}
                  />
                  {errors.city && (
                    <p className="text-[11px] text-rose-700 mt-1 font-medium">{errors.city}</p>
                  )}
                </div>
              </div>

              {/* Preferred Scheme & Preferred Language Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#052E22] mb-1.5">
                    {t.form.scheme}
                  </label>
                  <select
                    value={formData.preferred_scheme}
                    onChange={(e) => {
                      setFormData({ ...formData, preferred_scheme: e.target.value });
                      if (errors.preferred_scheme) setErrors({ ...errors, preferred_scheme: '' });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#064E3B]/20 text-sm text-[#052E22] bg-white/75 backdrop-blur-sm focus:outline-hidden focus:ring-2 focus:ring-[#65E83A]/50 focus:border-[#064E3B]"
                  >
                    {schemeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-white text-[#052E22]">
                        {opt.label}
                      </option>
                    ))}
                    {hasCustomPreSelected && (
                      <option value={formData.preferred_scheme} className="bg-white text-[#052E22]">
                        {formData.preferred_scheme}
                      </option>
                    )}
                    <option value="Undecided" className="bg-white text-[#052E22]">
                      {t.form.schemeOptionUndecided}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#052E22] mb-1.5">
                    {t.form.preferredLanguage}
                  </label>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#052E22]">
                      <input
                        type="radio"
                        name="preferred_language"
                        checked={formData.preferred_language === 'ta'}
                        onChange={() => setFormData({ ...formData, preferred_language: 'ta' })}
                        className="accent-[#064E3B]"
                      />
                      <span>{t.form.langTamil}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#052E22]">
                      <input
                        type="radio"
                        name="preferred_language"
                        checked={formData.preferred_language === 'en'}
                        onChange={() => setFormData({ ...formData, preferred_language: 'en' })}
                        className="accent-[#064E3B]"
                      />
                      <span>{t.form.langEnglish}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Message */}
              <div>
                <label className="block text-xs font-bold text-[#052E22] mb-1.5">
                  {t.form.message}
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t.form.messagePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#064E3B]/20 bg-white/75 backdrop-blur-sm text-sm text-[#052E22] placeholder:text-[#5C8274] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#65E83A]/50 focus:border-[#064E3B]"
                />
              </div>

              {/* Consent Checkbox */}
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) => {
                      setFormData({ ...formData, consent: e.target.checked });
                      if (errors.consent) setErrors({ ...errors, consent: '' });
                    }}
                    className="mt-1 w-4 h-4 rounded-sm border-[#064E3B]/30 accent-[#064E3B]"
                  />
                  <span className="text-xs text-[#0B3B2C] leading-relaxed font-medium">
                    {t.form.consent}
                  </span>
                </label>
                {errors.consent && (
                  <p className="text-[11px] text-rose-700 mt-1 font-medium">{errors.consent}</p>
                )}
              </div>

              {/* Security Micro Badge */}
              <div className="flex items-center gap-2 p-3 bg-emerald-500/15 backdrop-blur-sm border border-white/30 rounded-xl text-[11px] text-[#0B3B2C] font-medium">
                <ShieldCheck className="w-4 h-4 text-[#064E3B] shrink-0" />
                <span>{t.form.privacyNotice}</span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl font-extrabold text-sm text-white bg-[#064E3B] hover:bg-[#052E22] transition-all shadow-[0_12px_28px_-8px_rgba(6,78,59,0.35)] flex items-center justify-center gap-2 disabled:opacity-70 active:scale-98 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#65E83A]" />
                    <span>{t.form.submitting}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#65E83A]" />
                    <span>{t.form.submitButton}</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
