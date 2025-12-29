require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_SECURE = process.env.SMTP_SECURE;

let transporter = null;
try {
  if (SMTP_HOST && EMAIL_USER && EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587,
      secure: SMTP_SECURE === 'true',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });
    console.log('✅ Email proxy: using custom SMTP host', SMTP_HOST);
  } else if (EMAIL_USER && EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });
    console.log('✅ Email proxy: using Gmail SMTP for', EMAIL_USER);
  }
} catch (err) {
  console.warn('⚠️  Failed to create nodemailer transporter', err && err.message);
}

if (!RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY not set in .env.local — proxy requests will fail.');
}

app.post('/api/send-email', async (req, res) => {
  try {
    const { email, code, name } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    const subject = '🔐 Seu código de verificação - Vistoria';
    const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0;">Vistoria Mobile</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <p>Olá${name ? ` ${name}` : ''},</p>
              <p>Seu código de verificação:</p>
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #667eea;">
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #667eea;">${code}</p>
              </div>
              <p>Válido por 10 minutos.</p>
            </div>
          </div>
        `;

    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: FROM_EMAIL,
          to: email,
          subject,
          html,
        });
        return res.json({ messageId: info.messageId, accepted: info.accepted });
      } catch (err) {
        console.error('nodemailer send error:', err && err.message);
        return res.status(500).json({ error: err && err.message });
      }
    }

    // Fallback to Resend API if configured
    if (RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: email,
          subject,
          html,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(result);
      }

      return res.json(result);
    }

    return res.status(500).json({ error: 'No email transporter configured' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Email proxy server running on http://localhost:${PORT}`);
  console.log(`📧 Ready to send emails via Resend API`);
});
