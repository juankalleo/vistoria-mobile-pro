# Deploy com Email Proxy

## Resumo da Solução

Este projeto usa um **Node.js Email Proxy** local para contornar restrições CORS ao enviar emails via Resend API. O proxy executa em `localhost:3001` e atua como intermediário entre a aplicação React e a API do Resend.

## Arquitetura

```
React App (localhost:8080)
    ↓
emailService.ts (fetch para localhost:3001)
    ↓
email-proxy.cjs (Express server na porta 3001)
    ↓
Resend API (https://api.resend.com/emails)
    ↓
Email do usuário
```

## Desenvolvimento Local

### Terminal 1: Iniciar Email Proxy
```powershell
npm run email-proxy
```
Saída esperada:
```
✅ Email proxy server running on http://localhost:3001
📧 Ready to send emails via Resend API
```

### Terminal 2: Iniciar Aplicação
```powershell
npm run dev
```

Agora a aplicação pode enviar emails durante o desenvolvimento.

## Deploy em Produção

### Opção 1: Vercel + Backend Separado (RECOMENDADO)

Para usar o Email Proxy em produção, é necessário um **servidor Node.js separado**:

1. **Deploy do Frontend (React) no Vercel:**
   ```powershell
   # Automaticamente ao fazer push para main
   git push origin main
   ```

2. **Deploy do Backend (Email Proxy) em um servidor Node.js:**
   - Render.com
   - Railway.app
   - Heroku
   - DigitalOcean
   - AWS EC2

3. **Atualizar variáveis de ambiente:**
   
   No Vercel, adicionar:
   ```
   VITE_EMAIL_PROXY_URL=https://seu-proxy-backend.com
   ```

4. **Atualizar emailService.ts:**
   
   ```typescript
   const proxyUrl = import.meta.env.VITE_EMAIL_PROXY_URL || 'http://localhost:3001';
   const response = await fetch(`${proxyUrl}/api/send-email`, {
     // resto do código...
   });
   ```

### Opção 2: Supabase Edge Functions (Alternativa Futura)

Quando tiver permissões de admin no Supabase, pode substituir o proxy Node.js por uma Edge Function:

```powershell
supabase functions deploy send-verification-email --project-ref ncnycfmhzpfjmmqzevaz
```

Isso eliminaria a necessidade de um servidor separado.

### Opção 3: Serverless (AWS Lambda)

O arquivo `email-proxy.cjs` pode ser convertido para AWS Lambda usando `serverless-offline` ou adaptando o código.

## Arquivos Relacionados

- **email-proxy.cjs** - Servidor Express CORS proxy
- **src/services/emailService.ts** - Cliente de email com fallback
- **package.json** - Script `npm run email-proxy`
- **.env** - Configurações de API

## Variáveis de Ambiente Necessárias

```env
# .env (deve existir antes de usar)
VITE_RESEND_API_KEY=re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj
VITE_RESEND_FROM_EMAIL=onboarding@resend.dev
VITE_SUPABASE_URL=https://ncnycfmhzpfjmmqzevaz.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

## Troubleshooting

### Erro: "Cannot find module 'express'"
```powershell
npm install express cors
```

### Erro: "Email proxy unreachable"
- Verificar se o proxy está rodando: `npm run email-proxy`
- Verificar porta 3001: `netstat -ano | findstr :3001`

### Erro: "RESEND_API_KEY not found"
- Verificar se `.env` existe
- Verificar se a chave está correta

## Próximos Passos

1. Testar fluxo completo localmente
2. Obter permissões de admin Supabase para usar Edge Functions
3. Decidir estratégia de deploy (opção 1, 2 ou 3)
4. Implementar email templates profissionais
