import nodemailer from 'nodemailer';

let transporter = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Boolean(process.env.SMTP_SECURE === 'true'),
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    } : undefined
  });
}

export function isEmailEnabled() {
  return Boolean(transporter);
}

export async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.warn('[mailer] SMTP not configured. Skipping email send.');
    return false; // Skip if SMTP isn't configured
  }
  const from = process.env.FROM_EMAIL || 'no-reply@example.com';
  const fromName = process.env.FROM_NAME || 'Savatsya Gau Samvardhan';
  try {
    await transporter.sendMail({
      from: `${fromName} <${from}>`,
      to,
      subject,
      html
    });
    return true;
  } catch (err) {
    console.error('[mailer] Failed to send email:', err?.message || err);
    return false;
  }
}

export async function verifyEmailTransport() {
  if (!transporter) return { ok: false, error: 'SMTP not configured' };
  try {
    await transporter.verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}


