import React, { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import type { MasterProfile } from '../types/cv';
import { CV_TEMPLATES } from '../templates/TemplateRegistry';
import { initialCVDesignConfig, johnSmithProfile } from '../data/initialProfile';
import { useLanguage } from '../context/LanguageContext';
import { ScaledCVThumbnail } from './ScaledCVThumbnail';

export type TemplateCategory = 'All (15)' | 'ATS & Corporate' | 'Creative & Photo' | 'Dark & Modern' | 'Minimal & No-Photo';

const categories: TemplateCategory[] = ['All (15)', 'ATS & Corporate', 'Creative & Photo', 'Dark & Modern', 'Minimal & No-Photo'];

const categoryFor = (id: number): Exclude<TemplateCategory, 'All (15)'> => {
  if ([1, 2, 3, 4, 5].includes(id)) return 'ATS & Corporate';
  if ([6, 7, 9, 11].includes(id)) return 'Creative & Photo';
  if ([8, 13, 15].includes(id)) return 'Dark & Modern';
  return 'Minimal & No-Photo';
};

interface CVTemplateThumbnailProps {
  profile: MasterProfile;
  themeId: number;
  className?: string;
}

export const CVTemplateThumbnail: React.FC<CVTemplateThumbnailProps> = ({ profile, themeId, className }) => {
  const template = CV_TEMPLATES.find((item) => item.id === themeId) || CV_TEMPLATES[0];
  const config = {
    ...initialCVDesignConfig,
    themeId,
    accentColor: template.previewColor,
    activeSummaryId: profile.summaries[0]?.id || '',
  };

  return <ScaledCVThumbnail profile={profile} config={config} className={`rounded-sm shadow-md ${className || ''}`} />;
};

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: number) => void;
  activeTemplateId: number;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  activeTemplateId,
}) => {
  const { t, templateName, templateDescription, templateBadge } = useLanguage();
  const [category, setCategory] = useState<TemplateCategory>('All (15)');
  if (!isOpen) return null;

  const templates = category === 'All (15)'
    ? CV_TEMPLATES
    : CV_TEMPLATES.filter((template) => categoryFor(template.id) === category);

  return (
    <div className="modal-overlay no-print fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="template-gallery-title" className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-slate-50 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-blue-600">Prodil Studio · {t('templates')}</p>
            <h2 id="template-gallery-title" className="mt-1 text-xl font-extrabold text-slate-900">{t('templateGallery')}</h2>
            <p className="mt-1 text-xs text-slate-500">{t('catalogSubtitle')}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t('closeTemplateGallery')} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            <X size={18} />
          </button>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-5 py-3 sm:px-7" aria-label={t('templateCategories')}>
          {categories.map((item) => (
            <button type="button" key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${category === item ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}>
              {item === 'All (15)' ? t('all15') : item === 'ATS & Corporate' ? t('atsCorporate') : item === 'Creative & Photo' ? t('creativePhoto') : item === 'Dark & Modern' ? t('darkModern') : t('minimalPhoto')}
            </button>
          ))}
        </nav>
        <div className="overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((template) => (
              <article key={template.id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${activeTemplateId === template.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between gap-2 px-3.5 py-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900">#{template.id} {templateName(template.id)}</p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {categoryFor(template.id) === 'ATS & Corporate' ? t('atsCorporate')
                        : categoryFor(template.id) === 'Creative & Photo' ? t('creativePhoto')
                          : categoryFor(template.id) === 'Dark & Modern' ? t('darkModern')
                            : t('minimalPhoto')}
                    </p>
                  </div>
                  {activeTemplateId === template.id && <Check size={16} className="shrink-0 text-blue-600" />}
                </div>
                <div className="flex h-32 justify-center overflow-hidden bg-slate-100">
                  <div className="w-full overflow-hidden rounded-sm shadow-md">
                    <CVTemplateThumbnail profile={johnSmithProfile} themeId={template.id} />
                  </div>
                </div>
                <div className="p-3.5">
                  <p className="line-clamp-1 text-[10px] leading-relaxed text-slate-700">{templateDescription(template.id)}</p>
                  <button type="button" onClick={() => onSelectTemplate(template.id)} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-800">
                    {t('useTemplate')} <ArrowRight size={13} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
