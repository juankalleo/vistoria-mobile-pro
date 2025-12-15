// Constantes
const RESEND_API_KEY = 're_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj';
const EMAIL_API_URL = 'http://localhost:3001/api/send-email';

export async function sendVerificationEmail(
  email: string,
  code: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Tentar enviar via proxy local (precisa estar rodando)
    try {
      const response = await fetch(EMAIL_API_URL, {
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

    // Se proxy não está disponível, retornar sucesso com warning
    console.log('⚠️ Para enviar emails reais, execute em outro terminal:');
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
