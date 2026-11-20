import React, { useState } from 'react';
import { MasterProfile, CVDesignConfig } from '../types/cv';
import { CV_TEMPLATES } from '../templates/TemplateRegistry';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Upload,
  Download,
  Palette,
  Type,
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Code2,
  Languages,
  Award,
  Check
} from 'lucide-react';

interface FormEditorProps {
  profile: MasterProfile;
  setProfile: React.Dispatch<React.SetStateAction<MasterProfile>>;
  config: CVDesignConfig;
  setConfig: React.Dispatch<React.SetStateAction<CVDesignConfig>>;
  onOpenAiAssistant: (type: 'summary' | 'bullets', initialRole?: string, initialText?: string) => void;
  onOpenSmartImport: () => void;
  onExportJson: () => void;
  onImportJsonFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormEditor: React.FC<FormEditorProps> = ({
  profile,
  setProfile,
  config,
  setConfig,
  onOpenAiAssistant,
  onOpenSmartImport,
  onExportJson,
  onImportJsonFile,
}) => {
  // Accordion open/close states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    education: false,
    projects: false,
    skills: false,
    languages: false,
  });

  const toggleSection = (sec: string) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
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
    { label: 'Plus Jakarta Sans (Modern Clean)', value: 'Plus Jakarta Sans' },
    { label: 'Inter (High ATS Readability)', value: 'Inter' },
    { label: 'Merriweather (Ivy League Classic Serif)', value: 'Merriweather' },
    { label: 'JetBrains Mono (Tech Terminal Monospace)', value: 'JetBrains Mono' },
  ];

  // Helper for personal details change
  const handlePersonalChange = (field: keyof typeof profile.personal, val: any) => {
    setProfile(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: val }
    }));
  };

  // Experiences handlers
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

  // Education handlers
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

  // Project handlers
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
            <Palette size={14} className="text-blue-600" /> Template & Gaya Desain
          </h3>
          <span className="text-[11px] font-bold text-blue-600">Template #{config.themeId} Aktif</span>
        </div>

        {/* Template Selector Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Pilih Desain CV (15 Tema Pilihan)
          </label>
          <select
            value={config.themeId}
            onChange={(e) => setConfig(prev => ({ ...prev, themeId: parseInt(e.target.value) }))}
            className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {CV_TEMPLATES.map(t => (
              <option key={t.id} value={t.id}>
                #{t.id} {t.name} ({t.category})
              </option>
            ))}
          </select>
        </div>

        {/* Color Palette & Font Family */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Warna Aksen</label>
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
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Font Keluarga</label>
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

        {/* Photo toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-700">Tampilkan Foto Profil</span>
          <input
            type="checkbox"
            checked={config.showPhoto}
            onChange={(e) => setConfig(prev => ({ ...prev, showPhoto: e.target.checked }))}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 2. DATA MANAGEMENT (BACKUP & IMPORT) */}
      <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onExportJson}
            title="Download file backup JSON"
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs"
          >
            <Download size={13} /> Backup Data
          </button>
          <label className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs cursor-pointer">
            <Upload size={13} /> Import Data
            <input type="file" accept=".json" onChange={onImportJsonFile} className="hidden" />
          </label>
        </div>

        <button
          onClick={onOpenSmartImport}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold text-white flex items-center gap-1.5 shadow-xs"
        >
          <Sparkles size={13} /> Smart Import (PDF/DOCX)
        </button>
      </div>

      {/* 3. AI ASSISTANT CARD */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">AI Assistant (Gemini API)</h4>
            <p className="text-[11px] text-slate-600">Buat Summary & Poin Pengalaman dengan standar Google XYZ</p>
          </div>
        </div>
        <button
          onClick={() => onOpenAiAssistant('summary', profile.personal.headline)}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-600 font-bold text-xs transition-all shadow-xs"
        >
          Buka AI
        </button>
      </div>

      {/* 4. FORM ACCORDIONS */}

      {/* SECTION: PERSONAL DETAILS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('personal')}
          className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
            <User size={15} className="text-blue-600" /> Data Diri & Kontak
          </span>
          {openSections.personal ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.personal && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={profile.personal.fullName}
                  onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Headline Profesi</label>
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
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile.personal.email}
                  onChange={(e) => handlePersonalChange('email', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nomor Telepon/WA</label>
                <input
                  type="text"
                  value={profile.personal.phone}
                  onChange={(e) => handlePersonalChange('phone', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Domisili / Lokasi</label>
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
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Website / Portfolio Link</label>
                <input
                  type="text"
                  value={profile.personal.website}
                  onChange={(e) => handlePersonalChange('website', e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">URL Foto Profil</label>
                <input
                  type="text"
                  value={profile.personal.photoUrl}
                  onChange={(e) => handlePersonalChange('photoUrl', e.target.value)}
                  placeholder="https://images.unsplash..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION: PROFESSIONAL SUMMARY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('summary')}
          className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
            <Sparkles size={15} className="text-amber-500" /> Professional Summary
          </span>
          {openSections.summary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.summary && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600">Ringkasan Diri (3-4 Kalimat Ramah ATS)</span>
              <button
                type="button"
                onClick={() => onOpenAiAssistant('summary', profile.personal.headline)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Sparkles size={12} /> Tulis / Perbaiki dengan AI
              </button>
            </div>
            <textarea
              rows={4}
              value={profile.summaries[0]?.text || ''}
              onChange={(e) => {
                const updated = [...profile.summaries];
                if (updated[0]) {
                  updated[0].text = e.target.value;
                } else {
                  updated.push({ id: 'sum-1', label: 'Main', text: e.target.value });
                }
                setProfile(prev => ({ ...prev, summaries: updated }));
              }}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* SECTION: WORK EXPERIENCE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('experience')}
          className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
            <Briefcase size={15} className="text-blue-600" /> Pengalaman Kerja ({profile.experiences.length})
          </span>
          {openSections.experience ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.experience && (
          <div className="p-4 space-y-4">
            {profile.experiences.map((exp, idx) => (
              <div key={exp.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">#{idx + 1} {exp.role || 'Jabatan'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenAiAssistant('bullets', exp.role, exp.description)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Sparkles size={11} /> AI Optimize
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                    placeholder="Jabatan / Posisi"
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    placeholder="Nama Perusahaan"
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                    placeholder="Lokasi"
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                    placeholder="Mulai (e.g. Jan 2022)"
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                    placeholder="Selesai (e.g. Present)"
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Poin Pencapaian (Gunakan Bullet Points)
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
              <Plus size={14} /> Tambah Pengalaman Kerja
            </button>
          </div>
        )}
      </div>

      {/* SECTION: EDUCATION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('education')}
          className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
            <GraduationCap size={15} className="text-emerald-600" /> Riwayat Pendidikan ({profile.educations.length})
          </span>
          {openSections.education ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

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
                    placeholder="Gelar / Jurusan"
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    placeholder="Nama Universitas / Sekolah"
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                    placeholder="Tahun Mulai"
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                    placeholder="Tahun Lulus"
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={edu.gpa}
                    onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                    placeholder="IPK / GPA"
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
              <Plus size={14} /> Tambah Pendidikan
            </button>
          </div>
        )}
      </div>

      {/* SECTION: SKILLS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('skills')}
          className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
            <Code2 size={15} className="text-blue-600" /> Keahlian / Skills ({profile.skills.length})
          </span>
          {openSections.skills ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.skills && (
          <div className="p-4 space-y-3">
            <label className="block text-[11px] font-semibold text-slate-600">
              Pisahkan keahlian dengan koma (e.g. React, TypeScript, Figma, PostgreSQL)
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
          </div>
        )}
      </div>

      {/* SECTION: PROJECTS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('projects')}
          className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
            <FolderGit2 size={15} className="text-indigo-600" /> Proyek Unggulan ({profile.projects.length})
          </span>
          {openSections.projects ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

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
                    placeholder="Judul Proyek"
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={proj.metrics || ''}
                    onChange={(e) => updateProject(proj.id, 'metrics', e.target.value)}
                    placeholder="Metrik Hasil (e.g. 50K Users)"
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  value={proj.description}
                  onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                  placeholder="Deskripsi singkat peran & teknologi..."
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addProject}
              className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus size={14} /> Tambah Proyek Portofolio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
