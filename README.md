# Prodil Studio v2.0
> **Craft Your Career & Creative Identity in Minutes.**  
> *All-in-One Career & Personal Document Builder — Full-Stack Prototype*

---

## 📌 Ringkasan Proyek & Solusi Evolusi
Aplikasi ini adalah evolusi dan perombakan arsitektur menyeluruh dari proyek sebelumnya (**Prodil CV Maker**). Berdasarkan hasil evaluasi mendalam dan referensi desain resmi Figma Prodil Studio, proyek ini dirancang dengan arsitektur **Hybrid Cloud**:
- **Frontend UI (Vercel)**: React + TypeScript + Tailwind CSS (Deploy gratis, instan HTTPS tanpa perlu beli custom domain).
- **Backend & Database (VPS Hostinger)**: Node.js + Express.js + PostgreSQL + Google Gemini 2.5 Flash API.
- **Brand Identity**: Logo resmi Prodil Studio (Ikon P gradient biru & tipografi modern) dipertahankan sesuai gambar lampiran.
- **Fitur Dipertahankan & Ditingkatkan**:
  - ✅ **15 Template CV Lengkap**: Seluruh 15 tema dari `prodil-cv-maker` dipertahankan 100% dan disempurnakan.
  - ✅ **Perbaikan Kritis PDF ATS**: Menggantikan `html2canvas` (screenshot gambar buram & sering crash di smartphone) dengan **Pure Vector CSS `@media print`** (100% teks asli bisa di-blok/copy, ramah mesin ATS, dan stabil di Android/iOS).
  - ✅ **Master Profile (Single Source of Truth)**: Data diri diisi sekali, otomatis sinkron ke 15 template CV & Cover Letter.
  - ✅ **Smart Import & Backup/Restore**: Import file lama (.pdf, .docx, .json) yang diekstrak otomatis oleh AI.
  - ✅ **Autentikasi Aman & Proteksi Kuota AI**: Login Google OAuth & Email/Password dengan verifikasi email 6-digit untuk menjaga kuota Gemini API dari penyalahgunaan pihak anonim.
- **Fitur Dibuang Sesuai Permintaan**:
  - ❌ Halaman & fitur Shop/Pricing, Blog CMS, Artikel, dan About page terpisah ditiadakan agar aplikasi fokus, ramping, dan bebas bug.

---

## 🏗️ Pembagian Arsitektur Cloud (Hybrid Setup)

```
┌──────────────────────────────────────────────┐
│             VERCEL (Frontend CDN)            │
│  - React 18 + TypeScript + Vite              │
│  - Tailwind CSS + Lucide Icons               │
│  - Gratis HTTPS (tanpa beli domain)          │
│  - Live Editor + 15 CV Templates             │
│  - 100% Vector Selectable PDF Generator      │
└──────────────────────┬───────────────────────┘
                       │ HTTPS API Requests (CORS Safe)
                       ▼
┌──────────────────────────────────────────────┐
│           HOSTINGER VPS (Ubuntu 22/24)       │
│  - Node.js + Express.js API (Port 5000)      │
│  - PM2 Daemon (24/7 background uptime)       │
│  - PostgreSQL Database (Users & Profiles)    │
│  - Google Gemini 2.5 Flash AI Engine         │
│  - Nodemailer (6-Digit Email Verification)   │
│  - Nginx Reverse Proxy                       │
└──────────────────────────────────────────────┘
```

---

## 📂 Struktur Folder Proyek

```
PRODIL STUDIO PROJECT/
├── frontend/                     # React + Vite + Tailwind CSS (Vercel)
│   ├── public/
│   │   └── assets/
│   │       ├── prodil-logo.jpg   # Logo Resmi Prodil Studio
│   │       └── prodil-icon.svg   # Ikon P Vektor
│   ├── src/
│   │   ├── components/           # LandingPage, StudioEditor, FormEditor, DocumentPreview,
│   │   │                         # CoverLetterEditor, AuthModal, SmartImportModal, AtsScoreModal
│   │   ├── context/              # AuthContext (JWT, Google Login, 6-Digit Verify)
│   │   ├── data/                 # initialProfile (Rich career data)
│   │   ├── services/             # api.ts (HTTP Client terhubung ke VPS)
│   │   ├── templates/            # 15 Template CV ATS + Cover Letter Template
│   │   ├── types/                # TypeScript Interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css             # Styling & CSS @media print A4
│   ├── vercel.json               # Konfigurasi SPA routing Vercel
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                      # Node.js + Express + PostgreSQL (Hostinger VPS)
│   ├── src/
│   │   ├── config/               # db.js (PostgreSQL Pool + File Local Cache Fallback)
│   │   ├── db/                   # migrate.js (SQL Schema generator)
│   │   ├── middleware/           # auth.js (JWT verify), rateLimiter.js (Gemini protection)
│   │   ├── routes/               # auth.routes.js, profile.routes.js, document.routes.js, ai.routes.js
│   │   ├── utils/                # email.js (SMTP 6-digit verification codes)
│   │   └── server.js             # Express App Entrypoint
│   ├── .env.example
│   └── package.json
│
├── deploy/                       # Skrip & Konfigurasi Hostinger VPS
│   ├── hostinger-setup.sh        # Otomasi instalasi Node, PostgreSQL, Nginx, PM2
│   ├── nginx-prodil.conf         # Konfigurasi Nginx Reverse Proxy
│   └── ecosystem.config.cjs      # Konfigurasi PM2 Process Manager
│
└── package.json                  # Root runner scripts
```

---

## 🎨 15 Template CV Lengkap

| No | Nama Template | Kategori | Keunggulan Utama |
|---|---|---|---|
| **1** | **ATS Classic Professional** | ATS Clean | Linear single-column, 100% kompatibel ATS internasional. |
| **2** | **ATS Executive Clean** | Executive | Divider aksen formal, metadata rapi untuk posisi managerial. |
| **3** | **Corporate Letterhead** | Executive | Desain kop surat formal (No photo) dengan garis aksen ganda. |
| **4** | **Emerald Corporate Minimal**| Modern | Aksen hijau emerald modern dengan tata letak segar dan bersih. |
| **5** | **Ivy League Classic** | ATS Clean | Tipografi serif klasik ala Harvard/Oxford (No photo). |
| **6** | **Hospitality Warm Amber** | Creative | Sidebar kiri amber hangat, foto melingkar, ramah visual. |
| **7** | **Luxury Gold** | Executive | Foto lingkaran tengah berbingkai emas dengan divider tipis. |
| **8** | **Dark Sidebar Split** | Modern | Sidebar navy slate elegan dipadu lembar konten putih kontras. |
| **9** | **Creative Visual** | Creative | Foto melingkar, pill badges, kartu proyek dengan metrik hasil. |
| **10**| **Editorial Split** | Modern | Header banner penuh di atas dengan 2 kolom editorial asimetris. |
| **11**| **Right Sidebar Accent** | Creative | Tata letak unik: pengalaman di kiri, detail kontak & skills di kanan. |
| **12**| **Vertical Monolith** | Modern | Garis monolit hitam di sisi kiri dengan nama vertikal berani. |
| **13**| **Signature Edition** | Executive | Nuansa charcoal hitam gelap dan aksen emas metalik berkelas. |
| **14**| **Tech Terminal** | Technical | Tipografi monospace khusus developer (`> name`, `// summary`). |
| **15**| **Dark Badge Specialist** | Modern | Foto profil kotak dengan sudut rounded halus & badge spesialis. |

---

## 🚀 Panduan Menjalankan di Lokal (Development)

### 1. Menjalankan Backend API:
```bash
cd backend
npm install
node src/server.js
```
*Server akan berjalan di `http://localhost:5000` (menggunakan database lokal secara otomatis jika PostgreSQL belum terhubung).*

### 2. Menjalankan Frontend React:
```bash
cd frontend
npm install
npm run dev
```
*Frontend akan terbuka di `http://localhost:3000`.*

---

## 🌐 Panduan Deploy Frontend ke Vercel (100% Gratis & Otomatis HTTPS)

1. Buat repositori baru di GitHub (misal: `prodil-studio`).
2. Masukkan folder proyek ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial prodil studio v2.0"
   git branch -M main
   git remote add origin https://github.com/USERNAME/prodil-studio.git
   git push -u origin main
   ```
3. Buka dashboard [Vercel](https://vercel.com) dan klik **Add New Project**.
4. Import repositori `prodil-studio`.
5. Pada bagian **Root Directory**, klik **Edit** dan pilih: `frontend`.
6. Di bagian **Environment Variables**, tambahkan:
   - `VITE_API_URL` = `http://IP_VPS_HOSTINGER_ANDA:5000` (atau `https://api.domainkamu.com` jika sudah dipasangi domain/subdomain).
7. Klik **Deploy**!
8. Selesai! Web aplikasi Prodil Studio kamu langsung aktif dengan link gratis ber-HTTPS (misal: `https://prodil-studio.vercel.app`).

---

## 🖥️ Panduan Deploy Backend & Database ke VPS Hostinger

1. **Masuk ke VPS via SSH di Terminal**:
   ```bash
   ssh root@IP_VPS_HOSTINGER_ANDA
   ```
2. **Jalankan Skrip Instalasi Otomatis**:
   ```bash
   curl -sSL https://raw.githubusercontent.com/USERNAME/prodil-studio/main/deploy/hostinger-setup.sh | bash
   ```
   *(Atau unggah file `deploy/hostinger-setup.sh` dan jalankan `bash deploy/hostinger-setup.sh`).*
3. **Pindahkan Folder Backend ke VPS**:
   Letakkan di `/var/www/prodil-studio/backend`.
4. **Isi File `.env` di VPS**:
   ```env
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://prodil-studio.vercel.app
   JWT_SECRET=rahasia_jwt_prodil_studio_2026
   DATABASE_URL=postgres://prodil_user:ProdilSecurePass2026!@localhost:5432/prodil_studio
   GEMINI_API_KEY=AIzaSy...your_gemini_api_key
   ```
5. **Inisialisasi Tabel PostgreSQL**:
   ```bash
   npm run db:migrate
   ```
6. **Jalankan Backend 24/7 dengan PM2**:
   ```bash
   pm2 start src/server.js --name prodil-backend
   pm2 save
   pm2 startup
   ```
7. Backend kamu kini online secara permanen, terlindungi dari restart server, dan terhubung langsung ke Vercel!
