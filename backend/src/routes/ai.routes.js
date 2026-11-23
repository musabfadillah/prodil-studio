import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { authenticateToken } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import db from '../config/db.js';

dotenv.config();

const router = express.Router();

// Multer memory storage for file uploads up to 10MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const parseGeneratedJson = (text) => {
  const cleaned = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned);
};

/**
 * Log AI Usage
 */
const logAiUsage = async (userId, feature, tokens = 100) => {
  try {
    if (db.getDbStatus().postgresConnected) {
      await db.query(
        'INSERT INTO ai_usage_logs (user_id, feature, tokens_used) VALUES ($1, $2, $3)',
        [userId || null, feature, tokens]
      );
    }
  } catch (err) {
    console.warn('[AI Log Warning]:', err.message);
  }
};

router.post('/generate', authenticateToken, aiLimiter, async (req, res) => {
  const { action, payload = {} } = req.body || {};
  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({ error: 'Gemini API key belum dikonfigurasi di server.' });
  }
  if (!['summary', 'rewrite-bullets', 'cover-letter', 'ats-match'].includes(action)) {
    return res.status(400).json({ error: 'Aksi AI tidak dikenali.' });
  }

  try {
    let result;
    if (action === 'summary') {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a concise, ATS-friendly professional summary in ${payload.language || 'English'} (3-4 sentences, active voice).
Role: ${payload.headline || payload.role || 'Professional'}
Experience: ${payload.yearsOfExperience || ''}
Skills and experience context: ${payload.context || payload.keySkills || ''}
Industry: ${payload.targetIndustry || ''}
Tone: ${payload.tone || 'Professional'}
Return only the summary paragraph.`,
      });
      result = (response.text || '').trim();
      if (!result) throw new Error('Gemini returned an empty summary.');
    } else if (action === 'rewrite-bullets') {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Rewrite the work notes in ${payload.language || 'English'} into 3-5 concise, truthful, ATS-friendly bullet points. Do not invent metrics; preserve facts and use measurable details only when provided.
Role: ${payload.role || ''}
Company: ${payload.company || ''}
Notes:\n${payload.rawBullets || ''}
${payload.jobDescription ? `Job description:\n${payload.jobDescription}` : ''}
Return JSON only with shape {"bullets":["..."]}.`,
        config: { responseMimeType: 'application/json', temperature: 0.4 },
      });
      const parsed = parseGeneratedJson(response.text);
      result = Array.isArray(parsed.bullets) ? parsed.bullets : [];
    } else if (action === 'cover-letter') {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a tailored, concise cover letter in ${payload.language || 'English'}.
Candidate: ${payload.fullName || ''}
Role: ${payload.targetRole || ''}
Company: ${payload.companyName || ''}
Recipient: ${payload.recipientName || 'Hiring Manager'}
Profile context: ${payload.profileContext || ''}
Job description: ${payload.jobDescription || ''}
Return only the letter body.`,
      });
      result = (response.text || '').trim();
      if (!result) throw new Error('Gemini returned an empty cover letter.');
    } else {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Compare the candidate profile against the job description. Write all returned keywords and suggestions in ${payload.language || 'English'} when language-specific text is needed. Return valid JSON only:
{"score":0,"matchedKeywords":[],"missingKeywords":[],"suggestions":[]}
Use score 0-100 and give three practical suggestions.
Candidate profile:\n${payload.cvText || ''}
Job description:\n${payload.jobDescription || ''}`,
        config: { responseMimeType: 'application/json', temperature: 0.2 },
      });
      const parsed = parseGeneratedJson(response.text);
      result = {
        score: Math.max(0, Math.min(100, Number(parsed.score ?? parsed.matchScore) || 0)),
        matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : [],
        missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      };
    }

    await logAiUsage(req.user.id, `generate-${action}`);
    return res.json({ result });
  } catch (err) {
    console.error(`[AI Generate Error:${action}]:`, err);
    return res.status(500).json({ error: err.message || 'Gagal memproses permintaan AI.' });
  }
});

/**
 * POST /api/ai/generate-summary
 * Generates an ATS-friendly, high-impact professional summary
 */
router.post('/generate-summary', authenticateToken, aiLimiter, async (req, res) => {
  try {
    const { role, yearsOfExperience, keySkills, targetIndustry, tone } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: 'Posisi atau peran pekerjaan wajib diisi.' });
    }

    const ai = getGeminiClient();

    if (ai) {
      const prompt = `
        Tuliskan ringkasan profesional (Professional Summary) untuk CV/Resume yang ramah sistem ATS (Applicant Tracking System).
        - Posisi/Peran: ${role}
        - Pengalaman: ${yearsOfExperience || '3+'} tahun
        - Keahlian Utama: ${keySkills || 'Leadership, problem solving, technical skills'}
        - Industri Tujuan: ${targetIndustry || 'Umum / Tech / Korporat'}
        - Nada Bahasa: ${tone || 'Profesional, berorientasi hasil, dan percaya diri'}
        
        Aturan:
        1. Tulis dalam 3-4 kalimat padat (sekitar 50-70 kata).
        2. Masukkan kata kunci teknis dan metrik hasil (impact-driven).
        3. Berikan 2 variasi opsi:
           Opsi 1: Bahasa Indonesia formal & profesional.
           Opsi 2: Bahasa Inggris (International ATS standard).
        4. Kembalikan HANYA format JSON valid berikut:
        {
          "summaryId": "sum-ai-1",
          "summaryIdLabel": "Bahasa Indonesia",
          "summaryIdText": "teks opsi 1...",
          "summaryEn": "teks opsi 2..."
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });

      const parsed = JSON.parse(response.text.trim());
      await logAiUsage(req.user.id, 'generate-summary');

      return res.json({
        success: true,
        data: parsed
      });
    }

    // High quality intelligent fallback if GEMINI_API_KEY is not yet populated
    const fallbackId = `Profesional ${role} berdedikasi dengan pengalaman ${yearsOfExperience || '3+'} tahun dalam merancang dan mengeksekusi strategi unggul. Terbukti mahir dalam ${keySkills || 'kolaborasi tim, analisis data, dan inovasi'}, dengan fokus pada peningkatan efisiensi operasional dan pertumbuhan metrik bisnis secara konsisten.`;
    const fallbackEn = `Results-oriented ${role} with ${yearsOfExperience || '3+'} years of hands-on expertise in delivering scalable solutions and driving operational efficiency. Proven mastery in ${keySkills || 'cross-functional leadership, problem solving, and modern workflows'} with a consistent track record of exceeding key performance indicators.`;

    res.json({
      success: true,
      isFallback: true,
      data: {
        summaryIdText: fallbackId,
        summaryEn: fallbackEn
      }
    });
  } catch (err) {
    console.error('[AI Summary Error]:', err);
    res.status(500).json({ success: false, message: 'Gagal membuat ringkasan AI: ' + err.message });
  }
});

/**
 * POST /api/ai/optimize-bullets
 * Rewrites work experience bullets with strong action verbs & quantifiable metrics
 */
router.post('/optimize-bullets', authenticateToken, aiLimiter, async (req, res) => {
  try {
    const { role, rawBullets, jobDescription } = req.body;

    if (!rawBullets) {
      return res.status(400).json({ success: false, message: 'Poin pengalaman kerja wajib diisi.' });
    }

    const ai = getGeminiClient();

    if (ai) {
      const prompt = `
        Sebagai pakar HR & ATS Resume Optimizer kelas dunia, ubah draft poin pengalaman kerja berikut menjadi bullet points berstandar Google XYZ Formula ("Accomplished [X], as measured by [Y], by doing [Z]").
        
        Peran: ${role || 'Professional'}
        Poin Mentah Pengguna:
        ${rawBullets}
        
        ${jobDescription ? `Target Lowongan (Job Description): ${jobDescription}` : ''}
        
        Instruksi:
        - Gunakan kata kerja aktif yang kuat (Action Verbs: Spearheaded, Architected, Accelerated, Reduced, Designed, Mentored).
        - Sisipkan angka atau metrik realistis (%, peningkatan efisiensi, nilai kuantitatif).
        - Buat 3 hingga 5 poin ringkas dan tajam.
        - Kembalikan format JSON:
        {
          "optimizedBullets": [
            "Poin 1...",
            "Poin 2...",
            "Poin 3..."
          ],
          "formattedText": "• Poin 1...\\n• Poin 2...\\n• Poin 3..."
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        }
      });

      const parsed = JSON.parse(response.text.trim());
      await logAiUsage(req.user.id, 'optimize-bullets');

      return res.json({
        success: true,
        data: parsed
      });
    }

    // High quality fallback
    const bullets = rawBullets
      .split('\n')
      .map(b => b.replace(/^[•\-\*]\s*/, '').trim())
      .filter(Boolean);

    const optimized = bullets.map(b => `• Memimpin inisiatif ${b.toLowerCase()}, meningkatkan performa tim dan mencapai efisiensi hingga 25%.`);

    res.json({
      success: true,
      isFallback: true,
      data: {
        optimizedBullets: optimized,
        formattedText: optimized.join('\n')
      }
    });
  } catch (err) {
    console.error('[AI Bullets Error]:', err);
    res.status(500).json({ success: false, message: 'Gagal mengoptimalkan poin pengalaman: ' + err.message });
  }
});

/**
 * POST /api/ai/generate-cover-letter
 * Generates tailored Cover Letter combining Master Profile with Job Target
 */
router.post('/generate-cover-letter', authenticateToken, aiLimiter, async (req, res) => {
  try {
    const { masterProfile, recipientName, companyName, jobTitle, jobDescription, tone } = req.body;

    if (!jobTitle || !companyName) {
      return res.status(400).json({ success: false, message: 'Nama Perusahaan dan Posisi Tujuan wajib diisi.' });
    }

    const ai = getGeminiClient();
    const candidateName = masterProfile?.personal?.fullName || req.user?.fullName || 'Alex Morgan';
    const skillsList = masterProfile?.skills?.join(', ') || 'Modern Development, Project Management, Communication';

    if (ai) {
      const prompt = `
        Tuliskan Surat Lamaran Kerja (Cover Letter) profesional, memikat, dan ramah ATS untuk:
        - Kandidat: ${candidateName}
        - Posisi Dilamar: ${jobTitle}
        - Perusahaan Tujuan: ${companyName}
        - Ditujukan Kepada: ${recipientName || 'Hiring Manager'}
        - Ringkasan Pengalaman: ${masterProfile?.summaries?.[0]?.text || 'Berpengalaman dalam pengembangan produk dan inovasi'}
        - Keahlian Utama: ${skillsList}
        - Detail Lowongan: ${jobDescription || 'Mencari kandidat berbakat yang mampu mendorong pertumbuhan perusahaan.'}
        - Nada: ${tone || 'Formal, antusias, dan persuasif'}
        
        Format surat:
        - Tanggal & salam pembuka
        - Paragraf 1: Pengenalan diri dan posisi yang dilamar dengan antusiasme yang relevan.
        - Paragraf 2: Sorotan prestasi kunci dan kecocokan keahlian dengan kebutuhan perusahaan.
        - Paragraf 3: Nilai tambah yang bisa diberikan dan komitmen terhadap visi perusahaan.
        - Paragraf 4: Call-to-action (permintaan wawancara/diskusi lebih lanjut) dan salam penutup.
        
        Kembalikan JSON:
        {
          "recipientName": "${recipientName || 'Hiring Manager'}",
          "companyName": "${companyName}",
          "jobTitle": "${jobTitle}",
          "subject": "Application for ${jobTitle} - ${candidateName}",
          "letterBody": "Isi lengkap surat...",
          "keyHighlights": ["Highlight 1", "Highlight 2"]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });

      const parsed = JSON.parse(response.text.trim());
      await logAiUsage(req.user.id, 'generate-cover-letter');

      return res.json({
        success: true,
        data: parsed
      });
    }

    // Dynamic clean fallback
    const today = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const fallbackBody = `Kepada Yth. ${recipientName || 'Hiring Manager'},\n${companyName}\n\nDengan hormat,\n\nSehubungan dengan informasi lowongan pekerjaan untuk posisi ${jobTitle} di ${companyName}, saya bermaksud untuk mengajukan diri guna berkontribusi secara nyata di perusahaan yang Bapak/Ibu pimpin.\n\nDengan latar belakang di bidang ${masterProfile?.personal?.headline || 'Pengembangan Produk & Teknologi'} dan rekam jejak dalam ${skillsList}, saya telah berhasil memimpin dan menyelesaikan berbagai proyek strategis yang berorientasi pada hasil dan efisiensi tinggi. Saya meyakini bahwa keahlian ini sejalan dengan kriteria yang dibutuhkan oleh ${companyName}.\n\nBesar harapan saya untuk diberikan kesempatan mendiskusikan kualifikasi saya lebih lanjut dalam sesi wawancara. Terlampir saya sertakan CV dan dokumen pendukung untuk bahan pertimbangan.\n\nAtas perhatian dan kesempatan yang diberikan, saya ucapkan terima kasih.\n\nHormat saya,\n${candidateName}`;

    res.json({
      success: true,
      isFallback: true,
      data: {
        recipientName: recipientName || 'Hiring Manager',
        companyName,
        jobTitle,
        subject: `Application for ${jobTitle} - ${candidateName}`,
        letterBody: fallbackBody
      }
    });
  } catch (err) {
    console.error('[AI Cover Letter Error]:', err);
    res.status(500).json({ success: false, message: 'Gagal membuat Cover Letter: ' + err.message });
  }
});

/**
 * POST /api/ai/smart-import
 * Parses an existing PDF or DOCX resume and extracts Master Profile JSON
 */
router.post('/smart-import', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    let extractedText = '';

    if (req.file) {
      const mime = req.file.mimetype;
      const originalName = req.file.originalname.toLowerCase();

      if (mime === 'application/pdf' || originalName.endsWith('.pdf')) {
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text;
      } else if (
        mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        originalName.endsWith('.docx')
      ) {
        const docxData = await mammoth.extractRawText({ buffer: req.file.buffer });
        extractedText = docxData.value;
      } else {
        // Plain text or json
        extractedText = req.file.buffer.toString('utf-8');
      }
    } else if (req.body.rawText) {
      extractedText = req.body.rawText;
    } else {
      return res.status(400).json({
        success: false,
        message: 'File (.pdf, .docx) atau teks CV lama wajib disertakan.'
      });
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat membaca teks dari file yang diunggah. Pastikan file tidak terkunci atau berupa gambar murni.'
      });
    }

    const ai = getGeminiClient();

    if (ai) {
      const prompt = `
        Kamu adalah sistem AI CV Parser kelas dunia. Ekstrak teks CV berikut menjadi format data Master Profile JSON terstruktur yang valid.
        
        Teks CV Unggahan:
        """
        ${extractedText.substring(0, 8000)}
        """
        
        Aturan ekstraksi:
        1. Ekstrak data diri (fullName, headline, email, phone, location, website).
        2. Ekstrak ringkasan profesional (summary).
        3. Ekstrak daftar pengalaman kerja (experiences: role, company, location, startDate, endDate, description).
        4. Ekstrak pendidikan (educations: degree, institution, location, startDate, endDate, gpa).
        5. Ekstrak skills (daftar keahlian teknis & soft skills).
        6. Ekstrak proyek (projects: title, role, description).
        7. Ekstrak bahasa (languages: name, level).
        
        Format output JSON persis seperti ini:
        {
          "personal": {
            "fullName": "...",
            "headline": "...",
            "email": "...",
            "phone": "...",
            "location": "...",
            "website": "..."
          },
          "summaries": [
            { "id": "sum-1", "label": "Default Summary", "text": "..." }
          ],
          "experiences": [
            {
              "id": "exp-1",
              "role": "...",
              "company": "...",
              "location": "...",
              "startDate": "...",
              "endDate": "...",
              "current": false,
              "description": "..."
            }
          ],
          "educations": [
            {
              "id": "edu-1",
              "degree": "...",
              "institution": "...",
              "location": "...",
              "startDate": "...",
              "endDate": "...",
              "gpa": "..."
            }
          ],
          "skills": ["Skill 1", "Skill 2"],
          "projects": [
            { "id": "proj-1", "title": "...", "role": "...", "description": "..." }
          ],
          "languages": [
            { "name": "...", "level": "..." }
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        }
      });

      const parsedJson = JSON.parse(response.text.trim());
      await logAiUsage(req.user.id, 'smart-import', 500);

      return res.json({
        success: true,
        message: 'Berhasil mengekstrak data CV dengan Gemini AI!',
        parsedProfile: parsedJson,
        data: parsedJson
      });
    }

    // Heuristic fallback parser if API key is not yet set
    const emailMatch = extractedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = extractedText.match(/(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/);
    const lines = extractedText.split('\n').map(l => l.trim()).filter(Boolean);

    const heuristicData = {
      personal: {
        fullName: lines[0] || 'Kandidat Profesional',
        headline: lines[1] || 'Professional Specialist',
        email: emailMatch ? emailMatch[0] : 'user@example.com',
        phone: phoneMatch ? phoneMatch[0] : '+62 812 3456 7890',
        location: 'Indonesia',
        website: ''
      },
      summaries: [
        {
          id: 'sum-imported',
          label: 'Imported Summary',
          text: lines.slice(2, 5).join(' ') || 'Profesional berpengalaman dengan komitmen kerja tinggi.'
        }
      ],
      experiences: [
        {
          id: 'exp-imported-1',
          role: lines[1] || 'Senior Role',
          company: 'Perusahaan Terkemuka',
          location: 'Jakarta',
          startDate: '2021',
          endDate: 'Present',
          current: true,
          description: lines.slice(5, 9).join('\n• ') || '• Bertanggung jawab atas pengembangan dan eksekusi tugas utama.'
        }
      ],
      educations: [
        {
          id: 'edu-imported-1',
          degree: 'Sarjana (S1)',
          institution: 'Universitas Terkemuka',
          location: 'Indonesia',
          startDate: '2017',
          endDate: '2021',
          gpa: '3.75'
        }
      ],
      skills: ['Leadership', 'Problem Solving', 'Strategic Planning', 'Communication', 'Project Management'],
      projects: [],
      languages: [{ name: 'Indonesian', level: 'Native' }, { name: 'English', level: 'Conversational' }]
    };

    res.json({
      success: true,
      isFallback: true,
      message: 'CV diekstrak dengan Heuristic Parser. Masukkan GEMINI_API_KEY di VPS Hostinger untuk akurasi AI maksimal.',
      parsedProfile: heuristicData,
      data: heuristicData
    });
  } catch (err) {
    console.error('[Smart Import Error]:', err);
    res.status(500).json({ success: false, message: 'Gagal memproses file: ' + err.message });
  }
});

export default router;
