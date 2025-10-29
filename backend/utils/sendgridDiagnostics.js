// SendGrid diagnosis and troubleshooting tool
import sgMail from '@sendgrid/mail';

export async function diagnoseSendGridIssues() {
  const issues = [];
  const recommendations = [];
  
  console.log('🔍 SendGrid Configuration Diagnosis\n');
  
  // 1. Check API Key Format
  const apiKey = process.env.SENDGRID_API_KEY;
  console.log('1. API Key Check:');
  
  if (!apiKey) {
    issues.push('❌ SENDGRID_API_KEY is missing');
    recommendations.push('Set SENDGRID_API_KEY in your .env file');
  } else if (!apiKey.startsWith('SG.')) {
    issues.push('❌ Invalid API key format - should start with "SG."');
    recommendations.push('Get a proper API key from https://app.sendgrid.com/settings/api_keys');
  } else if (apiKey.length < 50) {
    issues.push('❌ API key appears too short (likely invalid)');
    recommendations.push('Verify your API key from SendGrid dashboard');
  } else {
    console.log('   ✅ API key format looks correct');
  }
  
  console.log(`   API Key: ${apiKey ? `${apiKey.substring(0, 10)}...` : 'Missing'}`);
  console.log(`   Length: ${apiKey?.length || 0} characters\n`);
  
  // 2. Check FROM Email Configuration
  const fromEmail = process.env.FROM_EMAIL;
  console.log('2. FROM Email Check:');
  
  if (!fromEmail) {
    issues.push('❌ FROM_EMAIL is missing');
    recommendations.push('Set FROM_EMAIL in your .env file');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fromEmail)) {
      issues.push('❌ FROM_EMAIL format is invalid');
      recommendations.push('Use a valid email format for FROM_EMAIL');
    } else {
      console.log('   ✅ FROM_EMAIL format is valid');
    }
  }
  
  console.log(`   FROM_EMAIL: ${fromEmail || 'Missing'}\n`);
  
  // 3. Test SendGrid API Connection
  console.log('3. SendGrid API Connection Test:');
  
  if (apiKey && apiKey.startsWith('SG.') && apiKey.length > 50) {
    try {
      sgMail.setApiKey(apiKey);
      
      // Try to get API key info (this will validate the key)
      const testResult = await sgMail.request({
        method: 'GET',
        url: '/v3/scopes'
      });
      
      console.log('   ✅ API connection successful');
      console.log('   ✅ API key is valid and active');
      
      if (testResult && testResult[1] && testResult[1].scopes) {
        const scopes = testResult[1].scopes;
        console.log('   📋 API Permissions:');
        
        const requiredScopes = ['mail.send'];
        const hasMailSend = scopes.includes('mail.send');
        
        if (hasMailSend) {
          console.log('      ✅ mail.send permission: Available');
        } else {
          issues.push('❌ API key missing mail.send permission');
          recommendations.push('Recreate API key with "Mail Send" permission enabled');
        }
      }
      
    } catch (error) {
      issues.push('❌ SendGrid API connection failed');
      console.log('   ❌ API Error:', error.response?.body?.errors || error.message);
      
      if (error.response?.statusCode === 401) {
        recommendations.push('API key is invalid or expired - generate a new one');
      } else if (error.response?.statusCode === 403) {
        recommendations.push('API key lacks necessary permissions - recreate with mail.send scope');
      } else {
        recommendations.push('Check your internet connection and SendGrid service status');
      }
    }
  } else {
    console.log('   ⚠️  Skipping API test due to invalid API key');
  }
  
  console.log('\n');
  
  // 4. Check Sender Authentication
  console.log('4. Sender Authentication Check:');
  console.log('   📧 FROM_EMAIL:', fromEmail);
  
  if (fromEmail) {
    const domain = fromEmail.split('@')[1];
    console.log('   🌐 Domain:', domain);
    
    recommendations.push(`Verify sender authentication for ${domain} in SendGrid:`);
    recommendations.push('- Single Sender Verification: https://app.sendgrid.com/settings/sender_auth/senders');
    recommendations.push('- OR Domain Authentication: https://app.sendgrid.com/settings/sender_auth/domain');
  }
  
  console.log('\n');
  
  // 5. Test Email Send
  console.log('5. Email Send Test:');
  
  if (apiKey && apiKey.startsWith('SG.') && fromEmail && apiKey.length > 50) {
    try {
      const testMsg = {
        to: fromEmail, // Send to same email for testing
        from: {
          email: fromEmail,
          name: process.env.FROM_NAME || 'Savatsya Gau Samvardhan'
        },
        subject: 'SendGrid Test - ' + new Date().toLocaleString(),
        html: `
          <h2>✅ SendGrid Test Successful!</h2>
          <p>This test email confirms your SendGrid configuration is working.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>API Key:</strong> ${apiKey.substring(0, 10)}...</p>
          <p><strong>FROM Email:</strong> ${fromEmail}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated test email from Savatsya Gau Samvardhan backend.
          </p>
        `,
        text: `SendGrid test successful! Sent at: ${new Date().toLocaleString()}`
      };
      
      const [response] = await sgMail.send(testMsg);
      
      console.log('   ✅ Test email sent successfully!');
      console.log('   📧 Message ID:', response.headers['x-message-id']);
      console.log('   📬 Check your inbox:', fromEmail);
      
    } catch (sendError) {
      issues.push('❌ Failed to send test email');
      console.log('   ❌ Send Error:', sendError.response?.body?.errors || sendError.message);
      
      if (sendError.response?.statusCode === 403) {
        if (sendError.response.body?.errors?.[0]?.message?.includes('sender identity')) {
          recommendations.push('CRITICAL: Sender email not verified! Visit https://app.sendgrid.com/settings/sender_auth');
        }
      }
    }
  } else {
    console.log('   ⚠️  Skipping send test due to configuration issues');
  }
  
  console.log('\n');
  
  // Summary
  console.log('📋 DIAGNOSIS SUMMARY:');
  console.log('===================');
  
  if (issues.length === 0) {
    console.log('✅ No issues found! SendGrid should be working properly.');
  } else {
    console.log('❌ Issues Found:');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  if (recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('===================');
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }
  
  console.log('\n🔗 HELPFUL LINKS:');
  console.log('=================');
  console.log('• SendGrid Dashboard: https://app.sendgrid.com/');
  console.log('• API Keys: https://app.sendgrid.com/settings/api_keys');
  console.log('• Sender Authentication: https://app.sendgrid.com/settings/sender_auth');
  console.log('• Email Activity: https://app.sendgrid.com/email_activity');
  console.log('• SendGrid Status: https://status.sendgrid.com/');
  
  return {
    hasIssues: issues.length > 0,
    issues,
    recommendations
  };
}

// Quick diagnosis function for routes
export async function quickSendGridCheck() {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;
  
  const status = {
    apiKeyValid: apiKey && apiKey.startsWith('SG.') && apiKey.length > 50,
    fromEmailValid: fromEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail),
    configured: false
  };
  
  status.configured = status.apiKeyValid && status.fromEmailValid;
  
  return status;
}