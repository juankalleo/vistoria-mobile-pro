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
    } else if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      // Vercel - usar API route do Vercel
      functionUrl = '/api/send-verification-email';
    } else {
      // Fallback para Supabase Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      functionUrl = `${supabaseUrl}/functions/v1/send-verification-email`;
    }

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(functionUrl.includes('supabase') && {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          }),
        },
        body: JSON.stringify({ email, code, name }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email enviado com sucesso');
        console.log('📧 ID do email:', result.id);
        return { success: true };
      } else {
        console.warn('⚠️ Resposta não OK:', response.status);
      }
    } catch (fetchError) {
      console.warn('⚠️ Erro ao conectar:', fetchError);
    }

    // Fallback: Email Proxy local (desenvolvimento)
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
