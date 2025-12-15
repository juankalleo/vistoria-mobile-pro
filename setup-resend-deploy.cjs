#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const projectRef = 'estngdkevauuuwgjcpg';
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const resendApiKey = 're_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj';

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

// Passo 1: Adicionar Secret
console.log('Adicionando secret RESEND_API_KEY...');

const secretOptions = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${projectRef}/secrets`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
};

const secretData = JSON.stringify({
  name: 'RESEND_API_KEY',
  value: resendApiKey,
});

const secretReq = https.request(secretOptions, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 201 || res.statusCode === 200) {
      console.log('✅ Secret RESEND_API_KEY adicionado!\n');
      deployFunction();
    } else if (res.statusCode === 409) {
      console.log('✅ Secret RESEND_API_KEY já existe (ou foi atualizado)\n');
      deployFunction();
    } else {
      console.error('❌ Erro ao adicionar secret:', res.statusCode);
      console.error(responseData);
      process.exit(1);
    }
  });
});

secretReq.on('error', (e) => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});

secretReq.write(secretData);
secretReq.end();

// Passo 2: Deploy da Edge Function
function deployFunction() {
  console.log('Fazendo deploy da Edge Function...');

  // Ler o arquivo da função
  const functionPath = path.join(__dirname, 'supabase', 'functions', 'send-verification-email', 'index.ts');
  
  if (!fs.existsSync(functionPath)) {
    console.error('❌ Arquivo não encontrado:', functionPath);
    process.exit(1);
  }

  const functionCode = fs.readFileSync(functionPath, 'utf-8');

  const deployOptions = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${projectRef}/functions/send-verification-email`,
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/typescript',
    },
  };

  const deployReq = https.request(deployOptions, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ Edge Function deployada com sucesso!\n');
        console.log('🎉 Tudo pronto!\n');
        console.log('Próximo passo:');
        console.log('  npm run dev\n');
        console.log('Teste: Registre um novo usuário e verifique o email.');
      } else {
        console.error('❌ Erro no deploy:', res.statusCode);
        console.error(responseData);
        process.exit(1);
      }
    });
  });

  deployReq.on('error', (e) => {
    console.error('❌ Erro:', e.message);
    process.exit(1);
  });

  deployReq.write(functionCode);
  deployReq.end();
}
