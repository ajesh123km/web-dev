import React, { useState, useEffect } from 'react';
import { CustomerEnquiry, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Send, CheckCircle2, AlertCircle, ShieldCheck, UserCheck, Loader2 } from 'lucide-react';

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

  // Sync preSelectedScheme if changed externally
  useEffect(() => {
    if (preSelectedScheme) {
      setFormData((prev) => ({ ...prev, preferred_scheme: preSelectedScheme }));
    }
  }, [preSelectedScheme]);

  // Keep preferred language in sync with current language by default
  useEffect(() => {
    setFormData((prev) => ({ ...prev, preferred_language: lang }));
  }, [lang]);

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!formData.full_name || formData.full_name.trim().length < 2) {
      errs.full_name = lang === 'ta' 
        ? 'உங்கள் முழு பெயரை உள்ளிடவும் (குறைந்தது 2 எழுத்துக்கள்).' 
        : 'Please enter your full name (minimum 2 characters).';
    }

    const cleanMobile = formData.mobile_number.replace(/[\s\-+]/g, '');
    const mobileRegex = /^[6-9]\d{9}$/;
    const stripped = cleanMobile.length === 12 && cleanMobile.startsWith('91') ? cleanMobile.slice(2) : cleanMobile;
    if (!mobileRegex.test(stripped)) {
      errs.mobile_number = lang === 'ta'
        ? 'சரியான 10 இலக்க இந்திய கைபேசி எண்ணை உள்ளிடவும் (6, 7, 8, அல்லது 9-ல் தொடங்க வேண்டும்).'
        : 'Please enter a valid 10-digit Indian mobile number.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      errs.email = lang === 'ta'
        ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.'
        : 'Please enter a valid email address.';
    }

    if (!formData.city || formData.city.trim().length < 2) {
      errs.city = lang === 'ta'
        ? 'உங்கள் ஊர் அல்லது மாவட்டத்தை குறிப்பிடவும்.'
        : 'Please enter your city or district.';
    }

    if (!formData.preferred_scheme) {
      errs.preferred_scheme = lang === 'ta'
        ? 'விருப்பமான சீட்டு திட்டத்தை தேர்வு செய்யவும்.'
        : 'Please select a preferred scheme.';
    }

    if (!formData.consent) {
      errs.consent = lang === 'ta'
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
      setServerError(err.message || 'Network error occurred. Please check your connection or call +91 9789825684.');
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

  return (
    <section id="enquiry-form" className="py-16 lg:py-24 bg-[#F8FAF9] border-b border-slate-200/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Form Container Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-10 relative overflow-hidden">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E5F2E8] text-[#075C32] text-xs font-bold uppercase tracking-wider mb-2">
              <UserCheck className="w-3.5 h-3.5 text-[#12834B]" />
              <span>{lang === 'ta' ? 'விண்ணப்ப மையம்' : 'Initial Enquiry'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t.form.title}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              {t.form.subtitle}
            </p>
          </div>

          {/* Submission Success Confirmation State */}
          {submittedRef ? (
            <div className="text-center py-8 px-4 space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-[#E5F2E8] text-[#075C32] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-[#12834B]" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {t.form.successTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
                  {t.form.successMessage}
                </p>
              </div>

              <div className="inline-block p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono">
                <span className="text-slate-400 block text-[11px] font-sans font-semibold mb-1">
                  {t.form.enquiryRef}
                </span>
                <span className="font-bold text-base text-[#075C32]">{submittedRef}</span>
              </div>

              <div className="pt-4">
                <button
                  onClick={resetForm}
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#075C32] hover:bg-[#12834B] rounded-lg transition-all"
                >
                  {lang === 'ta' ? 'மற்றொரு விண்ணப்பம் சமர்ப்பிக்க' : 'Submit Another Enquiry'}
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Enquiry Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {serverError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Full Name & Mobile Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#075C32]/20 ${
                      errors.full_name ? 'border-red-400 bg-red-50/20' : 'border-slate-300 hover:border-slate-400 focus:border-[#075C32]'
                    }`}
                  />
                  {errors.full_name && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t.form.mobile}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.mobile_number}
                      onChange={(e) => {
                        setFormData({ ...formData, mobile_number: e.target.value });
                        if (errors.mobile_number) setErrors({ ...errors, mobile_number: '' });
                      }}
                      placeholder={t.form.mobilePlaceholder}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 font-mono transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#075C32]/20 ${
                        errors.mobile_number ? 'border-red-400 bg-red-50/20' : 'border-slate-300 hover:border-slate-400 focus:border-[#075C32]'
                      }`}
                    />
                  </div>
                  {errors.mobile_number && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.mobile_number}</p>
                  )}
                </div>
              </div>

              {/* Email & City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#075C32]/20 ${
                      errors.email ? 'border-red-400 bg-red-50/20' : 'border-slate-300 hover:border-slate-400 focus:border-[#075C32]'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#075C32]/20 ${
                      errors.city ? 'border-red-400 bg-red-50/20' : 'border-slate-300 hover:border-slate-400 focus:border-[#075C32]'
                    }`}
                  />
                  {errors.city && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.city}</p>
                  )}
                </div>
              </div>

              {/* Preferred Scheme & Preferred Language Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t.form.scheme}
                  </label>
                  <select
                    value={formData.preferred_scheme}
                    onChange={(e) => {
                      setFormData({ ...formData, preferred_scheme: e.target.value });
                      if (errors.preferred_scheme) setErrors({ ...errors, preferred_scheme: '' });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#075C32]/20 focus:border-[#075C32]"
                  >
                    <option value="₹1,00,000 Scheme">{t.form.schemeOption1}</option>
                    <option value="₹2,00,000 Scheme">{t.form.schemeOption2}</option>
                    <option value="₹5,00,000 Scheme">{t.form.schemeOption3}</option>
                    <option value="Undecided">{t.form.schemeOptionUndecided}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t.form.preferredLanguage}
                  </label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="preferred_language"
                        checked={formData.preferred_language === 'ta'}
                        onChange={() => setFormData({ ...formData, preferred_language: 'ta' })}
                        className="accent-[#075C32]"
                      />
                      <span>{t.form.langTamil}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="preferred_language"
                        checked={formData.preferred_language === 'en'}
                        onChange={() => setFormData({ ...formData, preferred_language: 'en' })}
                        className="accent-[#075C32]"
                      />
                      <span>{t.form.langEnglish}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.form.message}
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t.form.messagePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#075C32]/20 focus:border-[#075C32]"
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
                    className="mt-1 w-4 h-4 rounded-sm border-slate-300 accent-[#075C32]"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed font-normal">
                    {t.form.consent}
                  </span>
                </label>
                {errors.consent && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.consent}</p>
                )}
              </div>

              {/* Security Micro Badge */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-[#12834B] shrink-0" />
                <span>{t.form.privacyNotice}</span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-lg font-bold text-sm text-white bg-[#075C32] hover:bg-[#12834B] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 active:scale-98"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.form.submitting}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
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
