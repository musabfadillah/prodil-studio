import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { MasterProfile, CVDesignConfig, LegacySectionKey } from '../types/cv';
import type { CustomSection, SectionKey } from '../types/prodil';
import { useLanguage, type LanguageCode } from '../context/LanguageContext';
import { CV_TEMPLATES } from './TemplateRegistry';
import './cv-templates.css';

const TEMPLATE_CLASS_BY_ID: Record<number, string> = {
  1: 'tpl-2',
  2: 'tpl-12',
  3: 'tpl-5',
  4: 'tpl-7',
  5: 'tpl-8',
  6: 'tpl-4',
  7: 'tpl-9',
  8: 'tpl-3',
  9: 'tpl-1',
  10: 'tpl-6',
  11: 'tpl-11',
  12: 'tpl-14',
  13: 'tpl-15',
  14: 'tpl-10',
  15: 'tpl-13',
};

const SIDEBAR_TEMPLATE_CLASSES = new Set(['tpl-1', 'tpl-3', 'tpl-4', 'tpl-11', 'tpl-14', 'tpl-15']);
const SIDEBAR_SECTION_KEYS = new Set<LegacySectionKey>(['skills', 'languages', 'certifications']);

interface CVRendererProps {
  profile: MasterProfile;
  config: CVDesignConfig;
  onSectionFocus?: (section: LegacySectionKey | 'personal') => void;
}

export const CVRenderer: React.FC<CVRendererProps> = ({ profile, config, onSectionFocus }) => {
  const { language, t } = useLanguage();
  const { personal } = profile;
  const localizedTitles: Record<LanguageCode, Record<LegacySectionKey, string>> = {
    'en-GB': { summary:'Professional Summary', experience:'Work Experience', projects:'Projects & Selected Work', education:'Education', skills:'Core Skills', achievements:'Achievements', objective:'Career Objective', languages:'Languages', certifications:'Certifications' },
    'en-US': { summary:'Professional Summary', experience:'Work Experience', projects:'Projects & Selected Work', education:'Education', skills:'Core Skills', achievements:'Achievements', objective:'Career Objective', languages:'Languages', certifications:'Certifications' },
    'it-IT': { summary:'Profilo professionale', experience:'Esperienza lavorativa', projects:'Progetti', education:'Istruzione', skills:'Competenze', achievements:'Risultati', objective:'Obiettivo professionale', languages:'Lingue', certifications:'Certificazioni' },
    'de-DE': { summary:'Berufliches Profil', experience:'Berufserfahrung', projects:'Projekte', education:'Ausbildung', skills:'Fachkenntnisse', achievements:'Erfolge', objective:'Karriereziel', languages:'Sprachen', certifications:'Zertifizierungen' },
    'id-ID': { summary:'Ringkasan Profesional', experience:'Pengalaman Kerja', projects:'Proyek & Karya', education:'Pendidikan', skills:'Keahlian', achievements:'Pencapaian', objective:'Tujuan Karier', languages:'Bahasa', certifications:'Sertifikasi' },
  };
  const themeId = Math.min(15, Math.max(1, Number(config.themeId) || 1));
  const templateClass = TEMPLATE_CLASS_BY_ID[themeId];
  const hasSidebar = SIDEBAR_TEMPLATE_CLASSES.has(templateClass);
  const isVerticalTemplate = templateClass === 'tpl-14';
  const hasSidebarSections = hasSidebar && !isVerticalTemplate;
  const fontFamily = config.fontFamily || 'Arial, sans-serif';
  const template = CV_TEMPLATES.find((item) => item.id === themeId);
  const activeSummary = profile.summaries.find((item) => item.id === config.activeSummaryId)?.text
    || profile.summaries[0]?.text
    || '';
  const hiddenFields = profile.hiddenFields || {};
  const sectionVisibility = config.visibleSections || profile.visibleSections || {};
  const isVisible = (key: LegacySectionKey) =>
    sectionVisibility[key as SectionKey] !== false && !config.hiddenSections?.includes(key);
  const isFieldVisible = (key: string) => hiddenFields[key] !== true;

  const renderSection = (key: LegacySectionKey, inSidebar = false): ReactNode => {
    let content: ReactNode = null;
    switch (key) {
      case 'summary':
        if (activeSummary) content = <p className="text-body">{activeSummary}</p>;
        break;
      case 'objective':
        if (profile.careerObjective) content = <p className="text-body">{profile.careerObjective}</p>;
        break;
      case 'experience':
        if (profile.experiences.length) content = (
          <div className="cv-entry-list">
            {profile.experiences.map((item) => (
              <article className="exp-block break-inside-avoid" key={item.id}>
                <div className="exp-header">
                  <strong className="exp-title">{item.role}</strong>
                  <span className="exp-date">{item.period || [item.startDate, item.current ? t('present') : item.endDate].filter(Boolean).join(' – ')}</span>
                </div>
                <div className="exp-company">{item.company}{item.location ? ` · ${item.location}` : ''}</div>
                {item.description && (
                  <ul className="text-body">{item.description.split('\n').filter(Boolean).map((line, index) => (
                    <li key={`${item.id}-${index}`}>{line.replace(/^[•\-*]\s*/, '')}</li>
                  ))}</ul>
                )}
              </article>
            ))}
          </div>
        );
        break;
      case 'projects':
        if (profile.projects.length) content = (
          <div className="cv-entry-list">
            {profile.projects.map((item) => (
              <article className="exp-block break-inside-avoid" key={item.id}>
                <div className="exp-header"><strong className="exp-title">{item.title}</strong><span className="exp-date">{item.metrics}</span></div>
                <div className="exp-company">{item.role}{item.client || item.clientOrBrand ? ` · ${item.client || item.clientOrBrand}` : ''}</div>
                <p className="text-body">{item.description}</p>
                {item.link && <a href={item.link}>{item.link.replace(/^https?:\/\//, '')}</a>}
              </article>
            ))}
          </div>
        );
        break;
      case 'education':
        if (profile.educations.length) content = (
          <div className="cv-entry-list">
            {profile.educations.map((item) => (
              <article className="edu-block break-inside-avoid" key={item.id}>
                <div className="exp-header">
                  <strong className="exp-title">{item.degree}</strong>
                  <span className="exp-date">{item.period || [item.startDate, item.endDate].filter(Boolean).join(' – ')}</span>
                </div>
                <div className="exp-company">{item.institution}{item.location ? ` · ${item.location}` : ''}</div>
                {(item.gpa || item.achievements) && <p className="text-body">{[item.gpa && `${t('gpaLabel')}: ${item.gpa}`, item.achievements].filter(Boolean).join(' · ')}</p>}
              </article>
            ))}
          </div>
        );
        break;
      case 'skills':
        if (profile.skills.length) content = <div className="skill-list">{profile.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>;
        break;
      case 'languages':
        if (profile.languages.length) content = (
          <div className="skill-list">{profile.languages.map((language, index) => (
            <span key={`${language.name}-${index}`}>{language.name}{language.level ? ` · ${language.level}` : ''}</span>
          ))}</div>
        );
        break;
      case 'certifications':
        if (profile.certifications?.length) content = (
          <div className="cv-entry-list">{profile.certifications.map((item, index) => (
            <article className="edu-block break-inside-avoid" key={`${item.name}-${index}`}>
              <div className="exp-header"><strong className="exp-title">{item.name}</strong><span className="exp-date">{item.year}</span></div>
              <div className="exp-company">{item.issuer}</div>
            </article>
          ))}</div>
        );
        break;
      case 'achievements':
        if (profile.achievements?.length) content = <ul className="text-body">{profile.achievements.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>;
        break;
    }

    if (!content || !isVisible(key)) return null;
    return (
      <section className={`cv-section cv-section-${key}`} key={key}>
        <h2
          role={onSectionFocus ? 'button' : undefined}
          onClick={() => onSectionFocus?.(key)}
          className={`${inSidebar ? 'section-head' : 'main-section-head'}${onSectionFocus ? ' cursor-pointer' : ''}`}
        >
          {localizedTitles[language][key]}
        </h2>
        {content}
      </section>
    );
  };

  const customSections = (profile.customSections || []).filter((section) => section.visible);
  const order = config.sectionOrder?.length
    ? config.sectionOrder
    : ['summary', 'experience', 'projects', 'education', 'skills', 'languages', 'certifications'] as LegacySectionKey[];
  const orderedSections = order
    .filter((key) => !hasSidebarSections || !SIDEBAR_SECTION_KEYS.has(key))
    .map((key) => renderSection(key, false))
    .filter(Boolean);
  const sidebarSections = hasSidebarSections
    ? order.filter((key) => SIDEBAR_SECTION_KEYS.has(key)).map((key) => renderSection(key, true)).filter(Boolean)
    : [];

  const renderCustomSection = (section: CustomSection) => (
    <section
      className={`cv-section cv-custom-section cv-custom-${section.layoutType} custom-${section.layoutType}`}
      key={section.id}
      onClick={() => onSectionFocus?.('objective')}
    >
      <h2 className="main-section-head">{section.title || t('additionalInput')}</h2>
      <div className="cv-entry-list">
        {section.items.map((item) => (
          <article className={`exp-block break-inside-avoid ${section.layoutType === 'credentials' ? 'edu-block' : ''}`} key={item.id}>
            <div className="exp-header">
              <strong className="exp-title">{item.title}</strong>
              <span className="exp-date">{item.periodOrYear}</span>
            </div>
            {item.subtitle && <div className="exp-company">{item.subtitle}</div>}
            {item.description && <p className="text-body">{item.description}</p>}
            {item.link && <a href={item.link}>{item.link.replace(/^https?:\/\//, '')}</a>}
          </article>
        ))}
      </div>
    </section>
  );

  const contactItems = [
    isFieldVisible('location') && personal.location,
    personal.phone,
    personal.email,
    isFieldVisible('website') && personal.website,
    isFieldVisible('socials') && personal.socials?.map((social) => `${social.platform}: ${social.url.replace(/^https?:\/\//, '')}`).join(' · '),
  ].filter(Boolean);
  const showPhoto = config.showPhoto && template?.hasPhoto !== false && isFieldVisible('photo');
  const photoAlt = t('profilePhotoAlt').replace('{name}', personal.fullName);
  const renderPhoto = (className: 'cv-photo-box' | 'cv-header-photo') =>
    showPhoto && personal.photoUrl ? (
      <div className={className}>
        <img src={personal.photoUrl} alt={photoAlt} />
      </div>
    ) : null;
  const renderContactItems = () => contactItems.map((item, index) => <span key={`${item}-${index}`}>{item}</span>);
  const verticalName = personal.fullName.trim().split(/\s+/);
  const mainClass = templateClass === 'tpl-6'
    ? 'cv-body-split'
    : hasSidebar
      ? 'cv-main'
      : 'cv-body';

  const sidebar = hasSidebar ? (
    <aside className="cv-sidebar">
      {isVerticalTemplate ? (
        <div className="vert-title" aria-label={personal.fullName}>
          <span>{verticalName[0] || ''}</span>{verticalName.length > 1 && <> <span>{verticalName.slice(1).join(' ')}</span></>}
        </div>
      ) : (
        <>
          {renderPhoto('cv-photo-box')}
          <div className="cv-sidebar-profile" onClick={() => onSectionFocus?.('personal')}>
            <h1 className="main-title">{personal.fullName}</h1>
            {personal.headline && <p className="sub-title">{personal.headline}</p>}
          </div>
          <section className="sidebar-contact-section">
            <h2 className="section-head">{t('contact')}</h2>
            <div className="sidebar-contact">{renderContactItems()}</div>
          </section>
          {sidebarSections}
        </>
      )}
    </aside>
  ) : null;

  const header = !hasSidebar && !isVerticalTemplate ? (
    <div className="cv-header" onClick={() => onSectionFocus?.('personal')}>
      {renderPhoto('cv-header-photo')}
      <div className="cv-header-copy">
        <h1 className="main-title">
          {personal.fullName}
          {templateClass === 'tpl-13' && <span className="specialist-badge">{t('specialist')}</span>}
        </h1>
        {personal.headline && <p className="sub-title">{personal.headline}</p>}
      </div>
      <div className="header-contact">{renderContactItems()}</div>
    </div>
  ) : null;

  const main = (
    <div className={mainClass}>
      {isVerticalTemplate && <div className="header-contact-vert">{renderContactItems()}</div>}
      {orderedSections}
      {customSections.map(renderCustomSection)}
    </div>
  );
  const style = {
    '--tpl-accent': config.accentColor || undefined,
    fontFamily,
  } as CSSProperties;

  return (
    <div className="cv-paper-root printable-document" style={style}>
      <div className={`cv-page ${hasSidebar ? '' : 'cv-page-col1'} ${templateClass}`}>
        {templateClass === 'tpl-11'
          ? <>{main}{sidebar}</>
          : hasSidebar
            ? <>{sidebar}{main}</>
            : <>{header}{main}</>}
      </div>
    </div>
  );
};
