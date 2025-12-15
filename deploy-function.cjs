#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const projectRef = 'ncnycfmhzpfjmmqzevaz';
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ SUPABASE_ACCESS_TOKEN não definido.');
  console.error('');
  console.error('Como obter:');
  console.error('1. Vá a: https://app.supabase.com/account/tokens');
  console.error('2. Clique em "Generate New Token"');
  console.error('3. Copie o token e execute:');
  console.error('   $env:SUPABASE_ACCESS_TOKEN = "seu_token_aqui"');
  process.exit(1);
}

console.log('✓ Access Token encontrado\n');
console.log('Fazendo deploy da Edge Function...\n');

// Ler o arquivo da função
const functionPath = path.join(__dirname, 'supabase', 'functions', 'send-verification-email', 'index.ts');

if (!fs.existsSync(functionPath)) {
  console.error('❌ Arquivo não encontrado:', functionPath);
  process.exit(1);
}

const functionCode = fs.readFileSync(functionPath, 'utf-8');

const deployOptions = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${projectRef}/functions`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
};

const deployData = JSON.stringify({
  name: 'send-verification-email',
  slug: 'send-verification-email',
  code: functionCode,
});

const deployReq = https.request(deployOptions, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    
    if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204) {
      console.log('\n✅ Edge Function criada/deployada com sucesso!\n');
      console.log('🎉 Tudo pronto!\n');
      console.log('Próximo passo:');
      console.log('  npm run dev\n');
      console.log('Teste: Registre um novo usuário e verifique o email.');
    } else {
      console.error('\n❌ Erro no deploy:', res.statusCode);
      if (responseData) {
        console.error('Resposta:', responseData);
      }
      process.exit(1);
    }
  });
});

deployReq.on('error', (e) => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});

deployReq.write(deployData);
deployReq.end();
