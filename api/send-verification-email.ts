import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// Usar Gmail com app password (gratuito)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'seu-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'sua-senha-app',
  },
});

export default async (req: VercelRequest, res: VercelResponse) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, code, name } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email e código são obrigatórios' });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Vistoria Mobile</h1>
          <p style="margin: 5px 0 0 0;">Verificação de Email</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <p>Olá${name ? ` ${name}` : ''},</p>
          
          <p>Recebemos sua solicitação de verificação de email. Use o código abaixo para confirmar sua conta:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #667eea;">
            <p style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #667eea;">
              ${code}
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            ⏱️ Este código expira em <strong>10 minutos</strong>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Se você não solicitou este código, ignore este email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2025 Vistoria Mobile. Todos os direitos reservados.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER || 'seu-email@gmail.com',
      to: email,
      subject: '🔐 Seu código de verificação - Vistoria',
      html: htmlContent,
    });

    console.log('✅ Email enviado para:', email, 'ID:', info.messageId);
    
    return res.status(200).json({
      success: true,
      message: 'Email enviado com sucesso',
      id: info.messageId,
    });
  } catch (error) {
    console.error('Erro na API route:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Erro ao enviar email' 
    });
  }
};
