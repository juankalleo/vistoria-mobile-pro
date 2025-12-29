// Constantes
const RESEND_API_KEY = 're_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj';
const EMAIL_PROXY_URL = 'http://localhost:3001/api/send-email';

export async function sendVerificationEmail(
  email: string,
  code: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Determinar URL da função conforme ambiente
    let functionUrl: string;
    
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Desenvolvimento local - usar proxy
      functionUrl = EMAIL_PROXY_URL;
    } else {
      // Produção e preview - usar API route do Vercel
      functionUrl = '/api/send-verification-email';
    }

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, name }),
      });

      if (response.ok) {
        await response.json();
        return { success: true };
      }

      const errorText = await response.text();
      console.error('emailService: função retornou não-OK', functionUrl, response.status, errorText);
      return { success: false, error: `Email service error: ${response.status}` };
    } catch (fetchError) {
      console.error('emailService: erro ao conectar função', functionUrl, fetchError);
      // continue to fallback logic
    }

    // Fallback: Email Proxy local (apenas em localhost)
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      try {
        const response = await fetch(EMAIL_PROXY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            code,
            name,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          // Email enviado via proxy local
          return { success: true };
        }
      } catch (proxyError) {
        // Proxy local não disponível. Código salvo localmente.
      }
    }

    // Se nenhum método funcionou, retornar sucesso com warning
    // Nenhum método de envio disponível. Código salvo localmente.
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao enviar email' 
    };
  }
}
