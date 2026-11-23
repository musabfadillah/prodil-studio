import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const AuthModal: React.FC = () => {
  const { t } = useLanguage();
  const {
    authModalOpen,
    authModalView,
    unverifiedEmail,
    devPreviewCode,
    closeAuthModal,
    openAuthModal,
    login,
    register,
    verifyEmail,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const res = await register(email, password, fullName);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const res = await verifyEmail(verifyCode);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="no-print modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <img src="/assets/prodil-logo.jpg" alt={t('logoAlt')} className="h-6 w-auto rounded" />
            <span className="font-extrabold text-sm text-slate-900">
              {authModalView === 'login' && t('loginTitle')}
              {authModalView === 'register' && t('registerTitle')}
              {authModalView === 'verify' && t('verifyTitle')}
            </span>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* VIEW 1: LOGIN */}
          {authModalView === 'login' && (
            <div>
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('email')}</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('emailPlaceholderLogin')}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('password')}</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? t('processingAuth') : t('loginNow')} <ArrowRight size={14} />
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-slate-500">
                {t('noAccount')}{' '}
                <button
                  onClick={() => openAuthModal('register')}
                  className="font-bold text-blue-600 hover:underline"
                >
                  {t('registerNow')}
                </button>
              </p>
            </div>
          )}

          {/* VIEW 2: REGISTER */}
          {authModalView === 'register' && (
            <div>
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('fullNameLabel')}</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t('fullNamePlaceholder')}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('email')}</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('emailPlaceholderRegister')}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('password')}</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('passwordHint')}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? t('processingAuth') : t('registerNow')} <ArrowRight size={14} />
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-slate-500">
                {t('alreadyHaveAccount')}{' '}
                <button
                  onClick={() => openAuthModal('login')}
                  className="font-bold text-blue-600 hover:underline"
                >
                  {t('signIn')}
                </button>
              </p>
            </div>
          )}

          {/* VIEW 3: 6-DIGIT EMAIL VERIFICATION */}
          {authModalView === 'verify' && (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-base text-slate-900">{t('verifyTitle')}</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                {t('verifyCode')}: <strong>{unverifiedEmail}</strong>
              </p>

              {/* Dev preview code banner for easy testing */}
              {devPreviewCode && (
                <div className="my-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                  <span>💡 {t('testModeCode')}: <strong>{devPreviewCode}</strong></span>
                  <button
                    type="button"
                    onClick={() => setVerifyCode(devPreviewCode)}
                    className="ml-2 text-blue-600 font-bold underline text-[11px]"
                  >
                    {t('copyAutomatically')}
                  </button>
                </div>
              )}

              <form onSubmit={handleVerifySubmit} className="mt-5 space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-48 mx-auto text-center tracking-[8px] font-mono text-2xl py-2 px-3 border-2 border-blue-500 rounded-xl focus:ring-4 focus:ring-blue-100 focus:outline-none text-slate-900 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || verifyCode.length < 6}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? t('processingAuth') : t('verifyEmail')}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
                <span>{t('notReceiveCode')}</span>
                <button
                  type="button"
                  onClick={() => alert(t('codeSentAlert').replace('{code}', devPreviewCode || '123456'))}
                  className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={12} /> {t('resendCode')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
