import React, { useState, useEffect } from 'react';
import { MasterProfile, CVDesignConfig, CoverLetterData } from '../types/cv';
import { initialMasterProfile, initialCVDesignConfig, initialCoverLetterData } from '../data/initialProfile';
import { FormEditor } from './FormEditor';
import { DocumentPreview } from './DocumentPreview';
import { CoverLetterEditor } from './CoverLetterEditor';
import { AtsScoreModal } from './AtsScoreModal';
import { PrintHelperModal } from './PrintHelperModal';
import { SmartImportModal } from './SmartImportModal';
import { AiAssistantModal } from './AiAssistantModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Share2, Check } from 'lucide-react';

interface StudioEditorProps {
  editorTab: 'profile' | 'cv' | 'cover-letter';
  setEditorTab: (tab: 'profile' | 'cv' | 'cover-letter') => void;
  onBackToLanding: () => void;
  smartImportOpen: boolean;
  setSmartImportOpen: (open: boolean) => void;
}

export const StudioEditor: React.FC<StudioEditorProps> = ({
  editorTab,
  setEditorTab,
  onBackToLanding,
  smartImportOpen,
  setSmartImportOpen,
}) => {
  const { isAuthenticated, user } = useAuth();

  // Load from LocalStorage if available
  const [profile, setProfile] = useState<MasterProfile>(() => {
    try {
      const saved = localStorage.getItem('prodil_master_profile');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.warn('Could not read stored profile:', err);
    }
    return initialMasterProfile;
  });

  const [config, setConfig] = useState<CVDesignConfig>(() => {
    try {
      const saved = localStorage.getItem('prodil_cv_config');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.warn('Could not read stored config:', err);
    }
    return initialCVDesignConfig;
  });

  const [letterData, setLetterData] = useState<CoverLetterData>(() => {
    try {
      const saved = localStorage.getItem('prodil_cover_letter');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.warn('Could not read stored cover letter:', err);
    }
    return initialCoverLetterData;
  });

  // Modal states
  const [atsScoreModalOpen, setAtsScoreModalOpen] = useState(false);
  const [printHelperOpen, setPrintHelperOpen] = useState(false);
  const [aiModalState, setAiModalState] = useState<{
    isOpen: boolean;
    type: 'summary' | 'bullets';
    initialRole?: string;
    initialText?: string;
  }>({
    isOpen: false,
    type: 'summary',
  });
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-save to LocalStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem('prodil_master_profile', JSON.stringify(profile));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('prodil_cv_config', JSON.stringify(config));
    } catch (err) {
      console.warn('LocalStorage config save failed:', err);
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem('prodil_cover_letter', JSON.stringify(letterData));
    } catch (err) {
      console.warn('LocalStorage cover letter save failed:', err);
    }
  }, [letterData]);

  // Sync to PostgreSQL backend when logged in (debounced)
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        api.saveMasterProfile(profile);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [profile, isAuthenticated]);

  // Export JSON backup
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${profile.personal.fullName.replace(/\s+/g, '_')}_prodil_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.personal) {
            setProfile(parsed);
            alert('Data profil berhasil dipulihkan dari file JSON!');
          }
        } catch {
          alert('Format file JSON tidak sesuai.');
        }
      };
    }
  };

  // Share Public Link
  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // PDF Print Trigger
  const handleTriggerPrint = () => {
    // Window.print gives vector selectable ATS text with zero canvas distortion!
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Workspace Header */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLanding}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            title="Kembali ke Beranda"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Workspace Studio</h2>
            <p className="text-xs text-slate-500">Master Profile &bull; 15 Template CV &bull; Live PDF Vector</p>
          </div>
        </div>

        {/* Tab switcher for mobile */}
        <div className="flex md:hidden items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setEditorTab('profile')}
            className={`px-3 py-1.5 rounded-lg ${editorTab === 'profile' ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setEditorTab('cv')}
            className={`px-3 py-1.5 rounded-lg ${editorTab === 'cv' ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}
          >
            CV
          </button>
          <button
            onClick={() => setEditorTab('cover-letter')}
            className={`px-3 py-1.5 rounded-lg ${editorTab === 'cover-letter' ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}
          >
            Surat
          </button>
        </div>

        {/* Share Link button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShareLink}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {copiedLink ? (
              <>
                <Check size={14} className="text-emerald-500" /> Tersalin!
              </>
            ) : (
              <>
                <Share2 size={14} /> Bagikan Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio View Switcher */}
      {editorTab === 'cover-letter' ? (
        <CoverLetterEditor
          profile={profile}
          letterData={letterData}
          setLetterData={setLetterData}
          onTriggerPrint={() => setPrintHelperOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Form Input Editor */}
          <div className="no-print lg:col-span-5 h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <FormEditor
              profile={profile}
              setProfile={setProfile}
              config={config}
              setConfig={setConfig}
              onOpenAiAssistant={(type, role, text) =>
                setAiModalState({ isOpen: true, type, initialRole: role, initialText: text })
              }
              onOpenSmartImport={() => setSmartImportOpen(true)}
              onExportJson={handleExportJson}
              onImportJsonFile={handleImportJsonFile}
            />
          </div>

          {/* Right Panel: Live Document Preview */}
          <div className="lg:col-span-7 h-[calc(100vh-140px)]">
            <DocumentPreview
              profile={profile}
              config={config}
              onOpenAtsScore={() => setAtsScoreModalOpen(true)}
              onTriggerPrint={() => setPrintHelperOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <AtsScoreModal
        isOpen={atsScoreModalOpen}
        onClose={() => setAtsScoreModalOpen(false)}
        profile={profile}
      />

      <PrintHelperModal
        isOpen={printHelperOpen}
        onClose={() => setPrintHelperOpen(false)}
        onProceedPrint={handleTriggerPrint}
      />

      <SmartImportModal
        isOpen={smartImportOpen}
        onClose={() => setSmartImportOpen(false)}
        onProfileImported={(newProfile) => setProfile(newProfile)}
      />

      <AiAssistantModal
        isOpen={aiModalState.isOpen}
        onClose={() => setAiModalState(prev => ({ ...prev, isOpen: false }))}
        type={aiModalState.type}
        initialRole={aiModalState.initialRole}
        initialText={aiModalState.initialText}
        onApply={(text) => {
          if (aiModalState.type === 'summary') {
            setProfile(prev => {
              const updated = [...prev.summaries];
              if (updated[0]) updated[0].text = text;
              else updated.push({ id: 'sum-1', label: 'AI Generated', text });
              return { ...prev, summaries: updated };
            });
          }
        }}
      />
    </div>
  );
};
