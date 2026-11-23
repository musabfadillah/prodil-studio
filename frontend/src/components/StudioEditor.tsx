import React, { useState, useEffect } from 'react';
import { MasterProfile, CVDesignConfig, CoverLetterData, LegacySectionKey } from '../types/cv';
import { initialMasterProfile, initialCVDesignConfig, initialCoverLetterData } from '../data/initialProfile';
import { FormEditor } from './FormEditor';
import { DocumentPreview } from './DocumentPreview';
import { CoverLetterEditor } from './CoverLetterEditor';
import { AtsScoreModal } from './AtsScoreModal';
import { PrintHelperModal } from './PrintHelperModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Share2, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface StudioEditorProps {
  editorTab: 'profile' | 'cv' | 'cover-letter';
  setEditorTab: (tab: 'profile' | 'cv' | 'cover-letter') => void;
  initialTemplateId?: number;
  onTemplateChange?: (templateId: number) => void;
  onBackToLanding: () => void;
}

export const StudioEditor: React.FC<StudioEditorProps> = ({
  editorTab,
  setEditorTab,
  initialTemplateId,
  onTemplateChange,
  onBackToLanding,
}) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [cloudHydrated, setCloudHydrated] = useState(false);

  // Load from LocalStorage if available
  const [profile, setProfile] = useState<MasterProfile>(() => {
    try {
      const saved = localStorage.getItem('prodil_master_profile');
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<MasterProfile>;
        return {
          ...initialMasterProfile,
          ...parsed,
          personal: { ...initialMasterProfile.personal, ...parsed.personal },
          hiddenFields: parsed.hiddenFields || {},
          visibleSections: { ...initialMasterProfile.visibleSections, ...parsed.visibleSections },
          customSections: parsed.customSections || [],
        };
      }
    } catch (err) {
      console.warn('Could not read stored profile:', err);
    }
    return initialMasterProfile;
  });

  const [config, setConfig] = useState<CVDesignConfig>(() => {
    try {
      const saved = localStorage.getItem('prodil_cv_config');
      const parsed = saved ? (JSON.parse(saved) as Partial<CVDesignConfig>) : {};
      return {
        ...initialCVDesignConfig,
        ...parsed,
        themeId: initialTemplateId ?? parsed.themeId ?? initialCVDesignConfig.themeId,
        visibleSections: { ...initialCVDesignConfig.visibleSections, ...parsed.visibleSections },
        sectionOrder: parsed.sectionOrder || initialCVDesignConfig.sectionOrder,
        hiddenSections: parsed.hiddenSections || [],
      };
    } catch (err) {
      console.warn('Could not read stored config:', err);
    }
    return {
      ...initialCVDesignConfig,
      themeId: initialTemplateId ?? initialCVDesignConfig.themeId,
    };
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

  // Sync incoming template selection from LandingPage into active workspace config
  useEffect(() => {
    if (!initialTemplateId) return;
    setConfig((previous) => {
      if (previous.themeId === initialTemplateId) return previous;
      return {
        ...previous,
        themeId: initialTemplateId,
      };
    });
  }, [initialTemplateId]);

  // Notify parent when user switches theme inside Studio
  useEffect(() => {
    if (config.themeId) {
      onTemplateChange?.(config.themeId);
    }
  }, [config.themeId, onTemplateChange]);

  // Modal & UI states
  const [atsScoreModalOpen, setAtsScoreModalOpen] = useState(false);
  const [printHelperOpen, setPrintHelperOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [mobilePane, setMobilePane] = useState<'edit' | 'preview'>('edit');
  const [focusedSection, setFocusedSection] = useState<'personal' | LegacySectionKey>('personal');
  const [syncStatus, setSyncStatus] = useState<'Saved locally' | 'Synced to Cloud'>('Saved locally');

  // Auto-save to LocalStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem('prodil_master_profile', JSON.stringify(profile));
      setSyncStatus(isAuthenticated ? 'Synced to Cloud' : 'Saved locally');
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }, [profile, isAuthenticated]);

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

  useEffect(() => {
    if (!isAuthenticated) {
      setCloudHydrated(false);
      return;
    }

    let active = true;
    api.getWorkspace()
      .then((workspace) => {
        if (!active) return;
        if (workspace.profile && workspace.profileHasData !== false) {
          const remote = api.toStudioProfile(workspace.profile);
          setProfile((previous) => ({
            ...previous,
            ...remote,
            personal: workspace.profileHasPersonalData === false
              ? previous.personal
              : {
                  ...previous.personal,
                  ...remote.personal,
                  fullName: remote.personal?.fullName?.trim() || previous.personal.fullName,
                  headline: remote.personal?.headline?.trim() || previous.personal.headline,
                  email: remote.personal?.email?.trim() || previous.personal.email,
                  phone: remote.personal?.phone?.trim() || previous.personal.phone,
                  location: remote.personal?.location?.trim() || previous.personal.location,
                  website: remote.personal?.website?.trim() || previous.personal.website,
                  photoUrl: remote.personal?.photoUrl?.trim() || previous.personal.photoUrl,
                  socials: remote.personal?.socials?.length ? remote.personal.socials : previous.personal.socials,
                },
            summaries: remote.summaries?.length ? remote.summaries : previous.summaries,
            experiences: remote.experiences?.length ? remote.experiences : previous.experiences,
            educations: remote.educations?.length ? remote.educations : previous.educations,
            projects: remote.projects?.length ? remote.projects : previous.projects,
            skills: remote.skills?.length ? remote.skills : previous.skills,
            languages: remote.languages?.length ? remote.languages : previous.languages,
            certifications: remote.certifications?.length ? remote.certifications : previous.certifications,
            achievements: remote.achievements?.length ? remote.achievements : previous.achievements,
            customSections: remote.customSections?.length ? remote.customSections : previous.customSections,
            sectionOrder: remote.sectionOrder?.length ? remote.sectionOrder : previous.sectionOrder,
            visibleSections: Object.keys(remote.visibleSections || {}).length
              ? { ...previous.visibleSections, ...remote.visibleSections }
              : previous.visibleSections,
            hiddenFields: remote.hiddenFields && Object.keys(remote.hiddenFields).length > 0
              ? remote.hiddenFields
              : previous.hiddenFields,
          }));
        }
        if (workspace.cvs?.[0]) {
          const remoteCv = api.toStudioCv(workspace.cvs[0]);
          setConfig((previous) => ({
            ...remoteCv,
            themeId: initialTemplateId ?? remoteCv.themeId ?? previous.themeId,
          }));
        }
        if (workspace.letters?.[0]) setLetterData(api.toStudioLetter(workspace.letters[0]));
        setCloudHydrated(true);
      })
      .catch((error) => {
        console.error('[Workspace] Failed to load cloud data:', error);
        if (active) setCloudHydrated(true);
      });

    return () => { active = false; };
  }, [isAuthenticated, initialTemplateId]);

  // Sync to PostgreSQL backend when logged in (debounced)
  useEffect(() => {
    if (isAuthenticated && cloudHydrated) {
      const timer = setTimeout(() => {
        api.saveMasterProfile(profile).catch((error) => {
          console.error('[Workspace] Failed to save master profile:', error);
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [profile, isAuthenticated, cloudHydrated]);

  useEffect(() => {
    if (!isAuthenticated || !cloudHydrated) return;
    const timer = setTimeout(async () => {
      try {
        const cv = api.toProdilCv(config);
        if (config.id !== undefined) {
          await api.saveCv(config.id, { ...cv, id: config.id });
        } else {
          const created = await api.createCv(cv);
          setConfig((previous) => ({ ...previous, id: created.cv.id }));
        }
        if (letterData.id !== undefined) {
          await api.saveCoverLetter(letterData.id, api.toProdilLetter(letterData));
        }
      } catch (error) {
        console.error('[Workspace] Failed to save CV or cover letter:', error);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [config, letterData, isAuthenticated, cloudHydrated]);

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
            alert(t('jsonRestored'));
          }
        } catch {
          alert(t('jsonInvalid'));
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
    window.print();
  };

  return (
    <div className="studio-container mx-auto w-full max-w-[1680px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-6">
      {/* Top Workspace Header */}
      <div className="no-print glass-panel mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/80 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToLanding}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            title={t('backHome')}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{t('workspace')}</h2>
            <p className="text-xs text-slate-500">{t('livePdf')}</p>
          </div>
        </div>

        {/* Tab switcher for mobile */}
        <div className="flex md:hidden items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setEditorTab('profile')}
            className={`px-3 py-1.5 rounded-lg ${editorTab === 'profile' ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}
          >
            {t('masterProfile')}
          </button>
          <button
            type="button"
            onClick={() => setEditorTab('cv')}
            className={`px-3 py-1.5 rounded-lg ${editorTab === 'cv' ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}
          >
            {t('jobStudio')}
          </button>
          <button
            type="button"
            onClick={() => setEditorTab('cover-letter')}
            className={`px-3 py-1.5 rounded-lg ${editorTab === 'cover-letter' ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}
          >
            {t('coverLetter')}
          </button>
        </div>

        {/* Share Link button */}
        <div className="flex items-center gap-2">
          <span className={`hidden rounded-full border px-3 py-1.5 text-[11px] font-bold sm:inline-flex ${syncStatus === 'Synced to Cloud' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
            <span className={`mr-1.5 mt-1 h-1.5 w-1.5 rounded-full ${syncStatus === 'Synced to Cloud' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {syncStatus === 'Synced to Cloud' ? t('syncedCloud') : t('savedLocal')}
          </span>
          <button
            type="button"
            onClick={handleShareLink}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {copiedLink ? (
              <>
                <Check size={14} className="text-emerald-500" /> {t('copied')}
              </>
            ) : (
              <>
                <Share2 size={14} /> {t('shareLink')}
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
          mobilePane={mobilePane}
        />
      ) : (
        <div className="studio-grid grid grid-cols-1 gap-6 items-start lg:grid-cols-12">
          {/* Left Panel: Form Input Editor */}
          <div className={`no-print min-w-0 lg:col-span-5 ${mobilePane === 'preview' ? 'hidden lg:block' : ''}`}>
            <FormEditor
              profile={profile}
              setProfile={setProfile}
              config={config}
              setConfig={setConfig}
              focusedSection={focusedSection}
              onExportJson={handleExportJson}
              onImportJsonFile={handleImportJsonFile}
            />
          </div>

          {/* Right Panel: Live Document Preview */}
          <div
            data-print-cv-preview="true"
            className={`min-w-0 lg:sticky lg:top-20 lg:col-span-7 ${mobilePane === 'edit' ? 'hidden lg:block' : ''}`}
          >
            <DocumentPreview
              profile={profile}
              config={config}
              setConfig={setConfig}
              onSectionFocus={setFocusedSection}
              onOpenAtsScore={() => setAtsScoreModalOpen(true)}
              onTriggerPrint={() => setPrintHelperOpen(true)}
            />
          </div>
        </div>
      )}

      <nav className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-slate-200 bg-white/95 p-2 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden" aria-label={t('workspaceNavigation')}>
        <button
          type="button"
          onClick={() => setMobilePane('edit')}
          aria-pressed={mobilePane === 'edit'}
          className={`rounded-xl px-3 py-3 text-xs font-bold transition-colors ${mobilePane === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          📝 {t('editData')}
        </button>
        <button
          type="button"
          onClick={() => setMobilePane('preview')}
          aria-pressed={mobilePane === 'preview'}
          className={`rounded-xl px-3 py-3 text-xs font-bold transition-colors ${mobilePane === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          👁 {t('livePreviewCv')}
        </button>
      </nav>

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
    </div>
  );
};