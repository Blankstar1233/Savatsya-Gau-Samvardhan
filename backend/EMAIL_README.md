Running and testing order/newsletter confirmation emails

1) Overview
This project uses `nodemailer` with SMTP settings from environment variables. If SMTP is not configured, emails are skipped (logged).

2) Required environment variables
- `MONGO_URI` - your MongoDB connection string
- `JWT_SECRET` - JWT secret used for auth
- `SMTP_HOST` - SMTP host (optional; if missing emails are disabled)
- `SMTP_PORT` - SMTP port (default 587)
- `SMTP_SECURE` - 'true' if using TLS (usually false for 587)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `FROM_EMAIL` - from address (optional)
- `FROM_NAME` - from name (optional)

3) Quick local run (PowerShell)
Set the environment variables (PowerShell example):

```powershell
$env:MONGO_URI = 'mongodb://localhost:27017/mydb'
$env:JWT_SECRET = 'dev-secret'
$env:SMTP_HOST = 'smtp.example.com'
$env:SMTP_PORT = '587'
$env:SMTP_USER = 'user@example.com'
$env:SMTP_PASS = 'yourpass'
$env:FROM_EMAIL = 'no-reply@example.com'
$env:FROM_NAME = 'Savatsya Gau Samvardhan'
```

Then start the backend (from project root):

```powershell
cd backend; npm install; npm start
```

4) Test newsletter subscription
- POST to `http://localhost:5000/api/newsletter/subscribe` with JSON body `{ "email": "you@example.com" }`.
- Response will include `emailSent` and `emailEnabled` flags. If configured, you'll receive a welcome email.

5) Test order confirmation
- Authenticate (use `/api/auth/login` to get a JWT), then POST to `http://localhost:5000/api/orders` with the JWT in the Authorization header and body: `{ "items": [{ "productId": "p1", "quantity": 1, "price": 100 }], "total": 100 }`.
- If SMTP configured, the user email (from the user record) will receive an order confirmation email.

6) Notes
- The mailer uses direct SMTP via `nodemailer`. For development you can use a service like Mailtrap, or a real SMTP account.
- Emails are sent asynchronously (fire-and-forget) so the API won't block for slow SMTP.
