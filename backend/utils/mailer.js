import sgMail from '@sendgrid/mail';

let isInitialized = false;
let initAttempted = false;

function initMailer() {
  if (initAttempted) return; // Only try to initialize once
  initAttempted = true;
  
  console.log('[mailer] Initializing SendGrid mailer...');
  console.log('[mailer] DEBUG - SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
  console.log('[mailer] DEBUG - SENDGRID_API_KEY length:', process.env.SENDGRID_API_KEY?.length || 0);
  console.log('[mailer] DEBUG - SENDGRID_API_KEY starts with SG.:', process.env.SENDGRID_API_KEY?.startsWith('SG.') || false);
  console.log('[mailer] DEBUG - FROM_EMAIL value:', process.env.FROM_EMAIL);
  console.log('[mailer] DEBUG - FROM_NAME value:', process.env.FROM_NAME);
  
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[mailer] SENDGRID_API_KEY not configured. Email functionality disabled.');
    return;
  }

  // Validate API key format
  if (!process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    console.error('[mailer] Invalid SENDGRID_API_KEY format. SendGrid API keys should start with "SG."');
    console.error('[mailer] Current key format appears incorrect. Please check your SendGrid dashboard for the correct API key.');
    isInitialized = false;
    return;
  }

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    isInitialized = true;
    console.log('[mailer] ✅ SendGrid Web API initialized successfully');
    console.log('[mailer] ✅ Email functionality is ENABLED');
  } catch (err) {
    console.error('[mailer] ❌ Failed to initialize SendGrid:', err?.message || err);
    isInitialized = false;
  }
}


// Don't initialize immediately - wait for first use

export function isEmailEnabled() {
  if (!initAttempted) {
    initMailer(); // Initialize on first check
  }
  return isInitialized;
}

export async function sendEmail({ to, subject, html, text }) {
  if (!initAttempted) {
    initMailer(); // Initialize on first use
  }
  
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


