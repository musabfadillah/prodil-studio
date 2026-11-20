import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MasterProfile } from '../types/cv';
import { X, Upload, FileText, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface SmartImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileImported: (profile: MasterProfile) => void;
}

export const SmartImportModal: React.FC<SmartImportModalProps> = ({
  isOpen,
  onClose,
  onProfileImported,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const handleProcessImport = async () => {
    if (!isAuthenticated) {
      setErrorMsg('Autentikasi diperlukan. Silakan masuk untuk melindungi kuota Gemini AI.');
      openAuthModal('login');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'file' && file) {
        // If file is JSON, parse locally
        if (file.name.endsWith('.json')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const parsed = JSON.parse(event.target?.result as string);
              if (parsed.personal) {
                onProfileImported(parsed);
                setSuccessMsg('Master Profile berhasil diimpor dari file JSON!');
                setTimeout(() => onClose(), 1200);
              } else {
                setErrorMsg('Format file JSON tidak sesuai dengan struktur Master Profile.');
              }
            } catch {
              setErrorMsg('Gagal membaca file JSON.');
            } finally {
              setLoading(false);
            }
          };
          reader.readAsText(file);
          return;
        }

        // PDF or DOCX: send to backend
        const res = await api.smartImportFile(file);
        if (res.success && res.data) {
          onProfileImported(res.data);
          setSuccessMsg(res.message || 'CV berhasil diekstrak dengan Gemini AI!');
          setTimeout(() => onClose(), 1500);
        } else {
          setErrorMsg(res.message || 'Gagal mengekstrak isi resume.');
        }
      } else if (mode === 'text' && pasteText.trim()) {
        const dummyBlob = new Blob([pasteText], { type: 'text/plain' });
        const textFile = new File([dummyBlob], 'pasted_cv.txt', { type: 'text/plain' });
        const res = await api.smartImportFile(textFile);
        if (res.success && res.data) {
          onProfileImported(res.data);
          setSuccessMsg('CV berhasil diurai!');
          setTimeout(() => onClose(), 1500);
        } else {
          setErrorMsg(res.message || 'Gagal mengurai teks resume.');
        }
      } else {
        setErrorMsg('Pilih file resume atau tempel teks CV kamu.');
      }
    } catch (err: any) {
      if (err.message === 'AUTH_REQUIRED') {
        openAuthModal('login');
      } else {
        setErrorMsg(err.message || 'Terjadi kesalahan saat memproses file.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">AI CV Parser / Smart Import</h3>
              <p className="text-[11px] text-slate-500">Ekstrak otomatis isi CV lama (.pdf, .docx, .json)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold">
            <button
              onClick={() => setMode('file')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'file' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Unggah File (.pdf / .docx / .json)
            </button>
            <button
              onClick={() => setMode('text')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Tempel Teks Mentah
            </button>
          </div>

          {mode === 'file' ? (
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
              <input
                type="file"
                accept=".pdf,.docx,.doc,.json,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="smart-file-upload"
              />
              <label htmlFor="smart-file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Upload size={22} />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {file ? file.name : 'Klik untuk memilih file CV lama'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Mendukung PDF, DOCX (Word), JSON Backup, TXT (Maks. 10MB)
                </span>
              </label>
            </div>
          ) : (
            <div>
              <textarea
                rows={6}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Tempel teks resume atau riwayat kerja kamu di sini..."
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          )}

          <div className="mt-5 flex items-center justify-between">
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" /> Ditenagai Google Gemini 2.5 Flash
            </p>

            <button
              onClick={handleProcessImport}
              disabled={loading || (mode === 'file' && !file) || (mode === 'text' && !pasteText.trim())}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mengekstrak Data...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Ekstrak ke Formulir
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
