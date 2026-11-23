import express from 'express';
import db from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Default initial Master Profile data
const defaultProfile = {
  personal: {
    fullName: "Alex Morgan",
    headline: "Product Designer & Frontend Developer",
    email: "alex.morgan@prodil.dev",
    phone: "+62 812 3456 7890",
    location: "Jakarta, Indonesia",
    website: "https://alexmorgan.dev",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    socials: [
      { platform: "LinkedIn", url: "https://linkedin.com/in/alexmorgan" },
      { platform: "GitHub", url: "https://github.com/alexmorgan" }
    ]
  },
  summaries: [
    {
      id: "sum-tech",
      label: "Tech & Frontend",
      text: "Passionate Product Designer and Frontend Developer with 4+ years of hands-on experience building modern web applications, scalable design systems, and intuitive user experiences. Proven track record of improving user conversion by 35% and collaborating with cross-functional global teams."
    }
  ],
  experiences: [
    {
      id: "exp-1",
      role: "Senior Frontend Developer",
      company: "Tech Studio Nusantara",
      location: "Jakarta, Indonesia",
      startDate: "2022",
      endDate: "Present",
      current: true,
      description: "• Architected and developed high-performance responsive web applications using React, TypeScript, and Tailwind CSS.\n• Collaborated directly with cross-functional design and backend teams to cut latency by 40%.\n• Mentored 6 junior engineers and established automated code review workflows."
    },
    {
      id: "exp-2",
      role: "UI/UX & Product Designer",
      company: "Creative Digital Media",
      location: "Bandung, Indonesia",
      startDate: "2020",
      endDate: "2022",
      current: false,
      description: "• Designed intuitive mobile and web user interfaces for fintech clients reaching over 500,000 active users.\n• Conducted user research, wireframing, and interactive prototyping on Figma.\n• Formulated a design system component library adopted company-wide."
    }
  ],
  educations: [
    {
      id: "edu-1",
      degree: "Bachelor of Computer Science",
      institution: "Universitas Indonesia",
      location: "Depok, Indonesia",
      startDate: "2016",
      endDate: "2020",
      gpa: "3.82 / 4.00",
      achievements: "Graduated with Honors, Head of Web Development Student Club"
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
      description: "Comprehensive modern career & creative identity platform featuring 15 ATS resume templates and live vector PDF export."
    },
    {
      id: "proj-2",
      title: "Fintech Mobile Banking Experience",
      role: "UI/UX Lead",
      client: "Digital Bank Indonesia",
      metrics: "4.9/5 Rating on App Store",
      link: "https://behance.net/gallery/example",
      description: "Redesigned biometric onboarding and transaction flow, reducing friction drop-off by 28%."
    }
  ],
  skills: [
    "React.js", "TypeScript", "Tailwind CSS", "Node.js", "Express.js", 
    "PostgreSQL", "Next.js", "UI/UX Design", "Figma", "Git & CI/CD"
  ],
  languages: [
    { name: "Indonesian", level: "Native" },
    { name: "English", level: "Professional Working Proficiency" }
  ],
  certifications: [
    { name: "Google Professional Cloud Architect", issuer: "Google Cloud", year: "2024" }
  ]
};

/**
 * GET /api/profile
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    if (db.getDbStatus().postgresConnected) {
      const result = await db.query('SELECT * FROM master_profiles WHERE user_id = $1', [userId]);
      if (result && result.rows.length > 0) {
        const row = result.rows[0];
        return res.json({
          success: true,
          isGuest: false,
          data: {
            personal: row.personal_info || defaultProfile.personal,
            socials: row.socials || defaultProfile.personal.socials,
            summaries: row.summaries || defaultProfile.summaries,
            experiences: row.experiences || defaultProfile.experiences,
            projects: row.projects || defaultProfile.projects,
            educations: row.educations || defaultProfile.educations,
            skills: row.skills || defaultProfile.skills,
            languages: row.languages || defaultProfile.languages,
            certifications: row.custom_sections || defaultProfile.certifications
          }
        });
      }
    } else {
      const saved = db.localStore.master_profiles[userId];
      if (saved) {
        return res.json({
          success: true,
          isGuest: false,
          data: saved
        });
      }
    }

    // Default with user's name/email
    const customizedDefault = JSON.parse(JSON.stringify(defaultProfile));
    if (req.user.fullName || req.user.full_name) {
      customizedDefault.personal.fullName = req.user.fullName || req.user.full_name;
    }
    if (req.user.email) {
      customizedDefault.personal.email = req.user.email;
    }

    res.json({
      success: true,
      isGuest: false,
      data: customizedDefault
    });
  } catch (err) {
    console.error('[Get Profile Error]:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil profile: ' + err.message });
  }
});

/**
 * PUT /api/profile
 * Upsert user's Master Profile in PostgreSQL
 */
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    if (!profileData || !profileData.personal) {
      return res.status(400).json({ success: false, message: 'Format data profil tidak valid.' });
    }

    if (db.getDbStatus().postgresConnected) {
      await db.query(`
        INSERT INTO master_profiles (
          user_id, personal_info, socials, summaries, experiences, 
          projects, educations, skills, languages, custom_sections, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          personal_info = EXCLUDED.personal_info,
          socials = EXCLUDED.socials,
          summaries = EXCLUDED.summaries,
          experiences = EXCLUDED.experiences,
          projects = EXCLUDED.projects,
          educations = EXCLUDED.educations,
          skills = EXCLUDED.skills,
          languages = EXCLUDED.languages,
          custom_sections = EXCLUDED.custom_sections,
          updated_at = NOW()
      `, [
        userId,
        JSON.stringify(profileData.personal || {}),
        JSON.stringify(profileData.socials || profileData.personal?.socials || []),
        JSON.stringify(profileData.summaries || []),
        JSON.stringify(profileData.experiences || []),
        JSON.stringify(profileData.projects || []),
        JSON.stringify(profileData.educations || []),
        JSON.stringify(profileData.skills || []),
        JSON.stringify(profileData.languages || []),
        JSON.stringify(profileData.certifications || [])
      ]);
    } else {
      db.localStore.master_profiles[userId] = profileData;
      db.localStore.save();
    }

    res.json({
      success: true,
      message: 'Master Profile berhasil disimpan dan disinkronkan ke cloud!'
    });
  } catch (err) {
    console.error('[Update Profile Error]:', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan profil: ' + err.message });
  }
});

export default router;
