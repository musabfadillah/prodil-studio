import express from 'express';
import { randomUUID } from 'crypto';
import db from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const templateIds = [
  'ats-classic', 'ats-executive', 'corporate-letterhead', 'emerald-minimal',
  'ivy-league', 'hospitality-warm', 'luxury-gold', 'dark-sidebar',
  'creative-visual', 'editorial-split', 'right-sidebar', 'vertical-monolith',
  'signature-edition', 'tech-terminal', 'dark-badge',
];
const defaultSections = ['summary', 'experience', 'projects', 'education', 'skills', 'achievements'];

const defaultProfile = (user = {}) => ({
  personal: {
    fullName: user.fullName || user.full_name || 'Profil Pengguna',
    headline: '',
    email: user.email || '',
    phone: '',
    location: '',
    website: '',
    photoUrl: user.avatarUrl || user.avatar_url || '',
    socials: [],
  },
  summaries: [],
  experiences: [],
  educations: [],
  projectsAndWorks: [],
  skills: [],
  languages: [],
  achievements: [],
  careerObjective: '',
});

function profileFromRow(row, user) {
  if (!row) return defaultProfile(user);
  const personal = row.personal_info || row.personal || {};
  const projects = row.projectsAndWorks || row.projects || [];
  const languages = row.languages || [];
  return {
    ...defaultProfile(user),
    personal: { ...defaultProfile(user).personal, ...personal, socials: row.socials || personal.socials || [] },
    summaries: row.summaries || [],
    experiences: (row.experiences || []).map((item) => ({
      ...item,
      period: item.period || [item.startDate, item.current ? 'Present' : item.endDate].filter(Boolean).join(' – '),
      bullets: item.bullets || (item.description || '').split('\n').filter(Boolean),
    })),
    educations: (row.educations || []).map((item) => ({
      ...item,
      period: item.period || [item.startDate, item.endDate].filter(Boolean).join(' – '),
    })),
    projectsAndWorks: projects.map((item) => ({
      ...item,
      clientOrBrand: item.clientOrBrand || item.client || '',
      metrics: item.metrics || '',
    })),
    skills: row.skills || [],
    languages: languages.map((item) => typeof item === 'string' ? item : `${item.name}${item.level ? ` (${item.level})` : ''}`),
    languageDetails: languages.filter((item) => typeof item !== 'string'),
    certifications: row.custom_sections || row.certifications || [],
    achievements: row.achievements || [],
    careerObjective: row.career_objective || row.careerObjective || '',
  };
}

function profileColumns(profile) {
  return [
    JSON.stringify(profile.personal),
    JSON.stringify(profile.personal.socials || []),
    JSON.stringify(profile.summaries || []),
    JSON.stringify(profile.experiences || []),
    JSON.stringify(profile.projectsAndWorks || []),
    JSON.stringify(profile.educations || []),
    JSON.stringify(profile.skills || []),
    JSON.stringify(profile.languageDetails?.length ? profile.languageDetails : profile.languages || []),
    JSON.stringify(profile.certifications || []),
    JSON.stringify(profile.achievements || []),
    profile.careerObjective || '',
  ];
}

function mapCv(row) {
  const config = row.custom_config || {};
  const legacyId = Number(row.theme_id) || 1;
  return {
    id: row.id,
    title: row.title,
    templateId: config.templateId || templateIds[legacyId - 1] || templateIds[0],
    accentColor: row.accent_color || '#2563EB',
    fontFamily: row.font_family || 'Plus Jakarta Sans',
    fontSize: config.fontSize || 'normal',
    showPhoto: config.showPhoto !== false,
    sectionOrder: row.section_order || defaultSections,
    hiddenSections: config.hiddenSections || [],
    activeSummaryId: config.activeSummaryId || 'sum-1',
    isDefault: Boolean(config.isDefault),
  };
}

function mapLetter(row) {
  return {
    id: row.id,
    title: row.title,
    recipientName: row.recipient_name || 'Hiring Manager',
    recipientTitle: row.recipient_title || '',
    companyName: row.company_name || '',
    companyAddress: row.company_address || '',
    targetRole: row.job_title || '',
    date: row.letter_date || '',
    subject: row.subject || '',
    bodyText: row.letter_body || '',
    templateAccent: row.accent_color || '#2563EB',
  };
}

async function loadCvs(userId) {
  if (db.getDbStatus().postgresConnected) {
    const result = await db.query('SELECT * FROM cv_documents WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
    return result.rows.map(mapCv);
  }
  return Object.values(db.localStore.cv_documents)
    .filter((row) => String(row.user_id) === String(userId))
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
    .map(mapCv);
}

async function createCv(userId, payload) {
  const id = `cv-${randomUUID()}`;
  const templateId = templateIds.includes(payload.templateId) ? payload.templateId : templateIds[0];
  const config = {
    templateId,
    fontSize: payload.fontSize || 'normal',
    showPhoto: payload.showPhoto !== false,
    hiddenSections: payload.hiddenSections || [],
    activeSummaryId: payload.activeSummaryId || 'sum-1',
    isDefault: Boolean(payload.isDefault),
  };
  const legacyId = templateIds.indexOf(templateId) + 1;
  const row = {
    id, user_id: userId, title: payload.title || 'CV Baru', theme_id: legacyId,
    accent_color: payload.accentColor || '#2563EB', font_family: payload.fontFamily || 'Plus Jakarta Sans',
    custom_config: config, section_order: payload.sectionOrder || defaultSections, updated_at: new Date().toISOString(),
  };
  if (db.getDbStatus().postgresConnected) {
    const result = await db.query(
      `INSERT INTO cv_documents (id, user_id, title, theme_id, accent_color, font_family, custom_config, section_order, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`,
      [row.id, row.user_id, row.title, row.theme_id, row.accent_color, row.font_family, JSON.stringify(config), JSON.stringify(row.section_order)]
    );
    return mapCv(result.rows[0]);
  }
  db.localStore.cv_documents[id] = row;
  db.localStore.save();
  return mapCv(row);
}

async function loadLetters(userId) {
  if (db.getDbStatus().postgresConnected) {
    const result = await db.query('SELECT * FROM cover_letters WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
    return result.rows.map(mapLetter);
  }
  return Object.values(db.localStore.cover_letters)
    .filter((row) => String(row.user_id) === String(userId))
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
    .map(mapLetter);
}

async function createLetter(userId) {
  const id = `letter-${randomUUID()}`;
  const row = {
    id, user_id: userId, title: 'Surat Lamaran Baru', recipient_name: 'Hiring Manager',
    company_name: '', job_title: '', letter_body: '', accent_color: '#2563EB',
    updated_at: new Date().toISOString(),
  };
  if (db.getDbStatus().postgresConnected) {
    const result = await db.query(
      `INSERT INTO cover_letters (id, user_id, title, recipient_name, company_name, job_title, letter_body, accent_color, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`,
      [row.id, row.user_id, row.title, row.recipient_name, row.company_name, row.job_title, row.letter_body, row.accent_color]
    );
    return mapLetter(result.rows[0]);
  }
  db.localStore.cover_letters[id] = row;
  db.localStore.save();
  return mapLetter(row);
}

router.get('/workspace', authenticateToken, async (req, res) => {
  try {
    const user = {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.fullName || req.user.full_name || '',
      avatarUrl: req.user.avatarUrl || req.user.avatar_url || '',
    };
    let profile;
    if (db.getDbStatus().postgresConnected) {
      const result = await db.query('SELECT * FROM master_profiles WHERE user_id = $1', [user.id]);
      profile = profileFromRow(result.rows[0], user);
    } else {
      profile = profileFromRow(db.localStore.master_profiles[user.id], user);
    }

    let cvs = await loadCvs(user.id);
    if (!cvs.length) cvs = [await createCv(user.id, { title: 'CV Utama', templateId: 'ats-executive', accentColor: '#2563EB', sectionOrder: defaultSections, isDefault: true })];
    let letters = await loadLetters(user.id);
    if (!letters.length) letters = [await createLetter(user.id)];
    return res.json({ user, profile, cvs, letters });
  } catch (error) {
    console.error('[Workspace Load Error]:', error);
    return res.status(500).json({ error: error.message || 'Gagal memuat workspace.' });
  }
});

router.put('/workspace/profile', authenticateToken, async (req, res) => {
  try {
    if (!req.body?.personal || typeof req.body.personal !== 'object') {
      return res.status(400).json({ error: 'Format Master Profile tidak valid.' });
    }
    const profile = profileFromRow(req.body, req.user);
    if (db.getDbStatus().postgresConnected) {
      await db.query(
        `INSERT INTO master_profiles (user_id, personal_info, socials, summaries, experiences, projects, educations, skills, languages, custom_sections, achievements, career_objective, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
         ON CONFLICT (user_id) DO UPDATE SET personal_info = EXCLUDED.personal_info, socials = EXCLUDED.socials,
         summaries = EXCLUDED.summaries, experiences = EXCLUDED.experiences, projects = EXCLUDED.projects,
         educations = EXCLUDED.educations, skills = EXCLUDED.skills, languages = EXCLUDED.languages,
         custom_sections = EXCLUDED.custom_sections, achievements = EXCLUDED.achievements,
         career_objective = EXCLUDED.career_objective, updated_at = NOW()`,
        [req.user.id, ...profileColumns(profile)]
      );
    } else {
      db.localStore.master_profiles[req.user.id] = profile;
      db.localStore.save();
    }
    return res.json({ profile });
  } catch (error) {
    console.error('[Workspace Profile Save Error]:', error);
    return res.status(500).json({ error: error.message || 'Gagal menyimpan Master Profile.' });
  }
});

router.post('/workspace/cv', authenticateToken, async (req, res) => {
  try {
    const cv = await createCv(req.user.id, req.body || {});
    return res.status(201).json({ cv });
  } catch (error) {
    console.error('[Workspace CV Create Error]:', error);
    return res.status(500).json({ error: error.message || 'Gagal membuat CV.' });
  }
});

router.put('/workspace/cv/:id', authenticateToken, async (req, res) => {
  try {
    let row;
    if (db.getDbStatus().postgresConnected) {
      const config = {
        templateId: req.body.templateId,
        fontSize: req.body.fontSize || 'normal',
        showPhoto: req.body.showPhoto !== false,
        hiddenSections: req.body.hiddenSections || [],
        activeSummaryId: req.body.activeSummaryId || 'sum-1',
        isDefault: Boolean(req.body.isDefault),
      };
      const themeId = Math.max(1, templateIds.indexOf(config.templateId) + 1);
      const result = await db.query(
        `UPDATE cv_documents SET title = $1, theme_id = $2, accent_color = $3, font_family = $4,
         custom_config = $5, section_order = $6, updated_at = NOW()
         WHERE id = $7 AND user_id = $8 RETURNING *`,
        [req.body.title || 'CV', themeId, req.body.accentColor || '#2563EB', req.body.fontFamily || 'Plus Jakarta Sans',
          JSON.stringify(config), JSON.stringify(req.body.sectionOrder || defaultSections), req.params.id, req.user.id]
      );
      row = result.rows[0];
    } else {
      const record = db.localStore.cv_documents[req.params.id];
      if (record && String(record.user_id) === String(req.user.id)) {
        const templateId = templateIds.includes(req.body.templateId) ? req.body.templateId : templateIds[0];
        Object.assign(record, {
          title: req.body.title || 'CV',
          theme_id: templateIds.indexOf(templateId) + 1,
          accent_color: req.body.accentColor || '#2563EB',
          font_family: req.body.fontFamily || 'Plus Jakarta Sans',
          custom_config: { ...req.body, templateId },
          section_order: req.body.sectionOrder || defaultSections,
          updated_at: new Date().toISOString(),
        });
        db.localStore.save();
        row = record;
      }
    }
    if (!row) return res.status(404).json({ error: 'Dokumen CV tidak ditemukan.' });
    return res.json({ cv: mapCv(row) });
  } catch (error) {
    console.error('[Workspace CV Save Error]:', error);
    return res.status(500).json({ error: error.message || 'Gagal menyimpan CV.' });
  }
});

router.delete('/workspace/cv/:id', authenticateToken, async (req, res) => {
  try {
    let deleted = false;
    if (db.getDbStatus().postgresConnected) {
      const result = await db.query('DELETE FROM cv_documents WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
      deleted = result.rowCount > 0;
    } else {
      const record = db.localStore.cv_documents[req.params.id];
      if (record && String(record.user_id) === String(req.user.id)) {
        delete db.localStore.cv_documents[req.params.id];
        db.localStore.save();
        deleted = true;
      }
    }
    if (!deleted) return res.status(404).json({ error: 'Dokumen CV tidak ditemukan.' });
    return res.json({ deleted: true });
  } catch (error) {
    console.error('[Workspace CV Delete Error]:', error);
    return res.status(500).json({ error: error.message || 'Gagal menghapus CV.' });
  }
});

router.put('/workspace/cover-letter/:id', authenticateToken, async (req, res) => {
  try {
    let row;
    if (db.getDbStatus().postgresConnected) {
      const result = await db.query(
        `UPDATE cover_letters SET title = $1, recipient_name = $2, recipient_title = $3, company_name = $4,
         company_address = $5, job_title = $6, letter_date = $7, subject = $8, letter_body = $9,
         accent_color = $10, updated_at = NOW()
         WHERE id = $11 AND user_id = $12 RETURNING *`,
        [req.body.title || 'Surat Lamaran', req.body.recipientName || '', req.body.recipientTitle || '',
          req.body.companyName || '', req.body.companyAddress || '', req.body.targetRole || '',
          req.body.date || '', req.body.subject || '', req.body.bodyText || '',
          req.body.templateAccent || '#2563EB', req.params.id, req.user.id]
      );
      row = result.rows[0];
    } else {
      const record = db.localStore.cover_letters[req.params.id];
      if (record && String(record.user_id) === String(req.user.id)) {
        Object.assign(record, {
          title: req.body.title || 'Surat Lamaran', recipient_name: req.body.recipientName || '',
          recipient_title: req.body.recipientTitle || '', company_name: req.body.companyName || '',
          company_address: req.body.companyAddress || '', job_title: req.body.targetRole || '',
          letter_date: req.body.date || '', subject: req.body.subject || '', letter_body: req.body.bodyText || '',
          accent_color: req.body.templateAccent || '#2563EB', updated_at: new Date().toISOString(),
        });
        db.localStore.save();
        row = record;
      }
    }
    if (!row) return res.status(404).json({ error: 'Cover Letter tidak ditemukan.' });
    return res.json({ letter: mapLetter(row) });
  } catch (error) {
    console.error('[Workspace Cover Letter Save Error]:', error);
    return res.status(500).json({ error: error.message || 'Gagal menyimpan Cover Letter.' });
  }
});

export default router;
