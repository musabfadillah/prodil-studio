import React from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';
import { MasterProfile } from '../types/cv';

interface AtsScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MasterProfile;
}

export const AtsScoreModal: React.FC<AtsScoreModalProps> = ({ isOpen, onClose, profile }) => {
  if (!isOpen) return null;

  const hasEmail = !!profile.personal.email;
  const hasPhone = !!profile.personal.phone;
  const hasLocation = !!profile.personal.location;
  const hasSummary = profile.summaries.length > 0 && !!profile.summaries[0].text;
  const hasExperience = profile.experiences.length > 0;
  const hasEducation = profile.educations.length > 0;
  const hasSkills = profile.skills.length >= 5;

  let score = 25; // Base score for 100% vector selectable text architecture
  if (hasEmail) score += 10;
  if (hasPhone) score += 10;
  if (hasLocation) score += 10;
  if (hasSummary) score += 15;
  if (hasExperience) score += 15;
  if (hasEducation) score += 10;
  if (hasSkills) score += 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Analisis ATS Score (Applicant Tracking System)</h3>
              <p className="text-[11px] text-slate-500">Standar kompatibilitas rekrutmen global 2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6">
            <div>
              <div className="text-3xl font-black text-emerald-700">{score}/100</div>
              <div className="text-xs font-bold text-emerald-800 mt-0.5">
                {score >= 90 ? 'ATS Ready & Sangat Direkomendasikan' : 'Cukup Baik - Lengkapi Detail'}
              </div>
            </div>
            <div className="text-right text-[11px] text-emerald-700">
              <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-800 font-bold">
                100% Vector Text
              </span>
            </div>
          </div>

          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Checklist Kompatibilitas ATS:</h4>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Format PDF Vektor Teks Asli (Tanpa html2canvas)
              </span>
              <span className="font-bold text-emerald-600">+25 Poin</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 size={16} className={hasEmail && hasPhone ? 'text-emerald-500' : 'text-amber-500'} />
                Kontak Lengkap (Email & Nomor HP)
              </span>
              <span className="font-bold text-slate-700">+20 Poin</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 size={16} className={hasSummary ? 'text-emerald-500' : 'text-amber-500'} />
                Professional Summary Terstruktur
              </span>
              <span className="font-bold text-slate-700">+15 Poin</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 size={16} className={hasExperience ? 'text-emerald-500' : 'text-amber-500'} />
                Riwayat Pengalaman Kerja Terurut
              </span>
              <span className="font-bold text-slate-700">+15 Poin</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 size={16} className={hasEducation ? 'text-emerald-500' : 'text-amber-500'} />
                Riwayat Pendidikan Terakreditasi
              </span>
              <span className="font-bold text-slate-700">+10 Poin</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 size={16} className={hasSkills ? 'text-emerald-500' : 'text-amber-500'} />
                Daftar Keahlian Kunci & Tools (&ge; 5 skills)
              </span>
              <span className="font-bold text-slate-700">+15 Poin</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
