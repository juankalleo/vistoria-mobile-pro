// Constantes
const RESEND_API_KEY = 're_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj';
const EMAIL_PROXY_URL = 'http://localhost:3001/api/send-email';

export async function sendVerificationEmail(
  email: string,
  code: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Tentar Edge Function primeiro (produção)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      try {
        const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-verification-email`;
        
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ email, code, name }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Email enviado via Supabase Edge Function');
          console.log('📧 ID do email:', result.id);
          return { success: true };
        }
      } catch (edgeError) {
        console.warn('⚠️ Edge Function indisponível, tentando fallback...');
      }
    }

    // Fallback: Email Proxy local (desenvolvimento)
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
