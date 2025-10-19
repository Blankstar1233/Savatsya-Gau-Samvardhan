import sgMail from '@sendgrid/mail';

let isInitialized = false;

function initMailer() {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[mailer] SENDGRID_API_KEY not configured. Email functionality disabled.');
    return;
  }

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    isInitialized = true;
    console.log('[mailer] SendGrid Web API initialized');
  } catch (err) {
    console.error('[mailer] Failed to initialize SendGrid:', err?.message || err);
    isInitialized = false;
  }
}

initMailer();

export function isEmailEnabled() {
  return isInitialized;
}

export async function sendEmail({ to, subject, html, text }) {
  if (!isInitialized) {
    console.warn('[mailer] SendGrid not initialized. Skipping email send.');
    return { 
      ok: false, 
      error: 'SendGrid not configured' 
    };
  }

  const from = process.env.FROM_EMAIL || 'no-reply@example.com';
  const fromName = process.env.FROM_NAME || 'Savatsya Gau Samvardhan';

  const msg = {
    to,
    from: {
      email: from,
      name: fromName
    },
    subject,
    html,
    text: text || html?.replace(/<[^>]*>/g, '')
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log('[mailer] Email sent successfully to:', to);
    return { 
      ok: true,
      messageId: response.headers['x-message-id']
    };
  } catch (err) {
    console.error('[mailer] Send failed:', err?.message || err);
    const errorInfo = err.response?.body || err.message;
    return { 
      ok: false,
      error: String(errorInfo) 
    };
  }
}


