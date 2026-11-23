import React, { useState } from 'react';
import { MasterProfile, CoverLetterData } from '../types/cv';
import { CoverLetterTemplate } from '../templates/CoverLetterTemplate';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Printer, Download, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CoverLetterEditorProps {
  profile: MasterProfile;
  letterData: CoverLetterData;
  setLetterData: React.Dispatch<React.SetStateAction<CoverLetterData>>;
  onTriggerPrint: () => void;
  mobilePane: 'edit' | 'preview';
}

export const CoverLetterEditor: React.FC<CoverLetterEditorProps> = ({
  profile,
  letterData,
  setLetterData,
  onTriggerPrint,
  mobilePane,
}) => {
  const { t } = useLanguage();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [loadingAi, setLoadingAi] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (field: keyof CoverLetterData, val: string) => {
    setLetterData(prev => ({ ...prev, [field]: val }));
  };

  const handleGenerateAiCoverLetter = async () => {
    if (!isAuthenticated) {
      setErrorMsg(t('coverAuthRequired'));
      openAuthModal('login');
      return;
    }

    if (!letterData.companyName || !letterData.jobTitle) {
      setErrorMsg(t('coverRequiredFields'));
      return;
    }

    setLoadingAi(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.generateCoverLetter({
        masterProfile: profile,
        companyName: letterData.companyName,
        jobTitle: letterData.jobTitle,
        recipientName: letterData.recipientName,
        jobDescription,
      });

      if (res.success && res.data) {
        setLetterData(prev => ({
          ...prev,
          letterBody: res.data?.letterBody || prev.letterBody,
          subject: res.data?.subject || prev.subject,
        }));
        setSuccessMsg(t('coverGenerated'));
      } else {
        setErrorMsg(res.message || t('coverGenerateFailed'));
      }
    } catch (err: any) {
      if (err.message === 'AUTH_REQUIRED') {
        openAuthModal('login');
      } else {
        setErrorMsg(err.message || t('systemError'));
      }
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="studio-grid grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      {/* Left Form Settings */}
      <div className={`no-print min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-5 ${mobilePane === 'preview' ? 'hidden lg:block' : ''}`}>
        <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">{t('coverGeneratorTitle')}</h3>
            <p className="text-[11px] text-slate-500">{t('coverSubtitle')}</p>
          </div>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {t('singleSource')}
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* AI Generator Box */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Sparkles size={14} className="text-amber-500" /> {t('coverAiDraft')}
          </div>
          <p className="text-[11px] text-slate-600 leading-normal">
            {t('aiCoverText')}
          </p>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {t('jobDescriptionLabel')}
            </label>
            <textarea
              rows={2}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={t('targetJobPlaceholder')}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerateAiCoverLetter}
            disabled={loadingAi}
            className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loadingAi ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('writingCover')}
              </>
            ) : (
              <>
                <Sparkles size={13} /> {t('writeCover')}
              </>
            )}
          </button>
        </div>

        {/* Manual Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t('companyTarget')}</label>
            <input
              type="text"
              value={letterData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder={t('companyExample')}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t('targetPosition')}</label>
            <input
              type="text"
              value={letterData.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
              placeholder={t('positionExample')}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t('recipientName')}</label>
            <input
              type="text"
              value={letterData.recipientName}
              onChange={(e) => handleChange('recipientName', e.target.value)}
              placeholder={t('recipientExample')}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t('recipientTitle')}</label>
            <input
              type="text"
              value={letterData.recipientTitle}
              onChange={(e) => handleChange('recipientTitle', e.target.value)}
              placeholder={t('recipientTitleExample')}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t('subjectLabel')}</label>
          <input
            type="text"
            value={letterData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t('bodyLabel')}</label>
          <textarea
            rows={10}
            value={letterData.letterBody}
            onChange={(e) => handleChange('letterBody', e.target.value)}
            className="w-full p-2.5 text-xs border border-slate-300 rounded-xl leading-relaxed font-sans"
          />
        </div>
      </div>
      </div>

      {/* Right Live Preview */}
      <div className={`min-w-0 rounded-2xl border border-slate-300 bg-slate-200/70 p-4 sm:p-6 lg:sticky lg:top-20 lg:col-span-7 ${mobilePane === 'edit' ? 'hidden lg:block' : ''}`}>
        <div className="no-print flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-slate-700">{t('livePreview')}</span>
          <button
            onClick={onTriggerPrint}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <Download size={14} /> {t('downloadCover')}
          </button>
        </div>

        <div className="printable-document mx-auto min-h-[297mm] w-full max-w-[210mm] border border-slate-300 bg-white shadow-sheet">
          <CoverLetterTemplate profile={profile} letterData={letterData} />
        </div>
      </div>
    </div>
  );
};
