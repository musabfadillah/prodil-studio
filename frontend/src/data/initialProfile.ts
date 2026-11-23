import { MasterProfile, CVDesignConfig, CoverLetterData } from '../types/cv';

export const initialMasterProfile: MasterProfile = {
  hiddenFields: {},
  sectionOrder: ["summary", "experience", "projects", "education", "skills", "achievements", "objective", "languages", "certifications"],
  visibleSections: {
    summary: true,
    experience: true,
    projects: true,
    education: true,
    skills: true,
    achievements: true,
    objective: true,
    languages: true,
    certifications: true,
  },
  customSections: [],
  personal: {
    fullName: "Alex Morgan",
    headline: "Product Designer & Senior Frontend Developer",
    email: "alex.morgan@prodilstudio.com",
    phone: "+62 812 3456 7890",
    location: "Jakarta, Indonesia",
    website: "https://alexmorgan.dev",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    socials: [
      { platform: "LinkedIn", url: "https://linkedin.com/in/alexmorgan" },
      { platform: "GitHub", url: "https://github.com/alexmorgan" },
      { platform: "Behance", url: "https://behance.net/alexmorgan" }
    ]
  },
  summaries: [
    {
      id: "sum-main",
      label: "ATS Tech & Product (Recommended)",
      text: "Passionate Product Designer and Senior Frontend Developer with 5+ years of hands-on experience building modern, accessible web applications and robust design systems. Specialized in React, TypeScript, and high-conversion UX workflows that increased digital retention by 35% across 500K+ active users."
    },
    {
      id: "sum-freelance",
      label: "Creative & Freelance",
      text: "Creative design technologist partnering with global startups and enterprise brands to build interactive digital products, seamless branding identities, and high-performance web experiences."
    }
  ],
  experiences: [
    {
      id: "exp-1",
      role: "Senior Frontend Engineer",
      company: "Tech Studio Nusantara",
      location: "Jakarta, Indonesia",
      startDate: "Jan 2022",
      endDate: "Present",
      current: true,
      description: "• Architected high-performance responsive web platforms using React, TypeScript, and Tailwind CSS.\n• Reduced Core Web Vitals LCP by 45% and improved checkout conversion rate by 22%.\n• Spearheaded the company-wide UI component library, cutting sprint feature delivery time by 30%.\n• Mentored 8 junior developers on clean code principles and unit test coverage."
    },
    {
      id: "exp-2",
      role: "UI/UX & Frontend Developer",
      company: "Creative Digital Media",
      location: "Bandung, Indonesia",
      startDate: "Mar 2020",
      endDate: "Dec 2021",
      current: false,
      description: "• Collaborated with product managers to design interactive user journeys in Figma for over 500K+ mobile and web users.\n• Developed reusable React components and integrated REST/GraphQL APIs with sub-second response times.\n• Automated regression testing, resulting in a 40% reduction in production bug reports."
    },
    {
      id: "exp-3",
      role: "Junior Web Developer",
      company: "Solusi Global Interaktif",
      location: "Surabaya, Indonesia",
      startDate: "Jul 2018",
      endDate: "Feb 2020",
      current: false,
      description: "• Built client landing pages and e-commerce portals using modern JavaScript, HTML5, and CSS3.\n• Implemented SEO best practices that propelled top 3 search rankings for key industry keywords."
    }
  ],
  educations: [
    {
      id: "edu-1",
      degree: "Bachelor of Computer Science (S.Kom)",
      institution: "Universitas Indonesia",
      location: "Depok, Indonesia",
      startDate: "2015",
      endDate: "2019",
      gpa: "3.84 / 4.00",
      achievements: "Graduated with Honors (Cum Laude). President of Informatics Student Society."
    }
  ],
  projects: [
    {
      id: "proj-1",
      title: "Prodil Studio Web Suite",
      role: "Lead Creator / Developer",
      client: "Prodil Brand",
      metrics: "50K+ Monthly Active Users",
      link: "https://prodil.studio",
      description: "All-in-one career and personal document studio featuring 15 ATS resume templates, live vector PDF export, and Google Gemini AI Assistant."
    },
    {
      id: "proj-2",
      title: "Fintech Biometric Mobile App",
      role: "Lead UI/UX Designer",
      client: "Digital Bank Indonesia",
      metrics: "4.9/5 Rating on App Store",
      link: "https://alexmorgan.dev/fintech",
      description: "End-to-end UX architecture and design system for digital banking onboarding and instant QRIS payment features."
    }
  ],
  skills: [
    "React.js", "TypeScript", "Tailwind CSS", "Next.js", "Node.js", "Express.js",
    "PostgreSQL", "UI/UX Design", "Figma", "REST APIs", "Git & CI/CD", "Gemini AI"
  ],
  languages: [
    { name: "Indonesian", level: "Native" },
    { name: "English", level: "Professional Working Proficiency (TOEFL 610)" }
  ],
  certifications: [
    { name: "Google Cloud Certified Professional Cloud Architect", issuer: "Google Cloud", year: "2024" },
    { name: "Meta Frontend Developer Professional Certificate", issuer: "Meta / Coursera", year: "2023" }
  ]
};

export const johnSmithProfile: MasterProfile = {
  ...initialMasterProfile,
  personal: {
    ...initialMasterProfile.personal,
    fullName: 'John Smith',
    headline: 'Food & Beverage Professional',
    email: 'john.smith@email.com',
    phone: '+1 (415) 555-0138',
    location: 'San Francisco, CA',
    website: 'johnsmith.com',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    socials: [
      { platform: 'LinkedIn', url: 'linkedin.com/in/johnsmith' },
    ],
  },
  summaries: [{
    id: 'john-summary',
    label: 'Product Leadership',
    text: 'Food and beverage professional with 8+ years of experience leading restaurant operations, menu development, guest experience, and high-performing service teams. Known for consistent quality, cost control, and delivering measurable revenue growth across premium hospitality concepts.',
  }],
  experiences: initialMasterProfile.experiences.map((item, index) => ({
    ...item,
    id: `john-exp-${index + 1}`,
    role: ['Executive Chef', 'Restaurant Operations Manager', 'Food & Beverage Supervisor'][index] || item.role,
    company: ['The Golden Table', 'Azure Hospitality Group', 'Harbor & Vine'][index] || item.company,
    location: ['San Francisco, CA', 'Oakland, CA', 'San Francisco, CA'][index] || item.location,
    description: [
      '• Directed a 42-person culinary operation, improving guest satisfaction scores by 18% and maintaining target food cost below 28%.',
      '• Led multi-site restaurant operations across service, procurement, training, and quality control; increased repeat bookings by 24%.',
      '• Supervised floor and bar service for premium dining events and built standard operating procedures for new hires.',
    ][index] || item.description,
  })),
};

export const initialCVDesignConfig: CVDesignConfig = {
  themeId: 1,
  accentColor: "",
  fontFamily: "Plus Jakarta Sans",
  showPhoto: true,
  fontSize: "normal",
  activeSummaryId: "sum-main",
  sectionOrder: ["summary", "experience", "projects", "education", "skills", "achievements", "objective", "languages", "certifications"],
  hiddenSections: [],
  visibleSections: {
    summary: true,
    experience: true,
    projects: true,
    education: true,
    skills: true,
    achievements: true,
    objective: true,
    languages: true,
    certifications: true,
  }
};

export const initialCoverLetterData: CoverLetterData = {
  recipientName: "Hiring Team",
  recipientTitle: "Director of Talent Acquisition",
  companyName: "Google / GoTo Global",
  companyAddress: "Pacific Century Place, SCBD Jakarta",
  jobTitle: "Senior Product Designer & Frontend Specialist",
  date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  subject: "Application for Senior Product Designer & Frontend Specialist - Alex Morgan",
  letterBody: `Dear Hiring Team,

I am writing to express my strong interest in the Senior Product Designer & Frontend Specialist position at your esteemed organization. With over 5 years of proven experience combining high-fidelity UI/UX design with robust React and TypeScript engineering, I am eager to contribute to your team's mission of creating world-class digital experiences.

In my current role at Tech Studio Nusantara, I spearheaded frontend architecture transformations that enhanced core conversion rates by 22% while reducing web performance loading times by 45%. I work directly at the intersection of Figma design systems and production-grade code, ensuring that every user interface is both visually captivating and technically scalable.

What excites me most about your company is your unrelenting focus on engineering excellence and human-centered design. I am confident that my background in responsive frontend systems, modern state architecture, and cross-functional team leadership will bring tangible value to your upcoming product milestones.

Thank you for your time and consideration. I welcome the opportunity to discuss in greater detail how my skills and passions align with your team's goals.

Sincerely,

Alex Morgan`,
  accentColor: "#2563eb"
};