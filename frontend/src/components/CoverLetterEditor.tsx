import React, { useState } from 'react';
import { MasterProfile, CoverLetterData } from '../types/cv';
import { CoverLetterTemplate } from '../templates/CoverLetterTemplate';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Printer, Download, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CoverLetterEditorProps {
  profile: MasterProfile;
  letterData: CoverLetterData;
  setLetterData: React.Dispatch<React.SetStateAction<CoverLetterData>>;
  onTriggerPrint: () => void;
}

export const CoverLetterEditor: React.FC<CoverLetterEditorProps> = ({
  profile,
  letterData,
  setLetterData,
  onTriggerPrint,
}) => {
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
      setErrorMsg('Masuk ke akun kamu untuk menggunakan fitur AI Cover Letter.');
      openAuthModal('login');
      return;
    }

    if (!letterData.companyName || !letterData.jobTitle) {
      setErrorMsg('Nama Perusahaan dan Posisi Tujuan wajib diisi sebelum membuat surat.');
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
          letterBody: res.data.letterBody || prev.letterBody,
          subject: res.data.subject || prev.subject,
        }));
        setSuccessMsg('Surat lamaran berhasil dibuat dengan Gemini AI!');
      } else {
        setErrorMsg(res.message || 'Gagal membuat cover letter.');
      }
    } catch (err: any) {
      if (err.message === 'AUTH_REQUIRED') {
        openAuthModal('login');
      } else {
        setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
      }
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      {/* Left Form Settings */}
      <div className="no-print lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Cover Letter Generator</h3>
            <p className="text-[11px] text-slate-500">Sesuaikan surat lamaran dengan target lowongan</p>
          </div>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            Single Source of Truth
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
            <Sparkles size={14} className="text-amber-500" /> Draf Otomatis dengan Gemini AI
          </div>
          <p className="text-[11px] text-slate-600 leading-normal">
            AI akan menggabungkan keahlian dari Master Profile kamu dengan kebutuhan spesifik lowongan.
          </p>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Job Description / Persyaratan Lowongan
            </label>
            <textarea
              rows={2}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Tempel kriteria lowongan pekerjaan..."
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
                Gemini AI sedang menulis surat...
              </>
            ) : (
              <>
                <Sparkles size={13} /> Tulis Surat dengan AI
              </>
            )}
          </button>
        </div>

        {/* Manual Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Perusahaan Tujuan</label>
            <input
              type="text"
              value={letterData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="e.g. Google Indonesia"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Posisi Dilamar</label>
            <input
              type="text"
              value={letterData.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
              placeholder="e.g. Senior Frontend Specialist"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Penerima</label>
            <input
              type="text"
              value={letterData.recipientName}
              onChange={(e) => handleChange('recipientName', e.target.value)}
              placeholder="e.g. Hiring Team / Ibu Sarah"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Jabatan Penerima</label>
            <input
              type="text"
              value={letterData.recipientTitle}
              onChange={(e) => handleChange('recipientTitle', e.target.value)}
              placeholder="e.g. Talent Acquisition Lead"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Subject Email / Surat</label>
          <input
            type="text"
            value={letterData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Isi Lengkap Surat Lamaran</label>
          <textarea
            rows={10}
            value={letterData.letterBody}
            onChange={(e) => handleChange('letterBody', e.target.value)}
            className="w-full p-2.5 text-xs border border-slate-300 rounded-xl leading-relaxed font-sans"
          />
        </div>
      </div>

      {/* Right Live Preview */}
      <div className="lg:col-span-7 bg-slate-200/70 p-4 sm:p-6 rounded-2xl border border-slate-300 overflow-auto">
        <div className="no-print flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-slate-700">Live Preview Dokumen (A4)</span>
          <button
            onClick={onTriggerPrint}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <Download size={14} /> Download PDF Surat
          </button>
        </div>

        <div className="printable-document bg-white rounded-lg shadow-sheet overflow-hidden border border-slate-300 max-w-[210mm] mx-auto min-h-[297mm]">
          <CoverLetterTemplate profile={profile} letterData={letterData} />
        </div>
      </div>
    </div>
  );
};
