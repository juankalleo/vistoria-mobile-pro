#!/usr/bin/env node

/**
 * Script para adicionar variáveis de ambiente na Vercel
 * Uso: node add-vercel-env.cjs
 * 
 * Pré-requisito: Ter Vercel CLI instalada
 * npm i -g vercel
 */

const { execSync } = require('child_process');

const envVars = {
  VITE_SUPABASE_URL: 'https://estngdkevauuuwgjcpg.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdG5nZGtldmF1dXV3Z2pjcGciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMTMyODkwMywiZXhwIjoxNzYyODY0OTAzfQ.iH6dQ9dRBvXbwVBLwJxG7gvwT0WjH4w7-0dFkfwJ5Wk',
  VITE_RESEND_API_KEY: 're_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj',
  VITE_RESEND_FROM_EMAIL: 'onboarding@resend.dev',
};

const environments = ['production', 'preview', 'development'];

console.log('🚀 Adicionando variáveis de ambiente na Vercel...\n');

try {
  for (const [key, value] of Object.entries(envVars)) {
    console.log(`📝 Adicionando: ${key}`);
    
    for (const env of environments) {
      try {
        execSync(`vercel env add ${key} ${env} --yes`, {
          stdio: 'inherit',
          input: value,
        });
      } catch (error) {
        // Vercel pode exigir input via stdin
        console.log(`   ⚠️  Configure manualmente ${key} para ${env}`);
      }
    }
  }
  
  console.log('\n✅ Variáveis adicionadas! Execute:');
  console.log('   vercel redeploy');
  
} catch (error) {
  console.error('❌ Erro ao adicionar variáveis:');
  console.error(error.message);
  console.error('\n📖 Instruções manuais:');
  console.error('1. Acesse: https://vercel.com/dashboard');
  console.error('2. Selecione seu projeto');
  console.error('3. Settings → Environment Variables');
  console.error('4. Adicione cada variável manualmente');
}
