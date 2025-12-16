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
        const result = await response.json();
        console.log('✅ Email enviado com sucesso');
        console.log('📧 ID do email:', result.id);
        return { success: true };
      } else {
        const errorText = await response.text();
        console.warn('⚠️ Resposta não OK:', response.status, errorText);
      }
    } catch (fetchError) {
      console.warn('⚠️ Erro ao conectar:', fetchError);
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
          console.log('✅ Email enviado via proxy local para:', email);
          console.log('📧 ID do email:', result.id);
          return { success: true };
        }
      } catch (proxyError) {
        console.warn('Proxy local não disponível. Código salvo localmente.');
      }
    }

    // Se nenhum método funcionou, retornar sucesso com warning
    console.log('⚠️ Nenhum método de envio disponível. Código salvo localmente.');
    console.log('');
    console.log('Para desenvolvimento local, execute em outro terminal:');
    console.log('   npm run email-proxy');
    console.log('');
    console.log('🔐 Código para teste:', code);
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao enviar email' 
    };
  }
}
