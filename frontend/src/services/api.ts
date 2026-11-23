import {
  MasterProfile as ProdilMasterProfile,
  CVDocumentConfig,
  CoverLetterConfig,
  ATSAnalysisResult,
  SectionKey,
  TemplateId,
  CV_TEMPLATES as PRODIL_CV_TEMPLATES,
} from '../types/prodil';
import type { MasterProfile as StudioMasterProfile, CVDesignConfig, CoverLetterData } from '../types/cv';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function toProdilProfile(profile: StudioMasterProfile): ProdilMasterProfile {
  return {
    personal: profile.personal,
    hiddenFields: profile.hiddenFields || {},
    sectionOrder: profile.sectionOrder || [],
    visibleSections: profile.visibleSections || {
      summary: true, experience: true, projects: true, education: true, skills: true,
      achievements: true, objective: true, languages: true, certifications: true,
    },
    customSections: profile.customSections || [],
    summaries: profile.summaries,
    experiences: profile.experiences.map((item) => ({
      id: item.id,
      role: item.role,
      company: item.company,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      current: item.current,
      period: item.period || [item.startDate, item.current ? 'Present' : item.endDate].filter(Boolean).join(' – '),
      description: item.description,
      bullets: item.bullets || item.description?.split('\n').filter(Boolean) || [],
    })),
    educations: profile.educations.map((item) => ({
      ...item,
      period: item.period || [item.startDate, item.endDate].filter(Boolean).join(' – '),
    })),
    projectsAndWorks: profile.projects.map((item) => ({
      ...item,
      clientOrBrand: item.clientOrBrand || item.client || '',
    })),
    skills: profile.skills,
    languages: profile.languages.map((item) => `${item.name}${item.level ? ` (${item.level})` : ''}`),
    languageDetails: profile.languages,
    certifications: profile.certifications,
    achievements: profile.achievements || [],
    careerObjective: profile.careerObjective || '',
  };
}

function toStudioProfile(profile: Partial<ProdilMasterProfile>): Partial<StudioMasterProfile> {
  const raw = profile as Partial<ProdilMasterProfile> & {
    projects?: Array<Partial<ProdilMasterProfile['projectsAndWorks'][number]> & {
      id: string;
      title: string;
      role: string;
      description: string;
      client?: string;
    }>;
  };
  const projectItems = profile.projectsAndWorks || raw.projects || [];
  const rawLanguages = (profile.languages || []) as unknown[];
  const languageDetails = profile.languageDetails || rawLanguages
    .filter((item): item is { name: string; level: string } =>
      typeof item === 'object' && item !== null && 'name' in item && 'level' in item
    );
  return {
    ...profile,
    hiddenFields: profile.hiddenFields || {},
    sectionOrder: profile.sectionOrder || [],
    visibleSections: profile.visibleSections || {
      summary: true, experience: true, projects: true, education: true, skills: true,
      achievements: true, objective: true, languages: true, certifications: true,
    },
    customSections: profile.customSections || [],
    personal: profile.personal
      ? {
          ...profile.personal,
          photoUrl: profile.personal.photoUrl || '',
          socials: profile.personal.socials || [],
        }
      : undefined,
    summaries: profile.summaries || [],
    experiences: profile.experiences?.map((item) => ({
      ...item,
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      description: item.description || item.bullets.join('\n'),
    })),
    educations: profile.educations?.map((item) => ({
      ...item,
      startDate: item.startDate || '',
      endDate: item.endDate || '',
    })),
    projects: projectItems.map((item) => ({
      ...item,
      clientOrBrand: item.clientOrBrand || item.client || '',
      metrics: item.metrics || '',
      client: item.client || item.clientOrBrand,
    })),
    skills: profile.skills || [],
    languages: languageDetails.length
      ? languageDetails
      : rawLanguages.map((item) => ({ name: String(item), level: '' })),
    achievements: profile.achievements || [],
    careerObjective: profile.careerObjective || '',
  };
}

function toProdilCv(config: CVDesignConfig): Omit<CVDocumentConfig, 'id'> {
  const template = PRODIL_CV_TEMPLATES.find((item) => item.legacyId === config.themeId);
  const sectionKeys: SectionKey[] = ['summary', 'experience', 'projects', 'education', 'skills', 'achievements', 'objective', 'languages', 'certifications'];
  return {
    title: config.title || 'CV',
    templateId: template?.id || 'ats-classic',
    accentColor: config.accentColor,
    fontFamily: config.fontFamily,
    fontSize: config.fontSize,
    showPhoto: config.showPhoto,
    sectionOrder: config.sectionOrder.filter((key): key is SectionKey => sectionKeys.includes(key as SectionKey)),
    visibleSections: config.visibleSections,
    hiddenSections: config.hiddenSections.filter((key): key is SectionKey => sectionKeys.includes(key as SectionKey)),
    activeSummaryId: config.activeSummaryId,
  };
}

function toStudioCv(config: CVDocumentConfig): CVDesignConfig {
  const template = PRODIL_CV_TEMPLATES.find((item) => item.id === config.templateId as TemplateId);
  return {
    id: config.id,
    title: config.title,
    themeId: template?.legacyId || 1,
    accentColor: config.accentColor,
    fontFamily: config.fontFamily,
    fontSize: config.fontSize || 'normal',
    showPhoto: config.showPhoto !== false,
    sectionOrder: config.sectionOrder,
    hiddenSections: config.hiddenSections,
    visibleSections: config.visibleSections || {
      summary: true, experience: true, projects: true, education: true, skills: true,
      achievements: true, objective: true, languages: true, certifications: true,
    },
    activeSummaryId: config.activeSummaryId,
  };
}

function toProdilLetter(letter: CoverLetterData): CoverLetterConfig {
  return {
    id: letter.id || 'local-letter',
    title: letter.title || 'Surat Lamaran',
    recipientName: letter.recipientName,
    recipientTitle: letter.recipientTitle,
    companyName: letter.companyName,
    companyAddress: letter.companyAddress,
    targetRole: letter.jobTitle,
    date: letter.date,
    subject: letter.subject,
    bodyText: letter.letterBody,
    templateAccent: letter.accentColor,
  };
}

function toStudioLetter(letter: CoverLetterConfig): CoverLetterData {
  return {
    ...letter,
    id: letter.id,
    recipientTitle: letter.recipientTitle || '',
    companyAddress: letter.companyAddress || '',
    jobTitle: letter.targetRole,
    date: letter.date || '',
    subject: letter.subject || '',
    letterBody: letter.bodyText,
    accentColor: letter.templateAccent,
  };
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('prodil_auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('prodil_auth_token', token);
    } else {
      localStorage.removeItem('prodil_auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('prodil_auth_token');
    }
    return this.token;
  }

  toStudioProfile(profile: Partial<ProdilMasterProfile>) {
    return toStudioProfile(profile);
  }

  toStudioCv(config: CVDocumentConfig) {
    return toStudioCv(config);
  }

  toProdilCv(config: CVDesignConfig) {
    return toProdilCv(config);
  }

  toStudioLetter(letter: CoverLetterConfig) {
    return toStudioLetter(letter);
  }

  toProdilLetter(letter: CoverLetterData) {
    return toProdilLetter(letter);
  }

  private getHeaders(extraHeaders: Record<string, string> = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extraHeaders,
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('AUTH_REQUIRED');
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Request gagal (${res.status})`);
    }
    return res.json();
  }

  // ==========================================================================
  // 1. HEALTH & AUTHENTICATION (Fondasi Proyek Lama)
  // ==========================================================================

  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      return await res.json();
    } catch {
      return { status: 'offline', message: 'Backend unreachable' };
    }
  }

  async register(email: string, password: string, fullName: string) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    });
    return await res.json();
  }

  async verifyEmail(email: string, code: string) {
    const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async resendCode(email: string) {
    const res = await fetch(`${API_BASE}/api/auth/resend-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  }

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async loginWithGoogle(payload: { email: string; name: string; picture?: string; googleId?: string }) {
    const res = await fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getMe() {
    if (!this.getToken()) return null;
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          this.setToken(null);
        }
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  }

  // ==========================================================================
  // 2. WORKSPACE, MULTI-CV & COVER LETTER
  // ==========================================================================

  async getWorkspace() {
    const res = await fetch(`${API_BASE}/api/workspace`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{
      user: { id: number | string; email: string; fullName: string; avatarUrl?: string };
      profile: ProdilMasterProfile;
      cvs: CVDocumentConfig[];
      letters: CoverLetterConfig[];
    }>(res);
  }

  async getMasterProfile(): Promise<ProdilMasterProfile | null> {
    try {
      const res = await fetch(`${API_BASE}/api/workspace`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        return json.profile || null;
      }
    } catch (err) {
      console.warn('[API] Could not fetch remote master profile:', err);
    }
    return null;
  }

  async saveProfile(profile: ProdilMasterProfile) {
    const res = await fetch(`${API_BASE}/api/workspace/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(profile),
    });
    return this.handleResponse<{ profile: ProdilMasterProfile }>(res);
  }

  async saveMasterProfile(profile: StudioMasterProfile) {
    return this.saveProfile(toProdilProfile(profile));
  }

  async createCv(config: Omit<CVDocumentConfig, 'id'>) {
    const res = await fetch(`${API_BASE}/api/workspace/cv`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(config),
    });
    return this.handleResponse<{ cv: CVDocumentConfig }>(res);
  }

  async saveCv(id: number | string, config: CVDocumentConfig) {
    const res = await fetch(`${API_BASE}/api/workspace/cv/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(config),
    });
    return this.handleResponse<{ cv: CVDocumentConfig }>(res);
  }

  async deleteCv(id: number | string) {
    const res = await fetch(`${API_BASE}/api/workspace/cv/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ deleted: boolean }>(res);
  }

  async saveCoverLetter(id: number | string, letter: CoverLetterConfig) {
    const res = await fetch(`${API_BASE}/api/workspace/cover-letter/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(letter),
    });
    return this.handleResponse<{ letter: CoverLetterConfig }>(res);
  }

  // ==========================================================================
  // 3. UNIFIED GEMINI AI SERVICES (ATS Scorer, Summary, Cover Letter, Smart Import)
  // ==========================================================================

  async aiGenerate<T = any>(
    action: 'summary' | 'rewrite-bullets' | 'cover-letter' | 'ats-match',
    payload: Record<string, any>
  ) {
    const languageCode = localStorage.getItem('prodil_lang') || 'id-ID';
    const languageNames: Record<string, string> = {
      'en-GB': 'English (UK)', 'en-US': 'English (US)', 'it-IT': 'Italian',
      'de-DE': 'German', 'id-ID': 'Bahasa Indonesia',
    };
    const language = languageNames[languageCode] || 'Bahasa Indonesia';
    const localizedPayload = { ...payload, language: payload.language || language };
    const res = await fetch(`${API_BASE}/api/ai/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ action, payload: localizedPayload }),
    });
    return this.handleResponse<{ result: T }>(res);
  }

  async generateSummary(payload: {
    role: string;
    yearsOfExperience?: string;
    keySkills?: string;
    targetIndustry?: string;
    tone?: string;
  }): Promise<{
    success: boolean;
    data?: { summaryIdText?: string; summaryEn?: string };
    message?: string;
  }> {
    const { result } = await this.aiGenerate<string>('summary', {
      role: payload.role,
      yearsOfExperience: payload.yearsOfExperience,
      keySkills: payload.keySkills,
      targetIndustry: payload.targetIndustry,
      tone: payload.tone,
      language: 'Bahasa Indonesia',
    });
    return { success: true, data: { summaryIdText: result, summaryEn: undefined } };
  }

  async optimizeBullets(payload: {
    role: string;
    rawBullets: string;
    jobDescription?: string;
  }): Promise<{
    success: boolean;
    data?: { optimizedBullets?: string[]; formattedText?: string };
    message?: string;
  }> {
    const { result } = await this.aiGenerate<string[]>('rewrite-bullets', {
      role: payload.role,
      rawBullets: payload.rawBullets,
      jobDescription: payload.jobDescription,
    });
    const bullets = Array.isArray(result) ? result : [];
    return { success: true, data: { optimizedBullets: bullets, formattedText: bullets.join('\n') } };
  }

  async generateCoverLetter(payload: {
    masterProfile: StudioMasterProfile;
    recipientName?: string;
    companyName: string;
    jobTitle: string;
    jobDescription?: string;
    tone?: string;
  }): Promise<{
    success: boolean;
    data?: { letterBody?: string; subject?: string };
    message?: string;
  }> {
    const profile = payload.masterProfile;
    const { result } = await this.aiGenerate<string>('cover-letter', {
      fullName: profile.personal.fullName,
      headline: profile.personal.headline,
      targetRole: payload.jobTitle,
      recipientName: payload.recipientName,
      companyName: payload.companyName,
      profileContext: `${profile.summaries[0]?.text || ''} | Skills: ${profile.skills.join(', ')} | Experience: ${profile.experiences.map((item) => `${item.role} at ${item.company}`).join(', ')}`,
      jobDescription: payload.jobDescription,
      language: payload.tone || 'Bahasa Indonesia',
    });
    return {
      success: true,
      data: { letterBody: result, subject: `Lamaran ${payload.jobTitle} - ${profile.personal.fullName}` },
    };
  }

  async analyzeAtsMatch(payload: {
    masterProfile: ProdilMasterProfile | StudioMasterProfile;
    jobDescription: string;
  }) {
    return this.aiGenerate<ATSAnalysisResult>('ats-match', payload);
  }

  async smartImportFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/ai/smart-import`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const response = await this.handleResponse<{
      success: boolean;
      message?: string;
      parsedProfile?: Partial<ProdilMasterProfile>;
      data?: Partial<ProdilMasterProfile>;
    }>(res);
    const profile = response.parsedProfile || response.data;
    return {
      success: response.success,
      message: response.message,
      data: profile ? toStudioProfile(profile) : undefined,
    };
  }
}

export const api = new ApiService();
