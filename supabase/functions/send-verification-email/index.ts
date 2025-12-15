import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Pegar a chave do Resend das variáveis de ambiente ou usar a chave fixa
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj";
const resend = new Resend(RESEND_API_KEY);

serve(async (req) => {
  // Apenas permitir POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405 }
    );
  }

  try {
    const { email, code, name } = await req.json();

    // Validar dados de entrada
    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email e código são obrigatórios" }),
        { status: 400 }
      );
    }

    // Enviar email via Resend
    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "🔐 Seu código de verificação - Vistoria",
      html: `
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
      `,
    });

    if (result.error) {
      console.error("Erro ao enviar email:", result.error);
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400 }
      );
    }

    console.log("✅ Email enviado com sucesso para:", email, "ID:", result.data?.id);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email enviado com sucesso",
        id: result.data?.id,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro na Edge Function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
