// Email templates for various user actions
import { sendEmail } from './mailer.js';

// Base email template wrapper
const baseTemplate = (content, title) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f6f3;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #8B4513;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #8B4513;
            margin-bottom: 10px;
        }
        .tagline {
            color: #666;
            font-style: italic;
        }
        .content {
            margin: 20px 0;
        }
        .highlight {
            background-color: #f0e6d2;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #8B4513;
            margin: 15px 0;
        }
        .button {
            display: inline-block;
            background-color: #8B4513;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
        }
        .security-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
            padding: 10px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .success {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 10px;
            border-radius: 5px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">SAVATSYA GAU SAMVARDHAN</div>
            <div class="tagline">Pure & Authentic Products with Traditional Care</div>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>Thank you for choosing Savatsya Gau Samvardhan</p>
            <p>📍 Varade Gaon, Badlapur, Maharashtra, India</p>
            <p>📧 vedjoshi0304@gmail.com | 📞 +91 9588958811</p>
            <p style="margin-top: 15px; font-size: 11px;">
                This is an automated email. Please do not reply to this message.<br>
                If you have questions, please contact us through our website.
            </p>
        </div>
    </div>
</body>
</html>
`;

// 1. Welcome email for new signups
export async function sendWelcomeEmail(userEmail, userName) {
    const content = `
        <h2 style="color: #8B4513;">Welcome to Savatsya Gau Samvardhan! 🙏</h2>
        
        <p>Dear ${userName || 'Valued Customer'},</p>
        
        <p>Welcome to our family! We're delighted that you've joined the Savatsya Gau Samvardhan community.</p>
        
        <div class="highlight">
            <h3>🌿 What We Offer:</h3>
            <ul>
                <li><strong>Premium Incense Sticks:</strong> Handcrafted with natural ingredients for spiritual ambiance</li>
                <li><strong>Pure A2 Cow Ghee:</strong> Traditional methods ensure maximum nutritional value</li>
                <li><strong>Authentic Quality:</strong> Every product made with love and traditional techniques</li>
            </ul>
        </div>
        
        <p>Your account is now ready! You can:</p>
        <ul>
            <li>Browse our complete product catalog</li>
            <li>Track your orders in real-time</li>
            <li>Manage your profile and preferences</li>
            <li>Subscribe to our newsletter for exclusive offers</li>
        </ul>
        
        <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" class="button">
                🛍️ Start Shopping
            </a>
        </div>
        
        <p>If you have any questions or need assistance, our customer support team is here to help.</p>
        
        <p>Thank you for trusting us with your wellness journey!</p>
        
        <p>Warm regards,<br>
        <strong>Team Savatsya Gau Samvardhan</strong></p>
    `;
    
    return await sendEmail({
        to: userEmail,
        subject: '🙏 Welcome to Savatsya Gau Samvardhan - Your Journey Begins!',
        html: baseTemplate(content, 'Welcome to Savatsya Gau Samvardhan')
    });
}

// 2. Newsletter subscription confirmation
export async function sendNewsletterSubscriptionEmail(userEmail, userName) {
    const content = `
        <h2 style="color: #8B4513;">Newsletter Subscription Confirmed! 📧</h2>
        
        <p>Dear ${userName || 'Valued Subscriber'},</p>
        
        <div class="success">
            <strong>✅ Subscription Successful!</strong><br>
            You're now subscribed to our newsletter and will receive exclusive updates.
        </div>
        
        <p>Thank you for subscribing to the Savatsya Gau Samvardhan newsletter! You'll now receive:</p>
        
        <div class="highlight">
            <h3>📬 What You'll Receive:</h3>
            <ul>
                <li><strong>Product Updates:</strong> First to know about new arrivals</li>
                <li><strong>Exclusive Offers:</strong> Special discounts for newsletter subscribers</li>
                <li><strong>Wellness Tips:</strong> Traditional knowledge and modern insights</li>
                <li><strong>Behind the Scenes:</strong> Stories from our production process</li>
                <li><strong>Seasonal Specials:</strong> Festival and seasonal product collections</li>
            </ul>
        </div>
        
        <p>We respect your privacy and will never share your email with third parties. You can unsubscribe at any time.</p>
        
        <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" class="button">
                🌿 Explore Our Products
            </a>
        </div>
        
        <p>Stay connected for authentic, pure products delivered with care!</p>
        
        <p>Best regards,<br>
        <strong>Team Savatsya Gau Samvardhan</strong></p>
    `;
    
    return await sendEmail({
        to: userEmail,
        subject: '📧 Newsletter Subscription Confirmed - Welcome to Our Community!',
        html: baseTemplate(content, 'Newsletter Subscription Confirmed')
    });
}

// 3. Two-Factor Authentication enabled
export async function send2FAEnabledEmail(userEmail, userName, method = 'email') {
    const methodNames = {
        email: 'Email',
        sms: 'SMS Text Message',
        app: 'Authenticator App'
    };
    
    const content = `
        <h2 style="color: #8B4513;">Two-Factor Authentication Enabled 🔐</h2>
        
        <p>Dear ${userName || 'Valued Customer'},</p>
        
        <div class="success">
            <strong>✅ Security Enhanced!</strong><br>
            Two-Factor Authentication has been successfully enabled on your account.
        </div>
        
        <div class="highlight">
            <h3>🛡️ Security Details:</h3>
            <ul>
                <li><strong>Authentication Method:</strong> ${methodNames[method] || method}</li>
                <li><strong>Enabled On:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>Status:</strong> Active and Protecting Your Account</li>
            </ul>
        </div>
        
        <div class="security-notice">
            <strong>🔒 Important Security Information:</strong><br>
            • You'll now need to provide a verification code when logging in<br>
            • Keep your backup codes in a safe, accessible location<br>
            • This adds an extra layer of protection to your account<br>
            • Contact us immediately if you notice any suspicious activity
        </div>
        
        <p><strong>What happens next:</strong></p>
        <ul>
            <li>Your next login will require two-factor authentication</li>
            <li>Use your ${methodNames[method]} to receive verification codes</li>
            <li>Backup codes can be used if your primary method is unavailable</li>
            <li>You can disable 2FA anytime from your account settings</li>
        </ul>
        
        <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" class="button">
                ⚙️ Manage Account Settings
            </a>
        </div>
        
        <p>Thank you for taking steps to secure your account!</p>
        
        <p>Stay secure,<br>
        <strong>Team Savatsya Gau Samvardhan</strong></p>
    `;
    
    return await sendEmail({
        to: userEmail,
        subject: '🔐 Two-Factor Authentication Enabled - Account Security Enhanced',
        html: baseTemplate(content, 'Two-Factor Authentication Enabled')
    });
}

// 4. Two-Factor Authentication disabled
export async function send2FADisabledEmail(userEmail, userName) {
    const content = `
        <h2 style="color: #8B4513;">Two-Factor Authentication Disabled 🔓</h2>
        
        <p>Dear ${userName || 'Valued Customer'},</p>
        
        <div class="security-notice">
            <strong>⚠️ Security Change Notice:</strong><br>
            Two-Factor Authentication has been disabled on your account.
        </div>
        
        <div class="highlight">
            <h3>🔄 Account Changes:</h3>
            <ul>
                <li><strong>2FA Status:</strong> Disabled</li>
                <li><strong>Disabled On:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>Account Protection:</strong> Now using password-only authentication</li>
            </ul>
        </div>
        
        <p><strong>What this means:</strong></p>
        <ul>
            <li>You'll only need your password to log in</li>
            <li>Your account is less protected than before</li>
            <li>All backup codes have been deactivated</li>
            <li>You can re-enable 2FA anytime for better security</li>
        </ul>
        
        <div class="security-notice">
            <strong>🔐 Security Recommendation:</strong><br>
            Consider re-enabling Two-Factor Authentication for enhanced account protection. 
            This extra security layer helps protect your personal information and order history.
        </div>
        
        <p><strong>If you didn't make this change:</strong></p>
        <ul>
            <li>Change your password immediately</li>
            <li>Re-enable Two-Factor Authentication</li>
            <li>Contact our support team right away</li>
        </ul>
        
        <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" class="button">
                🔐 Re-enable 2FA
            </a>
        </div>
        
        <p>Your account security is important to us.</p>
        
        <p>Best regards,<br>
        <strong>Team Savatsya Gau Samvardhan</strong></p>
    `;
    
    return await sendEmail({
        to: userEmail,
        subject: '🔓 Two-Factor Authentication Disabled - Security Update',
        html: baseTemplate(content, 'Two-Factor Authentication Disabled')
    });
}

// 5. Data download notification
export async function sendDataDownloadEmail(userEmail, userName, downloadDate) {
    const content = `
        <h2 style="color: #8B4513;">Data Download Completed 📥</h2>
        
        <p>Dear ${userName || 'Valued Customer'},</p>
        
        <div class="success">
            <strong>✅ Data Export Successful!</strong><br>
            Your personal data has been successfully downloaded from your account.
        </div>
        
        <div class="highlight">
            <h3>📋 Download Details:</h3>
            <ul>
                <li><strong>Download Date:</strong> ${downloadDate || new Date().toLocaleString()}</li>
                <li><strong>Data Included:</strong> Profile information, order history, preferences</li>
                <li><strong>Format:</strong> JSON (JavaScript Object Notation)</li>
                <li><strong>Compliance:</strong> GDPR Data Portability Rights</li>
            </ul>
        </div>
        
        <p><strong>Your download included:</strong></p>
        <ul>
            <li>Personal profile information (name, email, phone)</li>
            <li>Account preferences and settings</li>
            <li>Order history and purchase records</li>
            <li>Address book and shipping information</li>
            <li>Account activity timestamps</li>
        </ul>
        
        <div class="security-notice">
            <strong>🔒 Data Security Reminder:</strong><br>
            • The downloaded file contains sensitive personal information<br>
            • Store it securely and avoid sharing with unauthorized parties<br>
            • Passwords and payment information are not included for security<br>
            • Delete the file securely when no longer needed
        </div>
        
        <p><strong>Why might you need this data:</strong></p>
        <ul>
            <li>Backup of your account information</li>
            <li>Transfer to another service (data portability)</li>
            <li>Personal record keeping</li>
            <li>Compliance with data protection requests</li>
        </ul>
        
        <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" class="button">
                ⚙️ Account Settings
            </a>
        </div>
        
        <p>This action was performed in compliance with data protection regulations and your privacy rights.</p>
        
        <p>Best regards,<br>
        <strong>Team Savatsya Gau Samvardhan</strong></p>
    `;
    
    return await sendEmail({
        to: userEmail,
        subject: '📥 Data Download Completed - Your Information Package',
        html: baseTemplate(content, 'Data Download Completed')
    });
}

// 6. Account deletion confirmation
export async function sendAccountDeletionEmail(userEmail, userName, deletionDate) {
    const content = `
        <h2 style="color: #8B4513;">Account Deletion Confirmed 🗑️</h2>
        
        <p>Dear ${userName || 'Valued Customer'},</p>
        
        <div class="security-notice">
            <strong>⚠️ Account Deletion Notice:</strong><br>
            Your Savatsya Gau Samvardhan account has been successfully deleted.
        </div>
        
        <div class="highlight">
            <h3>🗑️ Deletion Details:</h3>
            <ul>
                <li><strong>Account Email:</strong> ${userEmail}</li>
                <li><strong>Deletion Date:</strong> ${deletionDate || new Date().toLocaleString()}</li>
                <li><strong>Status:</strong> Permanently Removed</li>
                <li><strong>Data Retention:</strong> As per our privacy policy</li>
            </ul>
        </div>
        
        <p><strong>What has been deleted:</strong></p>
        <ul>
            <li>Personal profile information</li>
            <li>Account preferences and settings</li>
            <li>Saved addresses and payment methods</li>
            <li>Newsletter subscriptions</li>
            <li>Login credentials and security settings</li>
        </ul>
        
        <div class="security-notice">
            <strong>📋 Important Information:</strong><br>
            • Order history may be retained for legal/accounting purposes<br>
            • Some data may be kept as required by law or for legitimate business interests<br>
            • This email serves as confirmation of your deletion request<br>
            • You can create a new account anytime if you wish to return
        </div>
        
        <p><strong>If you change your mind:</strong></p>
        <ul>
            <li>You're always welcome to create a new account</li>
            <li>Previous order history may not be recoverable</li>
            <li>Newsletter subscriptions will need to be renewed</li>
            <li>Account preferences will return to default settings</li>
        </ul>
        
        <div style="text-align: center; margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
            <p style="margin: 0; color: #6c757d; font-style: italic;">
                "Thank you for being part of the Savatsya Gau Samvardhan family.<br>
                We hope our paths cross again in the future."
            </p>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/" class="button">
                🏠 Visit Our Website
            </a>
        </div>
        
        <p>We're sorry to see you go and wish you all the best!</p>
        
        <p>Farewell,<br>
        <strong>Team Savatsya Gau Samvardhan</strong></p>
    `;
    
    return await sendEmail({
        to: userEmail,
        subject: '🗑️ Account Deletion Confirmed - Thank You for Your Journey With Us',
        html: baseTemplate(content, 'Account Deletion Confirmed')
    });
}

// Password reset email template
export async function sendPasswordResetEmail(email, resetToken, userName = 'Valued Customer') {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const content = `
        <div class="icon">🔒</div>
        <h2>Password Reset Request</h2>
        <p>Hello ${userName},</p>
        <p>We received a request to reset your password for your Savatsya Gau Samvardhan account.</p>
        
        <div class="highlight-box">
            <p><strong>Reset your password by clicking the button below:</strong></p>
            <div class="cta-button">
                <a href="${resetLink}" style="color: white; text-decoration: none;">Reset My Password</a>
            </div>
            <p style="margin-top: 15px; color: #666; font-size: 14px;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetLink}" style="color: #8B4513; word-break: break-all;">${resetLink}</a>
            </p>
        </div>
        
        <div class="info-section">
            <p><strong>Important Security Information:</strong></p>
            <ul style="color: #666; font-size: 14px; margin: 10px 0;">
                <li>This reset link will expire in 1 hour for security</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password won't change until you create a new one</li>
                <li>For security, this link can only be used once</li>
            </ul>
        </div>
        
        <p>If you're having trouble with the button above, contact our support team at <a href="mailto:support@savatsya-gau-samvardhan.com" style="color: #8B4513;">support@savatsya-gau-samvardhan.com</a></p>
        
        <p>Stay blessed with natural wellness!</p>
    `;

    const html = baseTemplate(content, 'Reset Your Password - Savatsya Gau Samvardhan');
    
    try {
        const result = await sendEmail({
            to: email,
            subject: 'Reset Your Password - Savatsya Gau Samvardhan',
            html,
            text: `Password Reset Request for Savatsya Gau Samvardhan

Hello ${userName},

We received a request to reset your password. Click this link to reset it: ${resetLink}

This link expires in 1 hour. If you didn't request this reset, please ignore this email.

Best regards,
Savatsya Gau Samvardhan Team`
        });
        
        return { ok: true, result };
    } catch (error) {
        console.error('Password reset email error:', error);
        return { ok: false, error: error.message };
    }
}

// Password reset confirmation email template
export async function sendPasswordResetConfirmationEmail(email, userName = 'Valued Customer') {
    const content = `
        <div class="icon">✅</div>
        <h2>Password Successfully Changed</h2>
        <p>Hello ${userName},</p>
        <p>Your password has been successfully changed for your Savatsya Gau Samvardhan account.</p>
        
        <div class="highlight-box">
            <p><strong>Password Change Details:</strong></p>
            <ul style="color: #333; margin: 10px 0;">
                <li>Date: ${new Date().toLocaleString()}</li>
                <li>Account: ${email}</li>
                <li>Changed via: Password Reset Link</li>
            </ul>
        </div>
        
        <div class="info-section">
            <p><strong>Security Reminder:</strong></p>
            <ul style="color: #666; font-size: 14px; margin: 10px 0;">
                <li>If you made this change, no further action is needed</li>
                <li>If you did not authorize this change, contact support immediately</li>
                <li>Always use a strong, unique password for your account</li>
                <li>Keep your login credentials secure and private</li>
            </ul>
        </div>
        
        <p>You can now log in to your account using your new password.</p>
        
        <div class="cta-button">
            <a href="${process.env.FRONTEND_URL}/login" style="color: white; text-decoration: none;">Login to Your Account</a>
        </div>
        
        <p>If you have any concerns, contact our support team at <a href="mailto:support@savatsya-gau-samvardhan.com" style="color: #8B4513;">support@savatsya-gau-samvardhan.com</a></p>
        
        <p>Stay blessed with natural wellness!</p>
    `;

    const html = baseTemplate(content, 'Password Changed Successfully - Savatsya Gau Samvardhan');
    
    try {
        const result = await sendEmail({
            to: email,
            subject: 'Password Changed Successfully - Savatsya Gau Samvardhan',
            html,
            text: `Password Successfully Changed - Savatsya Gau Samvardhan

Hello ${userName},

Your password has been successfully changed for your Savatsya Gau Samvardhan account on ${new Date().toLocaleString()}.

If you made this change, no further action is needed. If you did not authorize this change, contact support immediately.

You can now log in at: ${process.env.FRONTEND_URL}/login

Best regards,
Savatsya Gau Samvardhan Team`
        });
        
        return { ok: true, result };
    } catch (error) {
        console.error('Password reset confirmation email error:', error);
        return { ok: false, error: error.message };
    }
}

export default {
    sendWelcomeEmail,
    sendNewsletterSubscriptionEmail,
    send2FAEnabledEmail,
    send2FADisabledEmail,
    sendDataDownloadEmail,
    sendAccountDeletionEmail,
    sendPasswordResetEmail,
    sendPasswordResetConfirmationEmail
};