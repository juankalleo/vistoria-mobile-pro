const https = require('https');

// Adicionar secret do Resend no Supabase
const projectRef = 'estngdkevauuuwgjcpg';
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const resendApiKey = 're_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj';

if (!accessToken) {
  console.error('❌ SUPABASE_ACCESS_TOKEN não definido. Siga os passos:');
  console.error('1. Vá a: https://app.supabase.com/account/tokens');
  console.error('2. Clique em "Generate New Token"');
  console.error('3. Copy o token');
  console.error('4. Execute: set SUPABASE_ACCESS_TOKEN=seu_token_aqui');
  console.error('5. Execute novamente: node setup-resend-secret.js');
  process.exit(1);
}

const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${projectRef}/secrets`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
};

const data = JSON.stringify({
  name: 'RESEND_API_KEY',
  value: resendApiKey,
});

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 201 || res.statusCode === 200) {
      console.log('✅ Secret RESEND_API_KEY adicionado com sucesso!');
      console.log('');
      console.log('Próximo passo: Deploy da Edge Function');
      console.log('Execute no terminal:');
      console.log('  npx supabase functions deploy send-verification-email');
    } else {
      console.error('❌ Erro ao adicionar secret:', res.statusCode);
      console.error(responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erro:', e.message);
});

req.write(data);
req.end();
