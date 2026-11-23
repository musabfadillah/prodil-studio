import React, { useEffect, useState } from 'react';
import { MasterProfile, CVDesignConfig, LegacySectionKey } from '../types/cv';
import type { CustomSection, CustomSectionItem, CustomSectionLayout, SectionKey } from '../types/prodil';
import { CV_TEMPLATES } from '../templates/TemplateRegistry';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Upload,
  Download,
  Palette,
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Code2,
  Languages,
  Award,
  Check,
  MoveUp,
  MoveDown,
  X,
  FileText,
} from 'lucide-react';
import { initialMasterProfile, johnSmithProfile } from '../data/initialProfile';
import { useLanguage } from '../context/LanguageContext';

const templateCategoryKey = (category: string) => ({
  'ATS Clean': 'templateCategoryAts',
  Executive: 'templateCategoryExecutive',
  Modern: 'templateCategoryModern',
  Creative: 'templateCategoryCreative',
  Technical: 'templateCategoryTechnical',
}[category] || 'templateCategories');

const VisibilitySwitch: React.FC<{
  checked: boolean;
  onChange: () => void;
  label: string;
  compact?: boolean;
}> = ({ checked, onChange, label, compact = false }) => (
  <span className={`inline-flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
    {compact && <span className="text-[9px] font-semibold text-slate-500">{label}</span>}
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={onChange}
      className={`w-10 h-5 rounded-full transition-colors duration-200 flex items-center p-0.5 cursor-pointer ${
        checked ? 'bg-blue-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </span>
);

interface FormEditorProps {
  profile: MasterProfile;
  setProfile: React.Dispatch<React.SetStateAction<MasterProfile>>;
  config: CVDesignConfig;
  setConfig: React.Dispatch<React.SetStateAction<CVDesignConfig>>;
  onExportJson: () => void;
  onImportJsonFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  focusedSection?: 'personal' | LegacySectionKey;
}

export const FormEditor: React.FC<FormEditorProps> = ({
  profile,
  setProfile,
  config,
  setConfig,
  onExportJson,
  onImportJsonFile,
  focusedSection,
}) => {
  const { t, templateName } = useLanguage();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    education: false,
    projects: false,
    skills: false,
    languages: false,
    achievements: false,
    certifications: false,
  });
  const [customSectionTitle, setCustomSectionTitle] = useState('');
  const [customSectionLayout, setCustomSectionLayout] = useState<CustomSectionLayout>('timeline');

  useEffect(() => {
    if (!focusedSection) return;
    const section = focusedSection === 'personal' ? 'personal' : focusedSection;
    setOpenSections((previous) => ({ ...previous, [section]: true }));
    requestAnimationFrame(() => {
      document.getElementById(`editor-section-${section}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [focusedSection]);

  const toggleSection = (sec: string) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const setSectionVisibility = (key: LegacySectionKey) => {
    const visible = !(config.visibleSections?.[key as SectionKey] ?? !config.hiddenSections.includes(key));
    setConfig(prev => ({
      ...prev,
      visibleSections: { ...prev.visibleSections, [key as SectionKey]: visible },
      hiddenSections: visible
        ? prev.hiddenSections.filter(section => section !== key)
        : [...prev.hiddenSections, key],
    }));
    setProfile(prev => ({
      ...prev,
      visibleSections: { ...prev.visibleSections, [key as SectionKey]: visible },
    }));
  };

  const moveSection = (key: LegacySectionKey, direction: -1 | 1) => {
    setConfig(prev => {
      const order = [...prev.sectionOrder];
      let index = order.indexOf(key);
      if (index < 0) {
        order.push(key);
        index = order.length - 1;
      }
      if (index + direction < 0 || index + direction >= order.length) return prev;
      [order[index], order[index + direction]] = [order[index + direction], order[index]];
      setProfile(current => ({ ...current, sectionOrder: order }));
      return { ...prev, sectionOrder: order };
    });
  };

  const renderSectionTools = (key: LegacySectionKey) => {
    const visible = config.visibleSections?.[key as SectionKey] ?? !config.hiddenSections.includes(key);
    return (
      <span className="flex items-center gap-0.5">
        <VisibilitySwitch
          checked={visible}
          onChange={() => setSectionVisibility(key)}
          label={visible ? t('hideSection') : t('showSection')}
          compact
        />
        <button type="button" onClick={() => moveSection(key, -1)} title={t('moveUp')} aria-label={t('moveUp')} className="rounded-md p-1 text-slate-500 hover:bg-slate-200"><MoveUp size={13} /></button>
        <button type="button" onClick={() => moveSection(key, 1)} title={t('moveDown')} aria-label={t('moveDown')} className="rounded-md p-1 text-slate-500 hover:bg-slate-200"><MoveDown size={13} /></button>
      </span>
    );
  };

  const addCustomSection = (layoutType: CustomSectionLayout, title: string) => {
    const section: CustomSection = {
      id: `custom-${Date.now()}`,
      title: title.trim() || 'Additional Information',
      layoutType,
      visible: true,
      items: [],
    };
    setProfile(prev => ({ ...prev, customSections: [...(prev.customSections || []), section] }));
    setOpenSections(prev => ({ ...prev, [section.id]: true }));
  };

  const updateCustomSection = (id: string, update: Partial<CustomSection>) => {
    setProfile(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(section => section.id === id ? { ...section, ...update } : section),
    }));
  };

  const updateCustomItem = (sectionId: string, itemId: string, update: Partial<CustomSectionItem>) => {
    const section = profile.customSections?.find(item => item.id === sectionId);
    if (!section) return;
    updateCustomSection(sectionId, {
      items: section.items.map(item => item.id === itemId ? { ...item, ...update } : item),
    });
  };

  const accentPalette = [
    { name: 'Prodil Blue', hex: '#2563eb' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Warm Amber', hex: '#d97706' },
    { name: 'Luxury Gold', hex: '#b48c36' },
    { name: 'Navy Slate', hex: '#0f172a' },
    { name: 'Royal Indigo', hex: '#4f46e5' },
    { name: 'Rose Red', hex: '#e11d48' }
  ];

  const fontOptions = [
    { label: `Plus Jakarta Sans (${t('fontModernClean')})`, value: 'Plus Jakarta Sans' },
    { label: `Inter (${t('fontAtsReadable')})`, value: 'Inter' },
    { label: `Merriweather (${t('fontClassicSerif')})`, value: 'Merriweather' },
    { label: `JetBrains Mono (${t('fontTechMonospace')})`, value: 'JetBrains Mono' },
  ];

  const handlePersonalChange = (field: keyof typeof profile.personal, val: any) => {
    setProfile(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: val }
    }));
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handlePersonalChange('photoUrl', reader.result);
        setConfig(prev => ({ ...prev, showPhoto: true }));
        setProfile(prev => ({
          ...prev,
          hiddenFields: { ...prev.hiddenFields, photo: false },
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const addExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      role: 'Frontend Developer',
      company: 'Tech Studio',
      location: 'Jakarta',
      startDate: '2023',
      endDate: 'Present',
      current: true,
      description: '• Mengembangkan antarmuka web modern dengan performa tinggi.\n• Berkolaborasi dengan tim lintas fungsi.'
    };
    setProfile(prev => ({ ...prev, experiences: [newExp, ...prev.experiences] }));
  };

  const removeExperience = (id: string) => {
    setProfile(prev => ({ ...prev, experiences: prev.experiences.filter(e => e.id !== id) }));
  };

  const updateExperience = (id: string, field: string, val: any) => {
    setProfile(prev => ({
      ...prev,
      experiences: prev.experiences.map(e => e.id === id ? { ...e, [field]: val } : e)
    }));
  };

  const addEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      degree: 'Sarjana Komputer',
      institution: 'Universitas Indonesia',
      location: 'Depok',
      startDate: '2019',
      endDate: '2023',
      gpa: '3.80'
    };
    setProfile(prev => ({ ...prev, educations: [...prev.educations, newEdu] }));
  };

  const removeEducation = (id: string) => {
    setProfile(prev => ({ ...prev, educations: prev.educations.filter(e => e.id !== id) }));
  };

  const updateEducation = (id: string, field: string, val: any) => {
    setProfile(prev => ({
      ...prev,
      educations: prev.educations.map(e => e.id === id ? { ...e, [field]: val } : e)
    }));
  };

  const addProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      title: 'Proyek Baru',
      role: 'Lead Developer',
      metrics: '10K+ Pengguna Aktif',
      link: 'https://github.com/project',
      description: 'Membangun aplikasi full-stack dengan integrasi API mutakhir.'
    };
    setProfile(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const removeProject = (id: string) => {
    setProfile(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const updateProject = (id: string, field: string, val: any) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, [field]: val } : p)
    }));
  };

  return (
    <div className="space-y-5 pb-12">
      {/* 1. TEMPLATE & STYLING CONTROLS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Palette size={14} className="text-blue-600" /> {t('templateDesignStyle')}
          </h3>
          <span className="text-[11px] font-bold text-blue-600">{t('templateGallery').replace('(1–15)','')} #{config.themeId}</span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            {t('chooseCvDesign')}
          </label>
          <select
            value={config.themeId}
            onChange={(e) => {
              const themeId = parseInt(e.target.value, 10);
              setConfig(prev => ({
                ...prev,
                themeId,
                accentColor: '',
              }));
            }}
            className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {CV_TEMPLATES.map(template => (
              <option key={template.id} value={template.id}>
                #{template.id} {templateName(template.id)} ({t(templateCategoryKey(template.category))})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">{t('accentColor')}</label>
            <div className="flex items-center gap-1.5">
              {accentPalette.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => setConfig(prev => ({ ...prev, accentColor: c.hex }))}
                  className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                    config.accentColor === c.hex ? 'border-slate-900 scale-110 shadow-sm' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {config.accentColor === c.hex && <Check size={12} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">{t('fontFamily')}</label>
            <select
              value={config.fontFamily}
              onChange={(e) => setConfig(prev => ({ ...prev, fontFamily: e.target.value }))}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none"
            >
              {fontOptions.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-700">{t('showPhoto')}</span>
          <VisibilitySwitch
            checked={config.showPhoto}
            onChange={() => setConfig(prev => ({ ...prev, showPhoto: !prev.showPhoto }))}
            label={t('showPhoto')}
          />
        </div>
      </div>

      {/* 2. DATA MANAGEMENT (BACKUP & IMPORT) */}
      <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportJson}
            title="JSON"
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs"
          >
            <Download size={13} /> {t('backupData')}
          </button>
          <label className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs cursor-pointer">
            <Upload size={13} /> {t('importData')}
            <input type="file" accept=".json" onChange={onImportJsonFile} className="hidden" />
          </label>
        </div>
      </div>

      {/* Sample profiles */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <label className="mb-1.5 block text-[11px] font-bold text-slate-700">{t('sampleSwitcher')}</label>
        <select
          value={profile.personal.fullName === 'John Smith' ? 'john' : 'alex'}
          onChange={(event) => {
            const sample = event.target.value === 'john' ? johnSmithProfile : initialMasterProfile;
            setProfile({
              ...sample,
              personal: { ...sample.personal, socials: [...sample.personal.socials] },
              summaries: sample.summaries.map(item => ({ ...item })),
              experiences: sample.experiences.map(item => ({ ...item })),
              educations: sample.educations.map(item => ({ ...item })),
              projects: sample.projects.map(item => ({ ...item })),
              customSections: (sample.customSections || []).map(section => ({ ...section, items: section.items.map(item => ({ ...item })) })),
            });
          }}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
        >
          <option value="john">{t('sampleJohn')}</option>
          <option value="alex">{t('sampleAlex')}</option>
        </select>
      </div>

      {/* SECTION: PERSONAL DETAILS */}
      <div id="editor-section-personal" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 bg-slate-50 p-3">
          <button type="button" onClick={() => toggleSection('personal')} className="flex flex-1 items-center justify-between rounded-lg p-1 text-left hover:bg-slate-100">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-2"><User size={15} className="text-blue-600" /> {t('personalDetails')}</span>
            {openSections.personal ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div className="flex flex-wrap items-center justify-end gap-1">
            {(['photo', 'location', 'website', 'socials'] as const).map((field) => {
              const hidden = profile.hiddenFields?.[field] === true;
              const fieldLabel = field === 'photo' ? t('photo') : field === 'location' ? t('location') : field === 'website' ? t('website') : t('socialMedia');
              return (
                <VisibilitySwitch
                  key={field}
                  checked={!hidden}
                  onChange={() => setProfile(prev => ({
                    ...prev,
                    hiddenFields: { ...prev.hiddenFields, [field]: !hidden },
                  }))}
                  label={fieldLabel}
                  compact
                />
              );
            })}
          </div>
        </div>

        {openSections.personal && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t('fullName')}</label>
                <input
                  type="text"
                  value={profile.personal.fullName}
                  onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t('headline')}</label>
                <input
                  type="text"
                  value={profile.personal.headline}
                  onChange={(e) => handlePersonalChange('headline', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t('email')}</label>
                <input
                  type="email"
                  value={profile.personal.email}
                  onChange={(e) => handlePersonalChange('email', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t('phone')}</label>
                <input
                  type="text"
                  value={profile.personal.phone}
                  onChange={(e) => handlePersonalChange('phone', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t('location')}</label>
                <input
                  type="text"
                  value={profile.personal.location}
                  onChange={(e) => handlePersonalChange('location', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t('website')}</label>
                <input
                  type="text"
                  value={profile.personal.website}
                  onChange={(e) => handlePersonalChange('website', e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Upload Photo</label>
                <div className="space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    className="block w-full text-[11px] text-slate-600 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-300 file:text-[11px] file:font-semibold file:bg-slate-50 file:text-slate-800 hover:file:bg-slate-100 border border-slate-300 rounded-lg bg-white p-1 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={profile.personal.photoUrl.startsWith('data:') ? '' : profile.personal.photoUrl}
                    onChange={(e) => handlePersonalChange('photoUrl', e.target.value)}
                    placeholder="Atau tempel URL foto (https://...)"
                    className="w-full text-[11px] px-2.5 py-1 border border-slate-200 rounded-lg text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION: PROFESSIONAL SUMMARY */}
      <div id="editor-section-summary" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2">
          <button type="button" onClick={() => toggleSection('summary')} className="flex flex-1 items-center justify-between rounded-lg p-2 text-left hover:bg-slate-100">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-2"><FileText size={15} className="text-blue-600" /> {t('professionalSummary')}</span>
            {openSections.summary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>{renderSectionTools('summary')}
        </div>

        {openSections.summary && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600">{t('summaryPlaceholder')}</span>
            </div>
            {profile.summaries.length > 1 && (
              <select value={profile.summaries.some(item => item.id === config.activeSummaryId) ? config.activeSummaryId : profile.summaries[0]?.id || ''} onChange={(event) => setConfig(prev => ({ ...prev, activeSummaryId: event.target.value }))} className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs">
                {profile.summaries.map((summary, index) => <option key={summary.id} value={summary.id}>{summary.label || `Summary ${index + 1}`}</option>)}
              </select>
            )}
            <textarea
              rows={4}
              value={profile.summaries.find(item => item.id === config.activeSummaryId)?.text || profile.summaries[0]?.text || ''}
              onChange={(e) => {
                const activeId = profile.summaries.find(item => item.id === config.activeSummaryId)?.id || profile.summaries[0]?.id;
                setProfile(prev => ({
                  ...prev,
                  summaries: activeId
                    ? prev.summaries.map(item => item.id === activeId ? { ...item, text: e.target.value } : item)
                    : [...prev.summaries, { id: `sum-${Date.now()}`, label: 'Main', text: e.target.value }],
                }));
              }}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
            <button type="button" onClick={() => {
              const id = `sum-${Date.now()}`;
              setProfile(prev => ({ ...prev, summaries: [...prev.summaries, { id, label: `Summary ${prev.summaries.length + 1}`, text: '' }] }));
              setConfig(prev => ({ ...prev, activeSummaryId: id }));
            }} className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 py-2 text-xs font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600">
              <Plus size={14} /> {t('addItem')}
            </button>
          </div>
        )}
      </div>

      {/* SECTION: WORK EXPERIENCE */}
      <div id="editor-section-experience" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2">
          <button type="button" onClick={() => toggleSection('experience')} className="flex flex-1 items-center justify-between rounded-lg p-2 text-left hover:bg-slate-100">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-2"><Briefcase size={15} className="text-blue-600" /> {t('workExperience')} ({profile.experiences.length})</span>
            {openSections.experience ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>{renderSectionTools('experience')}
        </div>

        {openSections.experience && (
          <div className="p-4 space-y-4">
            {profile.experiences.map((exp, idx) => (
              <div key={exp.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">#{idx + 1} {exp.role || 'Jabatan'}</span>
                  <button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                    placeholder={t('rolePlaceholder')}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    placeholder={t('companyPlaceholder')}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                    placeholder={t('cityPlaceholder')}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                    placeholder={t('startPlaceholder')}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                    placeholder={t('endPlaceholder')}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    {t('achievementBulletsLabel')}
                  </label>
                  <textarea
                    rows={3}
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white font-mono leading-relaxed"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addExperience}
              className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus size={14} /> {t('addWorkExperience')}
            </button>
          </div>
        )}
      </div>

      {/* SECTION: EDUCATION */}
      <div id="editor-section-education" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2">
          <button type="button" onClick={() => toggleSection('education')} className="flex flex-1 items-center justify-between rounded-lg p-2 text-left hover:bg-slate-100">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-2"><GraduationCap size={15} className="text-emerald-600" /> {t('education')} ({profile.educations.length})</span>
            {openSections.education ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>{renderSectionTools('education')}
        </div>

        {openSections.education && (
          <div className="p-4 space-y-3">
            {profile.educations.map((edu) => (
              <div key={edu.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{edu.degree}</span>
                  <button
                    type="button"
                    onClick={() => removeEducation(edu.id)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    placeholder={t('degreePlaceholder')}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    placeholder={t('schoolPlaceholder')}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                    placeholder={t('startYearPlaceholder')}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                    placeholder={t('endYearPlaceholder')}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={edu.gpa}
                    onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                    placeholder={t('gpaPlaceholder')}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addEducation}
              className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-600 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus size={14} /> {t('addEducationItem')}
            </button>
          </div>
        )}
      </div>

      {/* SECTION: SKILLS */}
      <div id="editor-section-skills" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2">
          <button type="button" onClick={() => toggleSection('skills')} className="flex flex-1 items-center justify-between rounded-lg p-2 text-left hover:bg-slate-100">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-2"><Code2 size={15} className="text-blue-600" /> {t('skills')} ({profile.skills.length})</span>
            {openSections.skills ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>{renderSectionTools('skills')}
        </div>

        {openSections.skills && (
          <div className="p-4 space-y-3">
            <label className="block text-[11px] font-semibold text-slate-600">
              {t('skillsCommaHint')}
            </label>
            <textarea
              rows={3}
              value={profile.skills.join(', ')}
              onChange={(e) => {
                const splitted = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                setProfile(prev => ({ ...prev, skills: splitted }));
              }}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button type="button" onClick={() => setProfile(prev => ({ ...prev, skills: [...prev.skills, 'Skill baru'] }))} className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 py-2 text-xs font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600">
              <Plus size={14} /> {t('addSkill')}
            </button>
          </div>
        )}
      </div>

      {/* SECTION: PROJECTS */}
      <div id="editor-section-projects" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2">
          <button type="button" onClick={() => toggleSection('projects')} className="flex flex-1 items-center justify-between rounded-lg p-2 text-left hover:bg-slate-100">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-2"><FolderGit2 size={15} className="text-indigo-600" /> {t('projects')} ({profile.projects.length})</span>
            {openSections.projects ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>{renderSectionTools('projects')}
        </div>

        {openSections.projects && (
          <div className="p-4 space-y-3">
            {profile.projects.map((proj) => (
              <div key={proj.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{proj.title}</span>
                  <button
                    type="button"
                    onClick={() => removeProject(proj.id)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                    placeholder={t('projectTitlePlaceholder')}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={proj.metrics || ''}
                    onChange={(e) => updateProject(proj.id, 'metrics', e.target.value)}
                    placeholder={t('metricsPlaceholder')}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  value={proj.description}
                  onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                  placeholder={t('projectDescPlaceholder')}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addProject}
              className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus size={14} /> {t('addItem')}
            </button>
          </div>
        )}
      </div>

      {/* SECTION: ACHIEVEMENTS */}
      <div id="editor-section-achievements" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2">
          <button type="button" onClick={() => toggleSection('achievements')} className="flex flex-1 items-center justify-between rounded-lg p-2 text-left hover:bg-slate-100">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-800"><Award size={15} className="text-amber-600" /> {t('achievements')} ({profile.achievements?.length || 0})</span>
            {openSections.achievements ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>{renderSectionTools('achievements')}
        </div>
        {openSections.achievements && (
          <div className="space-y-3 p-4">
            {(profile.achievements || []).map((achievement, index) => (
              <div key={`${index}-${achievement}`} className="flex gap-2">
                <input value={achievement} onChange={(event) => setProfile(prev => ({ ...prev, achievements: (prev.achievements || []).map((item, itemIndex) => itemIndex === index ? event.target.value : item) }))} className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs" placeholder={t('achievementPlaceholder')} />
                <button type="button" title={t('deleteAchievement')} onClick={() => setProfile(prev => ({ ...prev, achievements: (prev.achievements || []).filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            ))}
            <button type="button" onClick={() => setProfile(prev => ({ ...prev, achievements: [...(prev.achievements || []), t('achievementNew')] }))} className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 py-2 text-xs font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600"><Plus size={14} /> {t('addItem')}</button>
          </div>
        )}
      </div>

      {/* SECTION: LANGUAGES */}
      <div id="editor-section-languages" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2">
          <button type="button" onClick={() => toggleSection('languages')} className="flex flex-1 items-center justify-between rounded-lg p-2 text-left hover:bg-slate-100">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-800"><Languages size={15} className="text-blue-600" /> {t('languages')} ({profile.languages.length})</span>
            {openSections.languages ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>{renderSectionTools('languages')}
        </div>
        {openSections.languages && (
          <div className="space-y-2 p-4">
            {profile.languages.map((language, index) => (
              <div key={`${language.name}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input value={language.name} onChange={(event) => setProfile(prev => ({ ...prev, languages: prev.languages.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) }))} className="min-w-0 rounded-lg border border-slate-300 px-2 py-1.5 text-xs" placeholder={t('languagePlaceholder')} />
                <input value={language.level} onChange={(event) => setProfile(prev => ({ ...prev, languages: prev.languages.map((item, itemIndex) => itemIndex === index ? { ...item, level: event.target.value } : item) }))} className="min-w-0 rounded-lg border border-slate-300 px-2 py-1.5 text-xs" placeholder={t('proficiencyPlaceholder')} />
                <button type="button" title={t('deleteLanguage')} onClick={() => setProfile(prev => ({ ...prev, languages: prev.languages.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={13} /></button>
              </div>
            ))}
            <button type="button" onClick={() => setProfile(prev => ({ ...prev, languages: [...prev.languages, { name: '', level: '' }] }))} className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 py-2 text-xs font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600"><Plus size={14} /> {t('addItem')}</button>
          </div>
        )}
      </div>

      {/* SECTION: CERTIFICATIONS */}
      <div id="editor-section-certifications" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2">
          <button type="button" onClick={() => toggleSection('certifications')} className="flex flex-1 items-center justify-between rounded-lg p-2 text-left hover:bg-slate-100">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-800"><Award size={15} className="text-amber-600" /> {t('certifications')} ({profile.certifications?.length || 0})</span>
            {openSections.certifications ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>{renderSectionTools('certifications')}
        </div>
        {openSections.certifications && (
          <div className="space-y-2 p-4">
            {(profile.certifications || []).map((certification, index) => (
              <div key={`${certification.name}-${index}`} className="grid grid-cols-[1fr_1fr_72px_auto] gap-2">
                <input value={certification.name} onChange={(event) => setProfile(prev => ({ ...prev, certifications: (prev.certifications || []).map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) }))} placeholder={t('certificationPlaceholder')} className="min-w-0 rounded-lg border border-slate-300 px-2 py-1.5 text-xs" />
                <input value={certification.issuer} onChange={(event) => setProfile(prev => ({ ...prev, certifications: (prev.certifications || []).map((item, itemIndex) => itemIndex === index ? { ...item, issuer: event.target.value } : item) }))} placeholder={t('issuer')} className="min-w-0 rounded-lg border border-slate-300 px-2 py-1.5 text-xs" />
                <input value={certification.year} onChange={(event) => setProfile(prev => ({ ...prev, certifications: (prev.certifications || []).map((item, itemIndex) => itemIndex === index ? { ...item, year: event.target.value } : item) }))} placeholder={t('year')} className="min-w-0 rounded-lg border border-slate-300 px-2 py-1.5 text-xs" />
                <button type="button" title={t('deleteCertification')} onClick={() => setProfile(prev => ({ ...prev, certifications: (prev.certifications || []).filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={13} /></button>
              </div>
            ))}
            <button type="button" onClick={() => setProfile(prev => ({ ...prev, certifications: [...(prev.certifications || []), { name: '', issuer: '', year: '' }] }))} className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 py-2 text-xs font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600"><Plus size={14} /> {t('certificationAdd')}</button>
          </div>
        )}
      </div>

      {/* ADDITIONAL INPUT */}
      <section className="space-y-3 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">{t('additionalInput')}</h3>
          <p className="mt-1 text-[11px] text-slate-600">{t('additionalTitle')}</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input value={customSectionTitle} onChange={(event) => setCustomSectionTitle(event.target.value)} placeholder={t('additionalTitle')} className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs" />
          <select value={customSectionLayout} onChange={(event) => setCustomSectionLayout(event.target.value as CustomSectionLayout)} className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs">
            <option value="timeline">{t('timeline')}</option>
            <option value="credentials">{t('credentials')}</option>
            <option value="list">{t('customList')}</option>
          </select>
          <button type="button" onClick={() => { addCustomSection(customSectionLayout, customSectionTitle); setCustomSectionTitle(''); }} className="flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"><Plus size={14} /> {t('addItem')}</button>
        </div>
        {(profile.customSections || []).map((section) => (
          <div key={section.id} className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-100 p-2.5">
              <button type="button" onClick={() => toggleSection(section.id)} className="flex flex-1 items-center gap-2 text-left text-xs font-bold text-slate-800">
                {openSections[section.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}{section.title} <span className="font-normal text-slate-400">({section.layoutType})</span>
              </button>
              <VisibilitySwitch
                checked={section.visible}
                onChange={() => updateCustomSection(section.id, { visible: !section.visible })}
                label={section.visible ? t('hideSection') : t('showSection')}
              />
              <button type="button" title={t('deleteItem')} onClick={() => setProfile(prev => ({ ...prev, customSections: (prev.customSections || []).filter(item => item.id !== section.id) }))} className="rounded-md p-1 text-slate-400 hover:text-red-500"><X size={14} /></button>
            </div>
            {openSections[section.id] && (
              <div className="space-y-3 p-3">
                <input value={section.title} onChange={(event) => updateCustomSection(section.id, { title: event.target.value })} className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold" aria-label={t('additionalTitle')} />
                {section.items.map((item) => (
                  <div key={item.id} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <input value={item.title} onChange={(event) => updateCustomItem(section.id, item.id, { title: event.target.value })} placeholder={t('title')} className="rounded-md border border-slate-200 px-2 py-1.5 text-xs" />
                      <input value={item.periodOrYear} onChange={(event) => updateCustomItem(section.id, item.id, { periodOrYear: event.target.value })} placeholder={t('period')} className="rounded-md border border-slate-200 px-2 py-1.5 text-xs" />
                      <input value={item.subtitle} onChange={(event) => updateCustomItem(section.id, item.id, { subtitle: event.target.value })} placeholder={t('issuer')} className="rounded-md border border-slate-200 px-2 py-1.5 text-xs" />
                      <input value={item.link || ''} onChange={(event) => updateCustomItem(section.id, item.id, { link: event.target.value })} placeholder={t('link')} className="rounded-md border border-slate-200 px-2 py-1.5 text-xs" />
                    </div>
                    <textarea value={item.description} onChange={(event) => updateCustomItem(section.id, item.id, { description: event.target.value })} rows={2} placeholder={t('description')} className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs" />
                    <button type="button" onClick={() => updateCustomSection(section.id, { items: section.items.filter(candidate => candidate.id !== item.id) })} className="text-[10px] font-semibold text-red-500 hover:text-red-700">{t('deleteItem')}</button>
                  </div>
                ))}
                <button type="button" onClick={() => updateCustomSection(section.id, { items: [...section.items, { id: `item-${Date.now()}`, title: '', subtitle: '', periodOrYear: '', description: '' }] })} className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-blue-300 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50"><Plus size={13} /> {t('addItem')}</button>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};