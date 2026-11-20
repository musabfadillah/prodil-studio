import express from 'express';
import db from '../config/db.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate slug
function generateSlug(title) {
  const clean = (title || 'cv')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const rand = Math.random().toString(36).substring(2, 7);
  return `${clean}-${rand}`;
}

/**
 * GET /api/documents/cv
 * List all CV configurations for logged in user
 */
router.get('/cv', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (db.getDbStatus().postgresConnected) {
      const result = await db.query(
        'SELECT * FROM cv_documents WHERE user_id = $1 ORDER BY updated_at DESC',
        [userId]
      );
      return res.json({ success: true, data: result.rows });
    } else {
      const userDocs = Object.values(db.localStore.cv_documents)
        .filter(doc => doc.user_id === userId);
      return res.json({ success: true, data: userDocs });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil dokumen CV: ' + err.message });
  }
});

/**
 * POST /api/documents/cv
 * Create or save CV document configuration
 */
router.post('/cv', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, title, themeId, accentColor, fontFamily, customConfig, sectionOrder, isPublic } = req.body;

    const docId = id || `cv-${Date.now()}`;
    const docTitle = title || 'Untitled CV';
    const slug = generateSlug(docTitle);

    if (db.getDbStatus().postgresConnected) {
      await db.query(`
        INSERT INTO cv_documents (
          id, user_id, title, theme_id, accent_color, font_family,
          custom_config, section_order, is_public, public_slug, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          theme_id = EXCLUDED.theme_id,
          accent_color = EXCLUDED.accent_color,
          font_family = EXCLUDED.font_family,
          custom_config = EXCLUDED.custom_config,
          section_order = EXCLUDED.section_order,
          is_public = EXCLUDED.is_public,
          updated_at = NOW()
      `, [
        docId,
        userId,
        docTitle,
        themeId || 1,
        accentColor || '#2563eb',
        fontFamily || 'Plus Jakarta Sans',
        JSON.stringify(customConfig || {}),
        JSON.stringify(sectionOrder || []),
        isPublic || false,
        slug
      ]);
    } else {
      db.localStore.cv_documents[docId] = {
        id: docId,
        user_id: userId,
        title: docTitle,
        theme_id: themeId || 1,
        accent_color: accentColor || '#2563eb',
        font_family: fontFamily || 'Plus Jakarta Sans',
        custom_config: customConfig || {},
        section_order: sectionOrder || [],
        is_public: isPublic || false,
        public_slug: slug,
        updated_at: new Date().toISOString()
      };
      db.localStore.save();
    }

    res.json({
      success: true,
      message: 'CV tersimpan di cloud!',
      data: { id: docId, slug }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menyimpan CV: ' + err.message });
  }
});

/**
 * GET /api/documents/cover-letter
 */
router.get('/cover-letter', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (db.getDbStatus().postgresConnected) {
      const result = await db.query(
        'SELECT * FROM cover_letters WHERE user_id = $1 ORDER BY updated_at DESC',
        [userId]
      );
      return res.json({ success: true, data: result.rows });
    } else {
      const letters = Object.values(db.localStore.cover_letters)
        .filter(l => l.user_id === userId);
      return res.json({ success: true, data: letters });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil Cover Letter: ' + err.message });
  }
});

/**
 * POST /api/documents/cover-letter
 */
router.post('/cover-letter', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, title, recipientName, recipientTitle, companyName, jobTitle, letterBody, accentColor } = req.body;

    const letterId = id || `cl-${Date.now()}`;

    if (db.getDbStatus().postgresConnected) {
      await db.query(`
        INSERT INTO cover_letters (
          id, user_id, title, recipient_name, recipient_title, company_name,
          job_title, letter_body, accent_color, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          recipient_name = EXCLUDED.recipient_name,
          recipient_title = EXCLUDED.recipient_title,
          company_name = EXCLUDED.company_name,
          job_title = EXCLUDED.job_title,
          letter_body = EXCLUDED.letter_body,
          accent_color = EXCLUDED.accent_color,
          updated_at = NOW()
      `, [
        letterId,
        userId,
        title || 'Application Letter',
        recipientName || 'Hiring Manager',
        recipientTitle || 'Talent Acquisition',
        companyName || 'Target Company',
        jobTitle || 'Position',
        letterBody || '',
        accentColor || '#2563eb'
      ]);
    } else {
      db.localStore.cover_letters[letterId] = {
        id: letterId,
        user_id: userId,
        title: title || 'Application Letter',
        recipient_name: recipientName || 'Hiring Manager',
        recipient_title: recipientTitle || 'Talent Acquisition',
        company_name: companyName || 'Target Company',
        job_title: jobTitle || 'Position',
        letter_body: letterBody || '',
        accent_color: accentColor || '#2563eb',
        updated_at: new Date().toISOString()
      };
      db.localStore.save();
    }

    res.json({ success: true, message: 'Cover Letter berhasil disimpan!', data: { id: letterId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menyimpan Cover Letter: ' + err.message });
  }
});

export default router;
