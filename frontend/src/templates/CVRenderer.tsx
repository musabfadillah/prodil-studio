import React from 'react';
import { MasterProfile, CVDesignConfig } from '../types/cv';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, ExternalLink } from 'lucide-react';

interface CVRendererProps {
  profile: MasterProfile;
  config: CVDesignConfig;
}

export const CVRenderer: React.FC<CVRendererProps> = ({ profile, config }) => {
  const { personal, summaries, experiences, educations, projects, skills, languages, certifications } = profile;
  const activeSummary = summaries.find(s => s.id === config.activeSummaryId)?.text || summaries[0]?.text || '';
  const accent = config.accentColor || '#2563eb';
  const fontClass = config.fontFamily === 'Merriweather' ? 'font-serif' : config.fontFamily === 'JetBrains Mono' ? 'font-mono' : 'font-sans';

  // Helper for bullet points splitting
  const renderBullets = (text: string) => {
    const lines = text.split('\n').filter(Boolean);
    return (
      <ul className="space-y-1 mt-1 text-[13px] leading-relaxed text-slate-700">
        {lines.map((line, idx) => {
          const cleaned = line.replace(/^[•\-\*]\s*/, '');
          return (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-slate-400 mt-1 select-none">•</span>
              <span>{cleaned}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  // -------------------------------------------------------------
  // TEMPLATE 1: ATS Classic Professional (Single Column, Strict ATS)
  // -------------------------------------------------------------
  if (config.themeId === 1) {
    return (
      <div className={`p-8 bg-white text-slate-900 ${fontClass} leading-normal`}>
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4 text-center">
          <h1 className="text-3xl font-bold uppercase tracking-wider text-slate-900">{personal.fullName}</h1>
          <p className="text-base font-semibold text-slate-700 mt-1 uppercase tracking-wide">{personal.headline}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-2">
            {personal.location && <span>{personal.location}</span>}
            {personal.phone && <span>• {personal.phone}</span>}
            {personal.email && <span>• {personal.email}</span>}
            {personal.website && <span>• {personal.website}</span>}
            {personal.socials?.map((s, i) => (
              <span key={i}>• {s.platform}: {s.url.replace(/^https?:\/\//, '')}</span>
            ))}
          </div>
        </div>

        {/* Summary */}
        {activeSummary && (
          <div className="mt-4 cv-section">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-2">
              Professional Summary
            </h2>
            <p className="text-[13px] text-slate-700 leading-relaxed text-justify">{activeSummary}</p>
          </div>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <div className="mt-4 cv-section">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-2">
              Professional Experience
            </h2>
            <div className="space-y-3">
              {experiences.map((exp) => (
                <div key={exp.id} className="cv-item">
                  <div className="flex justify-between items-baseline text-[13.5px]">
                    <span className="font-bold text-slate-900">{exp.role}</span>
                    <span className="text-xs text-slate-600 font-medium">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs text-slate-700 italic">
                    <span>{exp.company}</span>
                    <span>{exp.location}</span>
                  </div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {educations.length > 0 && (
          <div className="mt-4 cv-section">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-2">
              Education
            </h2>
            <div className="space-y-2">
              {educations.map((edu) => (
                <div key={edu.id} className="cv-item">
                  <div className="flex justify-between items-baseline text-[13.5px]">
                    <span className="font-bold text-slate-900">{edu.degree}</span>
                    <span className="text-xs text-slate-600">{edu.startDate} – {edu.endDate}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-700">
                    <span>{edu.institution}, {edu.location}</span>
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  </div>
                  {edu.achievements && <p className="text-xs text-slate-600 mt-0.5">{edu.achievements}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Languages */}
        <div className="mt-4 grid grid-cols-2 gap-4 cv-section">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-2">
              Key Skills
            </h2>
            <p className="text-[12.5px] text-slate-700 leading-relaxed">
              {skills.join(' • ')}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-2">
              Languages
            </h2>
            <div className="text-[12.5px] text-slate-700 space-y-0.5">
              {languages.map((l, i) => (
                <div key={i}>{l.name} ({l.level})</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 2: ATS Executive Clean (Corporate Header with Border)
  // -------------------------------------------------------------
  if (config.themeId === 2) {
    return (
      <div className={`p-8 bg-white text-slate-900 ${fontClass}`}>
        <div className="flex justify-between items-start border-b-2 pb-4" style={{ borderColor: accent }}>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 uppercase">{personal.fullName}</h1>
            <p className="text-base font-semibold mt-0.5" style={{ color: accent }}>{personal.headline}</p>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-0.5">
            <div>{personal.location}</div>
            <div>{personal.phone}</div>
            <div>{personal.email}</div>
            {personal.website && <div className="text-blue-600">{personal.website}</div>}
          </div>
        </div>

        {activeSummary && (
          <div className="mt-4 cv-section">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 border-b pb-1 mb-2" style={{ borderBottomColor: accent }}>
              Executive Profile
            </h3>
            <p className="text-[13px] text-slate-700 leading-relaxed">{activeSummary}</p>
          </div>
        )}

        {experiences.length > 0 && (
          <div className="mt-4 cv-section">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 border-b pb-1 mb-2" style={{ borderBottomColor: accent }}>
              Professional Experience
            </h3>
            <div className="space-y-3">
              {experiences.map(exp => (
                <div key={exp.id} className="cv-item">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-sm text-slate-900">{exp.role}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded text-white" style={{ backgroundColor: accent }}>
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-600 mb-1">{exp.company} • {exp.location}</div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          </div>
        )}

        {educations.length > 0 && (
          <div className="mt-4 cv-section">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 border-b pb-1 mb-2" style={{ borderBottomColor: accent }}>
              Education & Credentials
            </h3>
            <div className="space-y-2">
              {educations.map(edu => (
                <div key={edu.id} className="cv-item flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree}</span> — {edu.institution}
                  </div>
                  <span className="text-slate-600">{edu.startDate} – {edu.endDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <div className="mt-4 cv-section">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 border-b pb-1 mb-2" style={{ borderBottomColor: accent }}>
              Core Competencies
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {skills.map((s, i) => (
                <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 3: Corporate Letterhead (No Photo)
  // -------------------------------------------------------------
  if (config.themeId === 3) {
    return (
      <div className={`p-8 bg-white text-slate-900 ${fontClass}`}>
        <div className="text-center pb-4 mb-4 border-b border-t-4 py-4" style={{ borderTopColor: accent, borderBottomColor: '#e2e8f0' }}>
          <h1 className="text-3xl font-extrabold tracking-widest uppercase text-slate-900">{personal.fullName}</h1>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-600 mt-1">{personal.headline}</p>
          <div className="text-xs text-slate-500 mt-2 flex justify-center gap-3">
            <span>{personal.location}</span>
            <span>•</span>
            <span>{personal.phone}</span>
            <span>•</span>
            <span>{personal.email}</span>
          </div>
        </div>

        {activeSummary && (
          <div className="mb-4 cv-section">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-1.5 pb-0.5 border-b-2 border-slate-900">
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-slate-700">{activeSummary}</p>
          </div>
        )}

        <div className="mb-4 cv-section">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2 pb-0.5 border-b-2 border-slate-900">
            Work Experience
          </h2>
          <div className="space-y-3">
            {experiences.map(exp => (
              <div key={exp.id} className="cv-item">
                <div className="flex justify-between text-xs font-bold text-slate-900">
                  <span>{exp.role.toUpperCase()}</span>
                  <span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="text-xs italic text-slate-600 mb-1">{exp.company}, {exp.location}</div>
                {renderBullets(exp.description)}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 cv-section">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2 pb-0.5 border-b-2 border-slate-900">
              Education
            </h2>
            {educations.map(edu => (
              <div key={edu.id} className="text-xs mb-2">
                <div className="font-bold text-slate-900">{edu.degree}</div>
                <div className="text-slate-600">{edu.institution} ({edu.startDate} - {edu.endDate})</div>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2 pb-0.5 border-b-2 border-slate-900">
              Skills
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">{skills.join(', ')}</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 4: Emerald Corporate Minimal
  // -------------------------------------------------------------
  if (config.themeId === 4) {
    const emeraldAccent = '#059669';
    return (
      <div className={`p-8 bg-white text-slate-900 ${fontClass}`}>
        <div className="flex items-center gap-5 border-b pb-4 mb-4" style={{ borderColor: '#d1fae5' }}>
          {config.showPhoto && personal.photoUrl && (
            <img src={personal.photoUrl} alt={personal.fullName} className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: emeraldAccent }} />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{personal.fullName}</h1>
            <p className="text-sm font-semibold" style={{ color: emeraldAccent }}>{personal.headline}</p>
            <div className="flex flex-wrap gap-x-3 text-xs text-slate-500 mt-1">
              <span>{personal.location}</span>
              <span>{personal.phone}</span>
              <span>{personal.email}</span>
            </div>
          </div>
        </div>

        {activeSummary && (
          <div className="mb-4 cv-section">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5" style={{ color: emeraldAccent }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: emeraldAccent }}></span>
              About Me
            </h2>
            <p className="text-xs leading-relaxed text-slate-700">{activeSummary}</p>
          </div>
        )}

        <div className="mb-4 cv-section">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: emeraldAccent }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: emeraldAccent }}></span>
            Experience
          </h2>
          <div className="space-y-3">
            {experiences.map(exp => (
              <div key={exp.id} className="cv-item pl-3 border-l-2" style={{ borderColor: '#a7f3d0' }}>
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-900">{exp.role}</span>
                  <span className="text-emerald-700 font-semibold">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="text-xs text-slate-600 mb-1">{exp.company} • {exp.location}</div>
                {renderBullets(exp.description)}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 cv-section">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: emeraldAccent }}>Education</h2>
            {educations.map(edu => (
              <div key={edu.id} className="text-xs">
                <p className="font-bold text-slate-900">{edu.degree}</p>
                <p className="text-slate-600">{edu.institution} ({edu.startDate} - {edu.endDate})</p>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: emeraldAccent }}>Skills & Expertise</h2>
            <div className="flex flex-wrap gap-1">
              {skills.map((s, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 5: Ivy League Classic (No Photo, Serif)
  // -------------------------------------------------------------
  if (config.themeId === 5) {
    return (
      <div className="p-8 bg-white text-slate-950 font-serif leading-relaxed">
        <div className="text-center border-b-2 border-slate-950 pb-3 mb-4">
          <h1 className="text-2xl font-bold tracking-widest uppercase text-slate-950">{personal.fullName}</h1>
          <p className="text-xs italic text-slate-700 mt-1">{personal.headline}</p>
          <div className="text-xs text-slate-600 mt-2 space-x-2">
            <span>{personal.location}</span>
            <span>•</span>
            <span>{personal.phone}</span>
            <span>•</span>
            <span>{personal.email}</span>
            {personal.website && (
              <>
                <span>•</span>
                <span>{personal.website}</span>
              </>
            )}
          </div>
        </div>

        {activeSummary && (
          <div className="mb-4 cv-section">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5 text-center">
              Professional Summary
            </h2>
            <p className="text-xs text-slate-800 text-justify">{activeSummary}</p>
          </div>
        )}

        <div className="mb-4 cv-section">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-0.5 mb-2 text-center">
            Professional Experience
          </h2>
          <div className="space-y-3">
            {experiences.map(exp => (
              <div key={exp.id} className="cv-item">
                <div className="flex justify-between text-xs font-bold">
                  <span>{exp.company}</span>
                  <span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="flex justify-between text-xs italic text-slate-700">
                  <span>{exp.role}</span>
                  <span>{exp.location}</span>
                </div>
                {renderBullets(exp.description)}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4 cv-section">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-0.5 mb-2 text-center">
            Education
          </h2>
          {educations.map(edu => (
            <div key={edu.id} className="text-xs flex justify-between mb-1">
              <div>
                <span className="font-bold">{edu.institution}</span>, {edu.location} — <span className="italic">{edu.degree}</span>
              </div>
              <span>{edu.startDate} – {edu.endDate}</span>
            </div>
          ))}
        </div>

        <div className="cv-section">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5 text-center">
            Skills & Languages
          </h2>
          <p className="text-xs text-center text-slate-800">
            <strong>Skills:</strong> {skills.join(', ')} &bull; <strong>Languages:</strong> {languages.map(l => `${l.name} (${l.level})`).join(', ')}
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 6: Hospitality Warm Amber
  // -------------------------------------------------------------
  if (config.themeId === 6) {
    const amberAccent = '#d97706';
    return (
      <div className={`flex min-h-[297mm] bg-white text-slate-900 ${fontClass}`}>
        {/* Left Warm Amber Sidebar */}
        <div className="w-[32%] p-6 text-white" style={{ backgroundColor: amberAccent }}>
          {config.showPhoto && personal.photoUrl && (
            <div className="flex justify-center mb-4">
              <img src={personal.photoUrl} alt={personal.fullName} className="w-24 h-24 rounded-full object-cover border-4 border-amber-200 shadow-md" />
            </div>
          )}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-100 border-b border-amber-400 pb-1 mb-2">Contact</h3>
            <div className="text-xs space-y-1.5 text-amber-50">
              <div>{personal.location}</div>
              <div>{personal.phone}</div>
              <div className="break-all">{personal.email}</div>
              {personal.website && <div>{personal.website}</div>}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-100 border-b border-amber-400 pb-1 mb-2">Key Skills</h3>
            <div className="flex flex-wrap gap-1">
              {skills.map((s, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-amber-600 text-white font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-100 border-b border-amber-400 pb-1 mb-2">Languages</h3>
            <div className="text-xs space-y-1 text-amber-50">
              {languages.map((l, i) => (
                <div key={i}>{l.name} - {l.level}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-[68%] p-6">
          <div className="border-b pb-3 mb-4" style={{ borderColor: '#fef3c7' }}>
            <h1 className="text-2xl font-bold uppercase text-slate-900">{personal.fullName}</h1>
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: amberAccent }}>{personal.headline}</p>
          </div>

          {activeSummary && (
            <div className="mb-4 cv-section">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">Professional Summary</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{activeSummary}</p>
            </div>
          )}

          <div className="mb-4 cv-section">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">Professional Experience</h2>
            <div className="space-y-3">
              {experiences.map(exp => (
                <div key={exp.id} className="cv-item">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span>{exp.role}</span>
                    <span className="text-amber-800">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-1">{exp.company} • {exp.location}</div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          </div>

          <div className="cv-section">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">Education</h2>
            {educations.map(edu => (
              <div key={edu.id} className="text-xs">
                <span className="font-bold text-slate-900">{edu.degree}</span> — {edu.institution}
                <div className="text-slate-500">{edu.startDate} - {edu.endDate}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 7: Luxury Gold (Center Photo)
  // -------------------------------------------------------------
  if (config.themeId === 7) {
    const goldAccent = '#b48c36';
    return (
      <div className={`p-8 bg-white text-slate-900 ${fontClass}`}>
        <div className="text-center pb-4 mb-4 border-b" style={{ borderColor: '#fef08a' }}>
          {config.showPhoto && personal.photoUrl && (
            <div className="flex justify-center mb-3">
              <img src={personal.photoUrl} alt={personal.fullName} className="w-20 h-20 rounded-full object-cover border-2 shadow-sm" style={{ borderColor: goldAccent }} />
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-widest uppercase text-slate-900">{personal.fullName}</h1>
          <p className="text-xs font-medium uppercase tracking-widest mt-1" style={{ color: goldAccent }}>{personal.headline}</p>
          <div className="text-xs text-slate-500 mt-2 flex justify-center gap-3">
            <span>{personal.location}</span>
            <span>|</span>
            <span>{personal.phone}</span>
            <span>|</span>
            <span>{personal.email}</span>
          </div>
        </div>

        {activeSummary && (
          <div className="mb-4 cv-section text-center max-w-xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: goldAccent }}>Profile Overview</h2>
            <p className="text-xs text-slate-700 leading-relaxed">{activeSummary}</p>
          </div>
        )}

        <div className="mb-4 cv-section">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-2 text-center" style={{ color: goldAccent, borderColor: '#fef08a' }}>
            Work History
          </h2>
          <div className="space-y-3">
            {experiences.map(exp => (
              <div key={exp.id} className="cv-item">
                <div className="flex justify-between text-xs font-bold text-slate-900">
                  <span>{exp.role}</span>
                  <span style={{ color: goldAccent }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="text-xs text-slate-500 italic mb-1">{exp.company} &bull; {exp.location}</div>
                {renderBullets(exp.description)}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 cv-section">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-2" style={{ color: goldAccent, borderColor: '#fef08a' }}>
              Education
            </h2>
            {educations.map(edu => (
              <div key={edu.id} className="text-xs">
                <div className="font-bold text-slate-900">{edu.degree}</div>
                <div className="text-slate-500">{edu.institution} ({edu.startDate} - {edu.endDate})</div>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-2" style={{ color: goldAccent, borderColor: '#fef08a' }}>
              Competencies
            </h2>
            <div className="flex flex-wrap gap-1">
              {skills.map((s, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-medium border border-amber-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 8: Dark Sidebar Split (Modern)
  // -------------------------------------------------------------
  if (config.themeId === 8) {
    return (
      <div className={`flex min-h-[297mm] bg-white text-slate-900 ${fontClass}`}>
        <div className="w-[33%] bg-slate-900 text-white p-6">
          {config.showPhoto && personal.photoUrl && (
            <div className="flex justify-center mb-5">
              <img src={personal.photoUrl} alt={personal.fullName} className="w-24 h-24 rounded-full object-cover border-2 border-slate-700 shadow" />
            </div>
          )}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 border-b border-slate-700 pb-1 mb-2">Contact</h3>
            <div className="text-xs text-slate-300 space-y-1.5">
              <div>{personal.location}</div>
              <div>{personal.phone}</div>
              <div className="break-all">{personal.email}</div>
              {personal.website && <div className="text-blue-300">{personal.website}</div>}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 border-b border-slate-700 pb-1 mb-2">Technical Skills</h3>
            <div className="flex flex-wrap gap-1">
              {skills.map((s, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 border-b border-slate-700 pb-1 mb-2">Languages</h3>
            <div className="text-xs text-slate-300 space-y-1">
              {languages.map((l, i) => (
                <div key={i}>{l.name} ({l.level})</div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-[67%] p-6">
          <div className="border-b pb-3 mb-4 border-slate-200">
            <h1 className="text-2xl font-bold uppercase text-slate-900">{personal.fullName}</h1>
            <p className="text-sm font-semibold text-blue-600">{personal.headline}</p>
          </div>

          {activeSummary && (
            <div className="mb-4 cv-section">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 mb-1">About Me</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{activeSummary}</p>
            </div>
          )}

          <div className="mb-4 cv-section">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 mb-2">Work Experience</h2>
            <div className="space-y-3">
              {experiences.map(exp => (
                <div key={exp.id} className="cv-item">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span>{exp.role}</span>
                    <span className="text-slate-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="text-xs text-blue-600 font-medium mb-1">{exp.company} &bull; {exp.location}</div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          </div>

          <div className="cv-section">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 mb-2">Education</h2>
            {educations.map(edu => (
              <div key={edu.id} className="text-xs mb-1">
                <span className="font-bold text-slate-900">{edu.degree}</span> — {edu.institution} ({edu.startDate} - {edu.endDate})
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 9: Creative Visual (Round Photo)
  // -------------------------------------------------------------
  if (config.themeId === 9) {
    return (
      <div className={`p-8 bg-white text-slate-900 ${fontClass}`}>
        <div className="flex items-center gap-6 border-b pb-6 mb-5" style={{ borderColor: '#e2e8f0' }}>
          {config.showPhoto && personal.photoUrl && (
            <img src={personal.photoUrl} alt={personal.fullName} className="w-20 h-20 rounded-full object-cover shadow-lg ring-4 ring-blue-50" />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900">{personal.fullName}</h1>
            <p className="text-sm font-semibold text-blue-600 mt-0.5">{personal.headline}</p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1"><MapPin size={12} /> {personal.location}</span>
              <span className="flex items-center gap-1"><Phone size={12} /> {personal.phone}</span>
              <span className="flex items-center gap-1"><Mail size={12} /> {personal.email}</span>
            </div>
          </div>
        </div>

        {activeSummary && (
          <div className="mb-5 cv-section bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">Creative Summary</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{activeSummary}</p>
          </div>
        )}

        <div className="mb-5 cv-section">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Experience & Highlights</h2>
          <div className="space-y-3">
            {experiences.map(exp => (
              <div key={exp.id} className="cv-item">
                <div className="flex justify-between text-xs font-bold text-slate-900">
                  <span>{exp.role}</span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px]">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="text-xs text-slate-500 mb-1">{exp.company} • {exp.location}</div>
                {renderBullets(exp.description)}
              </div>
            ))}
          </div>
        </div>

        {projects.length > 0 && (
          <div className="mb-5 cv-section">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Featured Projects</h2>
            <div className="grid grid-cols-2 gap-3">
              {projects.map(proj => (
                <div key={proj.id} className="p-2.5 rounded border border-slate-200 bg-white">
                  <div className="font-bold text-xs text-slate-900">{proj.title}</div>
                  <div className="text-[11px] text-blue-600 font-medium">{proj.role} {proj.metrics && `• ${proj.metrics}`}</div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 cv-section">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Education</h2>
            {educations.map(edu => (
              <div key={edu.id} className="text-xs">
                <span className="font-bold text-slate-900">{edu.degree}</span>
                <p className="text-slate-500">{edu.institution} ({edu.startDate} - {edu.endDate})</p>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Skills & Tools</h2>
            <div className="flex flex-wrap gap-1">
              {skills.map((s, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 10: Editorial Split (No Photo)
  // -------------------------------------------------------------
  if (config.themeId === 10) {
    return (
      <div className={`bg-white text-slate-900 ${fontClass}`}>
        <div className="bg-emerald-900 text-white p-6">
          <h1 className="text-3xl font-extrabold uppercase tracking-wide">{personal.fullName}</h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300 mt-1">{personal.headline}</p>
          <div className="flex flex-wrap gap-4 text-xs text-emerald-200 mt-2">
            <span>{personal.location}</span>
            <span>{personal.phone}</span>
            <span>{personal.email}</span>
            {personal.website && <span>{personal.website}</span>}
          </div>
        </div>

        <div className="p-6 grid grid-cols-12 gap-6">
          <div className="col-span-7 space-y-4 cv-section">
            {activeSummary && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b pb-1 mb-1.5">Editorial Bio</h2>
                <p className="text-xs text-slate-600 leading-relaxed">{activeSummary}</p>
              </div>
            )}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b pb-1 mb-2">Experience</h2>
              <div className="space-y-3">
                {experiences.map(exp => (
                  <div key={exp.id} className="cv-item">
                    <div className="flex justify-between text-xs font-bold text-slate-900">
                      <span>{exp.role}</span>
                      <span className="text-slate-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                    </div>
                    <div className="text-xs text-slate-500 italic mb-1">{exp.company} &bull; {exp.location}</div>
                    {renderBullets(exp.description)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-5 space-y-4 cv-section">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b pb-1 mb-1.5">Education</h2>
              {educations.map(edu => (
                <div key={edu.id} className="text-xs mb-1.5">
                  <div className="font-bold text-slate-900">{edu.degree}</div>
                  <div className="text-slate-500">{edu.institution}</div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b pb-1 mb-1.5">Key Skills</h2>
              <div className="flex flex-wrap gap-1">
                {skills.map((s, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-100 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b pb-1 mb-1.5">Languages</h2>
              <div className="text-xs text-slate-600 space-y-0.5">
                {languages.map((l, i) => (
                  <div key={i}>{l.name} - {l.level}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 11: Right Sidebar Accent
  // -------------------------------------------------------------
  if (config.themeId === 11) {
    return (
      <div className={`flex min-h-[297mm] bg-white text-slate-900 ${fontClass}`}>
        <div className="w-[67%] p-6">
          <div className="border-b pb-3 mb-4">
            <h1 className="text-3xl font-extrabold uppercase text-slate-900">{personal.fullName}</h1>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">{personal.headline}</p>
          </div>

          {activeSummary && (
            <div className="mb-4 cv-section">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 mb-1">Executive Summary</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{activeSummary}</p>
            </div>
          )}

          <div className="mb-4 cv-section">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 mb-2">Work Experience</h2>
            <div className="space-y-3">
              {experiences.map(exp => (
                <div key={exp.id} className="cv-item">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span>{exp.role}</span>
                    <span className="text-blue-600">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-1">{exp.company} &bull; {exp.location}</div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          </div>

          <div className="cv-section">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 mb-1">Education</h2>
            {educations.map(edu => (
              <div key={edu.id} className="text-xs">
                <span className="font-bold text-slate-900">{edu.degree}</span> — {edu.institution}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[33%] bg-slate-100 p-6 border-l border-slate-200">
          {config.showPhoto && personal.photoUrl && (
            <div className="flex justify-center mb-5">
              <img src={personal.photoUrl} alt={personal.fullName} className="w-24 h-24 rounded-full object-cover border-2 border-white shadow" />
            </div>
          )}
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">Contact</h3>
            <div className="text-xs text-slate-600 space-y-1">
              <div>{personal.location}</div>
              <div>{personal.phone}</div>
              <div className="break-all">{personal.email}</div>
            </div>
          </div>

          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">Key Skills</h3>
            <div className="flex flex-wrap gap-1">
              {skills.map((s, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white text-slate-800 font-medium border border-slate-200">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">Languages</h3>
            <div className="text-xs text-slate-600 space-y-0.5">
              {languages.map((l, i) => (
                <div key={i}>{l.name} ({l.level})</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 12: Vertical Monolith (No Photo, Architectural)
  // -------------------------------------------------------------
  if (config.themeId === 12) {
    return (
      <div className={`flex min-h-[297mm] bg-white text-slate-900 ${fontClass}`}>
        <div className="w-[12%] bg-slate-950 text-white flex items-center justify-center p-2">
          <div className="transform -rotate-90 whitespace-nowrap text-xl font-black tracking-widest uppercase text-slate-100">
            {personal.fullName}
          </div>
        </div>

        <div className="w-[88%] p-8">
          <div className="border-b pb-3 mb-4">
            <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-950">{personal.headline}</h1>
            <div className="text-xs text-slate-500 mt-1 flex gap-4">
              <span>{personal.location}</span>
              <span>{personal.phone}</span>
              <span>{personal.email}</span>
            </div>
          </div>

          {activeSummary && (
            <div className="mb-4 cv-section">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1">Overview</h2>
              <p className="text-xs text-slate-700 leading-relaxed">{activeSummary}</p>
            </div>
          )}

          <div className="mb-4 cv-section">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-2">Experience</h2>
            <div className="space-y-3">
              {experiences.map(exp => (
                <div key={exp.id} className="cv-item">
                  <div className="flex justify-between text-xs font-bold text-slate-950">
                    <span>{exp.role}</span>
                    <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="text-xs text-slate-600 mb-1">{exp.company} &bull; {exp.location}</div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 cv-section">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">Education</h2>
              {educations.map(edu => (
                <div key={edu.id} className="text-xs">
                  <span className="font-bold">{edu.degree}</span>
                  <div className="text-slate-500">{edu.institution}</div>
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">Competencies</h2>
              <p className="text-xs text-slate-700">{skills.join(' • ')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 13: Signature Edition (Gold/Black)
  // -------------------------------------------------------------
  if (config.themeId === 13) {
    const gold = '#eab308';
    return (
      <div className={`flex min-h-[297mm] bg-white text-slate-900 ${fontClass}`}>
        <div className="w-[32%] bg-zinc-900 text-white p-6 border-r-2" style={{ borderColor: gold }}>
          {config.showPhoto && personal.photoUrl && (
            <div className="flex justify-center mb-5">
              <img src={personal.photoUrl} alt={personal.fullName} className="w-24 h-24 rounded object-cover border-2" style={{ borderColor: gold }} />
            </div>
          )}
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-2" style={{ color: gold, borderColor: '#3f3f46' }}>Contact</h3>
            <div className="text-xs text-zinc-300 space-y-1">
              <div>{personal.location}</div>
              <div>{personal.phone}</div>
              <div className="break-all">{personal.email}</div>
            </div>
          </div>

          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-2" style={{ color: gold, borderColor: '#3f3f46' }}>Executive Skills</h3>
            <div className="flex flex-wrap gap-1">
              {skills.map((s, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-100 font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="w-[68%] p-6">
          <div className="border-b pb-3 mb-4">
            <h1 className="text-2xl font-black uppercase text-zinc-900">{personal.fullName}</h1>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">{personal.headline}</p>
          </div>

          {activeSummary && (
            <div className="mb-4 cv-section">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-800 mb-1">Executive Summary</h2>
              <p className="text-xs text-zinc-600 leading-relaxed">{activeSummary}</p>
            </div>
          )}

          <div className="mb-4 cv-section">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-800 mb-2">Professional Experience</h2>
            <div className="space-y-3">
              {experiences.map(exp => (
                <div key={exp.id} className="cv-item">
                  <div className="flex justify-between text-xs font-bold text-zinc-900">
                    <span>{exp.role}</span>
                    <span className="text-amber-600">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="text-xs text-zinc-500 mb-1">{exp.company} &bull; {exp.location}</div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          </div>

          <div className="cv-section">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-800 mb-1">Education</h2>
            {educations.map(edu => (
              <div key={edu.id} className="text-xs">
                <span className="font-bold text-zinc-900">{edu.degree}</span> — {edu.institution}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 14: Tech Terminal (No Photo, Monospace Developer)
  // -------------------------------------------------------------
  if (config.themeId === 14) {
    return (
      <div className="p-8 bg-white text-slate-900 font-mono text-xs leading-normal">
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="text-blue-600 font-bold text-lg">&gt; {personal.fullName.toLowerCase().replace(/\s+/g, '_')}</div>
          <div className="text-slate-600">// {personal.headline}</div>
          <div className="text-slate-500 mt-1 flex flex-wrap gap-x-3">
            <span>loc: "{personal.location}"</span>
            <span>tel: "{personal.phone}"</span>
            <span>email: "{personal.email}"</span>
          </div>
        </div>

        {activeSummary && (
          <div className="mb-4 cv-section">
            <div className="text-blue-700 font-bold mb-1">// summary.md</div>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-2 border-l-2 border-blue-600">{activeSummary}</p>
          </div>
        )}

        <div className="mb-4 cv-section">
          <div className="text-blue-700 font-bold mb-2">// experience.json</div>
          <div className="space-y-3">
            {experiences.map(exp => (
              <div key={exp.id} className="cv-item">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>const role = "{exp.role}";</span>
                  <span className="text-slate-500">[{exp.startDate}..{exp.current ? 'now' : exp.endDate}]</span>
                </div>
                <div className="text-slate-600">company: "{exp.company}"</div>
                {renderBullets(exp.description)}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4 cv-section">
          <div className="text-blue-700 font-bold mb-1">// skills.array</div>
          <div className="flex flex-wrap gap-1">
            {skills.map((s, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                "{s}"
              </span>
            ))}
          </div>
        </div>

        <div className="cv-section">
          <div className="text-blue-700 font-bold mb-1">// education.log</div>
          {educations.map(edu => (
            <div key={edu.id}>
              {edu.degree} @ {edu.institution} ({edu.startDate}-{edu.endDate})
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 15: Dark Badge Specialist (Square Photo)
  // -------------------------------------------------------------
  // Default to Template 15 if themeId matches or fallback
  return (
    <div className={`p-8 bg-white text-slate-900 ${fontClass}`}>
      <div className="flex items-start gap-5 border-b-2 pb-4 mb-4" style={{ borderColor: accent }}>
        {config.showPhoto && personal.photoUrl && (
          <img src={personal.photoUrl} alt={personal.fullName} className="w-20 h-20 rounded-lg object-cover border-2 shadow" style={{ borderColor: accent }} />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 uppercase">{personal.fullName}</h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: accent }}>
              Specialist Pro
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">{personal.headline}</p>
          <div className="flex flex-wrap gap-x-4 text-xs text-slate-500 mt-1.5">
            <span>{personal.location}</span>
            <span>{personal.phone}</span>
            <span>{personal.email}</span>
            {personal.website && <span>{personal.website}</span>}
          </div>
        </div>
      </div>

      {activeSummary && (
        <div className="mb-4 cv-section">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-1.5" style={{ borderBottomColor: accent }}>
            Professional Summary
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">{activeSummary}</p>
        </div>
      )}

      <div className="mb-4 cv-section">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2" style={{ borderBottomColor: accent }}>
          Work Experience
        </h2>
        <div className="space-y-3">
          {experiences.map(exp => (
            <div key={exp.id} className="cv-item">
              <div className="flex justify-between text-xs font-bold text-slate-900">
                <span>{exp.role}</span>
                <span className="text-slate-600 font-semibold">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <div className="text-xs text-slate-500 mb-1 font-medium">{exp.company} &bull; {exp.location}</div>
              {renderBullets(exp.description)}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 cv-section">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2" style={{ borderBottomColor: accent }}>
            Education
          </h2>
          {educations.map(edu => (
            <div key={edu.id} className="text-xs mb-1">
              <span className="font-bold text-slate-900">{edu.degree}</span>
              <p className="text-slate-500">{edu.institution} ({edu.startDate} - {edu.endDate})</p>
            </div>
          ))}
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2" style={{ borderBottomColor: accent }}>
            Technical Competencies
          </h2>
          <div className="flex flex-wrap gap-1">
            {skills.map((s, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
