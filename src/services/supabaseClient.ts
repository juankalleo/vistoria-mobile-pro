import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
// Substitua com suas credenciais reais
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://seu-project.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-publica';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper para verificar conexão
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    return !error;
  } catch {
    return false;
  }
}

// Log para debug: mostrar URL usada em runtime (somente no dev)
if (import.meta.env.MODE === 'development') {
  try {
    // eslint-disable-next-line no-console
    console.info('Supabase client usando URL:', SUPABASE_URL);
  } catch (e) {
    // ignore
  }
}
