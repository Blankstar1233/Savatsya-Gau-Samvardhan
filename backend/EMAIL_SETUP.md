# Email Setup Guide

This project uses SendGrid Web API for reliable email delivery.

## Quick Setup

1. **Get SendGrid API Key**
   - Sign up at [SendGrid](https://sendgrid.com)
   - Create an API key with "Mail Send" permissions
   - Free tier: 100 emails/day

2. **Configure Environment**
   ```bash
   # Add to .env file
   SENDGRID_API_KEY=your_api_key_here
   FROM_EMAIL=your-verified-sender@domain.com
   FROM_NAME=Your Company Name
   ```

3. **Verify Sender**
   - In SendGrid dashboard, verify your sender email address
   - This is required to send emails

## Usage

The mailer will automatically initialize when the server starts:

```javascript
import { sendEmail, isEmailEnabled } from './utils/mailer.js';

// Check if email is configured
if (isEmailEnabled()) {
  // Send email
  const result = await sendEmail({
    to: 'user@example.com',
    subject: 'Welcome!',
    html: '<p>Welcome to our service!</p>',
    text: 'Welcome to our service!' // optional
  });
  
  if (result.ok) {
    console.log('Email sent, ID:', result.messageId);
  } else {
    console.error('Email failed:', result.error);
  }
}
```

## Features

- ✅ Production-ready with SendGrid Web API
- ✅ Automatic HTML-to-text conversion
- ✅ Proper error handling
- ✅ Message ID tracking
- ✅ Environment-based configuration
- ✅ Graceful degradation when not configured

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SENDGRID_API_KEY` | Yes | Your SendGrid API key |
| `FROM_EMAIL` | Yes | Verified sender email address |
| `FROM_NAME` | No | Display name for sender (default: "Savatsya Gau Samvardhan") |

## Newsletter Endpoint

POST `/api/newsletter/subscribe`

```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "ok": true,
  "emailEnabled": true,
  "email": {
    "sent": true,
    "details": {
      "ok": true,
      "messageId": "abc123"
    }
  }
}
```