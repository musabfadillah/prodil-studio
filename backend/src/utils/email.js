import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } catch (err) {
    console.warn('[Nodemailer Init Warning]:', err.message);
  }
}

/**
 * Sends a 6-digit email verification code to user
 */
export async function sendVerificationEmail(toEmail, code, userName = 'Creator') {
  const subject = `[Prodil Studio] Verifikasi Akun Kamu: ${code}`;
  const htmlContent = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2563eb; margin: 0; font-size: 26px; letter-spacing: -0.5px;">Prodil Studio</h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Craft Your Career & Creative Identity</p>
      </div>

      <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
        <h3 style="color: #1e293b; margin-top: 0;">Halo, ${userName}!</h3>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Terima kasih telah bergabung di <strong>Prodil Studio</strong>. Masukkan kode 6-digit berikut untuk mengonfirmasi email dan mengaktifkan akses aman ke Studio:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #2563eb; background: #eff6ff; padding: 12px 32px; border-radius: 8px; border: 2px dashed #3b82f6;">
            ${code}
          </span>
        </div>

        <p style="color: #64748b; font-size: 13px; text-align: center;">
          Kode ini berlaku selama 15 menit. Jangan bagikan kode ini kepada siapapun demi keamanan akun kamu.
        </p>
      </div>

      <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        &copy; ${new Date().getFullYear()} Prodil Studio &bull; VPS Hostinger + Vercel Deployment
      </div>
    </div>
  `;

  if (transporter && process.env.SMTP_USER) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Prodil Studio" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      console.log(`✉️ [Email Sent] Verification code sent to ${toEmail}`);
      return { success: true, delivered: true };
    } catch (err) {
      console.error(`⚠️ [Email Send Error]: ${err.message}`);
      // Fallback: log to console
    }
  }

  // Development / fallback mode: log prominently
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🔑 [DEV VERIFICATION CODE for ${toEmail}]: ===> ${code} <===`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return { success: true, delivered: false, previewCode: code };
}
