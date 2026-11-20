export interface SocialLink {
  platform: string;
  url: string;
}

export interface PersonalInfo {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  photoUrl: string;
  socials: SocialLink[];
}

export interface SummaryItem {
  id: string;
  label: string;
  text: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  achievements?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  role: string;
  client?: string;
  metrics?: string;
  link?: string;
  description: string;
}

export interface LanguageItem {
  name: string;
  level: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year: string;
}

export interface MasterProfile {
  personal: PersonalInfo;
  summaries: SummaryItem[];
  experiences: ExperienceItem[];
  educations: EducationItem[];
  projects: ProjectItem[];
  skills: string[];
  languages: LanguageItem[];
  certifications: CertificationItem[];
}

export interface CVDesignConfig {
  themeId: number;
  accentColor: string;
  fontFamily: string;
  showPhoto: boolean;
  fontSize: 'compact' | 'normal' | 'spacious';
  activeSummaryId: string;
  sectionOrder: string[];
  hiddenSections: string[];
}

export interface CoverLetterData {
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  companyAddress: string;
  jobTitle: string;
  date: string;
  letterBody: string;
  subject: string;
  accentColor: string;
}

export interface CVTemplateMeta {
  id: number;
  name: string;
  category: 'ATS Clean' | 'Executive' | 'Creative' | 'Modern' | 'Technical';
  description: string;
  hasPhoto: boolean;
  badge: string;
  recommendedRole: string;
  previewColor: string;
}
