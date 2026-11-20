import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, Check, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'summary' | 'bullets';
  initialRole?: string;
  initialText?: string;
  onApply: (generatedText: string) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  type,
  initialRole = 'Senior Frontend Developer',
  initialText = '',
  onApply,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [role, setRole] = useState(initialRole);
  const [experienceYears, setExperienceYears] = useState('3+');
  const [keySkills, setKeySkills] = useState('React, TypeScript, Tailwind, Node.js');
  const [jobDescription, setJobDescription] = useState('');
  const [rawBullets, setRawBullets] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      setErrorMsg('Autentikasi diperlukan untuk melindungi kuota Gemini API.');
      openAuthModal('login');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setGeneratedOptions([]);

    try {
      if (type === 'summary') {
        const res = await api.generateSummary({
          role,
          yearsOfExperience: experienceYears,
          keySkills,
          targetIndustry: 'Tech / Modern Industry'
        });
        if (res.success && res.data) {
          const opts = [];
          if (res.data.summaryIdText) opts.push(res.data.summaryIdText);
          if (res.data.summaryEn) opts.push(res.data.summaryEn);
          setGeneratedOptions(opts);
          setSelectedOption(opts[0] || '');
        } else {
          setErrorMsg(res.message || 'Gagal menghasilkan ringkasan.');
        }
      } else {
        const res = await api.optimizeBullets({
          role,
          rawBullets: rawBullets || 'Membangun aplikasi web dan memimpin tim.',
          jobDescription
        });
        if (res.success && res.data) {
          const text = res.data.formattedText || res.data.optimizedBullets?.join('\n') || '';
          setGeneratedOptions([text]);
          setSelectedOption(text);
        } else {
          setErrorMsg(res.message || 'Gagal mengoptimalkan poin pengalaman.');
        }
      }
    } catch (err: any) {
      if (err.message === 'AUTH_REQUIRED') {
        openAuthModal('login');
      } else {
        setErrorMsg(err.message || 'Terjadi kesalahan sistem AI.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (selectedOption) {
      onApply(selectedOption);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {type === 'summary' ? 'AI Summary Generator' : 'AI Work Experience Bullet Optimizer'}
              </h3>
              <p className="text-[11px] text-slate-500">Google Gemini 2.5 Flash &bull; Google XYZ Formula</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Posisi / Target Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {type === 'summary' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pengalaman</label>
                <input
                  type="text"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="e.g. 4+ tahun"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keahlian Kunci</label>
                <input
                  type="text"
                  value={keySkills}
                  onChange={(e) => setKeySkills(e.target.value)}
                  placeholder="e.g. React, UI/UX, REST API"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Poin Mentah Pengalaman Kerja</label>
              <textarea
                rows={3}
                value={rawBullets}
                onChange={(e) => setRawBullets(e.target.value)}
                placeholder="Tuliskan tugas harian kamu secara singkat..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Description / Target Lowongan (Opsional)
            </label>
            <textarea
              rows={2}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Tempel persyaratan lowongan kerja agar AI menyesuaikan kata kunci ATS..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Action Trigger */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Gemini AI sedang berpikir...
              </>
            ) : (
              <>
                <Sparkles size={14} /> Generate dengan Gemini AI
              </>
            )}
          </button>

          {/* Generated Options */}
          {generatedOptions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-2">Pilih Rekomendasi Hasil AI:</label>
              <div className="space-y-2">
                {generatedOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedOption(opt)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedOption === opt
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[11px] text-blue-700">Opsi #{idx + 1}</span>
                      {selectedOption === opt && <Check size={14} className="text-blue-600 font-bold" />}
                    </div>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">{opt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {generatedOptions.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              Batal
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Check size={14} /> Terapkan ke Formulir
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
