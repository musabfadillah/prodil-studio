import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, FileDown, Layers, ShieldCheck, Sparkles, Upload, X } from 'lucide-react';
import type { TemplateCategory } from './TemplatesModal';
import { CVTemplateThumbnail } from './TemplatesModal';
import { johnSmithProfile } from '../data/initialProfile';
import { CV_TEMPLATES } from '../templates/TemplateRegistry';
import { useLanguage } from '../context/LanguageContext';

interface LandingPageProps {
  selectedTemplateId?: number;
  onSelectTemplate?: (templateId: number) => void;
  onStartEditing: (templateId?: number) => void;
  onOpenSmartImport: () => void;
}

const categories: TemplateCategory[] = ['All (15)', 'ATS & Corporate', 'Creative & Photo', 'Dark & Modern', 'Minimal & No-Photo'];

const templateCategory = (id: number): Exclude<TemplateCategory, 'All (15)'> => {
  if ([1, 2, 3, 4, 5].includes(id)) return 'ATS & Corporate';
  if ([6, 7, 9, 11].includes(id)) return 'Creative & Photo';
  if ([8, 13, 15].includes(id)) return 'Dark & Modern';
  return 'Minimal & No-Photo';
};

export const LandingPage: React.FC<LandingPageProps> = ({
  selectedTemplateId,
  onSelectTemplate,
  onStartEditing,
  onOpenSmartImport,
}) => {
  const { t, templateName, templateDescription, templateBadge, templateRole } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('All (15)');
  const [heroTemplateId, setHeroTemplateId] = useState<number>(selectedTemplateId || 1);
  const [previewTemplateId, setPreviewTemplateId] = useState<number | null>(null);

  React.useEffect(() => {
    if (selectedTemplateId) {
      setHeroTemplateId(selectedTemplateId);
    }
  }, [selectedTemplateId]);

  const filteredTemplates = useMemo(
    () => selectedCategory === 'All (15)'
      ? CV_TEMPLATES
      : CV_TEMPLATES.filter((template) => templateCategory(template.id) === selectedCategory),
    [selectedCategory],
  );
  const heroTemplate = CV_TEMPLATES.find((template) => template.id === heroTemplateId) || CV_TEMPLATES[0];

  const handleCycleHeroTemplate = () => {
    const nextId = (heroTemplateId % CV_TEMPLATES.length) + 1;
    setHeroTemplateId(nextId);
    onSelectTemplate?.(nextId);
  };

  const handleUseTemplate = (templateId: number) => {
    setHeroTemplateId(templateId);
    onSelectTemplate?.(templateId);
    onStartEditing(templateId);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#F4F7FC] bg-grid-slate text-slate-900">
      <section className="relative overflow-hidden py-12 lg:py-20">
        <div className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-[34rem] w-[58rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-200/50 via-cyan-100/40 to-transparent blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-800">
              <Sparkles size={14} className="text-blue-600" />
              <span>{t('heroBadge')}</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="mx-auto max-w-3xl text-4xl font-black leading-tight tracking-tight text-[#06113C] sm:text-5xl lg:mx-0 lg:text-6xl"
            >
              {t('heroTitle')} <span className="text-blue-600">{t('heroAccent')}</span>
            </motion.h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0">
              {t('heroSubtitle')}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <button
                type="button"
                onClick={() => handleUseTemplate(heroTemplateId)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-blue-800 sm:w-auto"
              >
                {t('start')} <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={onOpenSmartImport}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:w-auto"
              >
                <Upload size={16} className="text-blue-600" /> {t('smartImport')}
              </button>
            </div>
            <div className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500 lg:justify-start">
              {[t('vectorPdf'), t('footerTemplate'), t('atsChecklist')].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-500" />{item}</span>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: .25 }}
            transition={{ duration: .6 }}
            className="mx-auto w-full max-w-[410px]"
          >
            <div className="group relative rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_32px_90px_-40px_rgba(37,99,235,.42)] backdrop-blur-xl transition-transform duration-500 hover:[transform:perspective(1100px)_rotateY(-4deg)_rotateX(2deg)] sm:p-7">
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  <ShieldCheck size={12} /> {t('atsReady')}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">{t('templateGallery').replace('(1–15)','')} #{heroTemplate.id}</span>
              </div>
              <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-md border border-slate-200 shadow-xl">
                <CVTemplateThumbnail profile={johnSmithProfile} themeId={heroTemplate.id} />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{templateName(heroTemplate.id)}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{t('previewJohn')}</p>
                </div>
                <button
                  type="button"
                  title={t('changeTheme')}
                  aria-label={t('changeTheme')}
                  onClick={handleCycleHeroTemplate}
                  className="shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-600 hover:text-white"
                >
                  {t('changeTheme')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/80 bg-white/70 py-16 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div className="mx-auto mb-11 max-w-2xl text-center" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{t('whyChoose')}</h2>
            <p className="mt-2 text-sm text-slate-600">{t('whySubtitle')}</p>
          </motion.div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: FileDown, title: t('vectorPdf'), text: t('vectorPdfText') },
              { icon: Sparkles, title: t('aiAssistant'), text: t('aiAssistantText') },
              { icon: Layers, title: t('masterProfileFeature'), text: t('masterProfileFeatureText') },
              { icon: ShieldCheck, title: t('secureManaged'), text: t('secureManagedText') },
            ].map(({ icon: Icon, title, text }) => (
              <motion.article key={title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-white bg-white/80 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-card">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600"><Icon size={20} /></div>
                <h3 className="mb-2 text-base font-bold text-slate-900">{title}</h3>
                <p className="text-xs leading-relaxed text-slate-600">{text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">{t('collection')}</div>
            <h2 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">{t('catalogTitle')}</h2>
            <p className="mt-1 text-sm text-slate-700">{t('catalogSubtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-200/60 p-1">
            {categories.map((category) => (
              <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${selectedCategory === category ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-slate-700 hover:bg-white/70 hover:text-slate-950'}`}>
                {category === 'All (15)' ? t('all15') : category === 'ATS & Corporate' ? t('atsCorporate') : category === 'Creative & Photo' ? t('creativePhoto') : category === 'Dark & Modern' ? t('darkModern') : t('minimalPhoto')}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates.map((template, index) => (
            <motion.article
              key={template.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: .08 }}
              transition={{ duration: .35, delay: Math.min(index % 4, 3) * .04 }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-card"
            >
              <div className="flex min-h-[48px] items-start justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <span className="text-xs font-bold text-slate-900">#{template.id} {templateName(template.id)}</span>
                <span className="shrink-0 rounded-full border border-blue-300 bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-800">{templateBadge(template.id)}</span>
              </div>
              <div className="flex h-32 justify-center overflow-hidden bg-slate-100 transition-colors group-hover:bg-blue-50/60">
                <div className="w-full overflow-hidden rounded-sm shadow-md transition-transform duration-300 group-hover:scale-[1.02]">
                  <CVTemplateThumbnail profile={johnSmithProfile} themeId={template.id} className="mx-auto" />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-3.5">
                <p className="line-clamp-1 text-[11px] leading-relaxed text-slate-700">{templateDescription(template.id)}</p>
                <p className="mt-1 line-clamp-1 text-[10px] text-slate-600"><strong>{t('suitableFor')}:</strong> {templateRole(template.id)}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHeroTemplateId(template.id);
                      onSelectTemplate?.(template.id);
                      setPreviewTemplateId(template.id);
                    }}
                    className="flex items-center justify-center rounded-lg border border-slate-300 bg-white px-2 py-2 text-[11px] font-bold text-slate-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800"
                  >
                    {t('quickPreview')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseTemplate(template.id)}
                    className="flex items-center justify-center gap-1 rounded-lg bg-blue-700 px-2 py-2 text-[11px] font-bold text-white transition-colors hover:bg-blue-800"
                  >
                    {t('useTemplate')} <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
      <section className="bg-blue-600 py-16 text-center text-white">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl font-extrabold tracking-tight">{t('closingTitle')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-blue-100">{t('closingSubtitle')}</p>
          <button
            type="button"
            onClick={() => handleUseTemplate(selectedTemplateId || 1)}
            className="mt-8 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-blue-600 shadow-lg transition-colors hover:bg-blue-50"
          >
            {t('openEditor')}
          </button>
        </div>
      </section>
      {previewTemplateId !== null && (
        <div
          className="no-print fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreviewTemplateId(null);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="template-preview-title" className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">{t('quickPreview')}</p>
                <h2 id="template-preview-title" className="mt-1 text-lg font-extrabold text-slate-950">
                  #{previewTemplateId} {templateName(previewTemplateId)}
                </h2>
                <p className="mt-1 text-xs text-slate-600">{templateDescription(previewTemplateId)}</p>
              </div>
              <button type="button" onClick={() => setPreviewTemplateId(null)} aria-label={t('close')} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-950">
                <X size={17} />
              </button>
            </header>
            <div className="overflow-y-auto bg-slate-100 p-4">
              <div className="mx-auto max-w-[320px] overflow-hidden rounded-sm shadow-lg">
                <CVTemplateThumbnail profile={johnSmithProfile} themeId={previewTemplateId} />
              </div>
            </div>
            <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3">
              <p className="text-xs text-slate-600"><strong className="text-slate-900">{t('suitableFor')}:</strong> {templateRole(previewTemplateId)}</p>
              <button
                type="button"
                onClick={() => handleUseTemplate(previewTemplateId)}
                className="shrink-0 rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800"
              >
                {t('useTemplate')} <ArrowRight size={13} className="ml-1 inline" />
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
};