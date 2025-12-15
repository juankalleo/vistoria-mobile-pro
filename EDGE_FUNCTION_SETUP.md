# Configurar Supabase Edge Function para Email

## Visão Geral

Ao invés de usar um Node.js proxy separado, vamos usar **Supabase Edge Functions** (Deno) para enviar emails via Resend. Isso simplifica muito o deploy.

## Pré-requisitos

- ✅ Supabase CLI instalada
- ✅ Resend API key: `re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj`
- ✅ Projeto Supabase: `estngdkevauuuwgjcpg`

## Step-by-Step

### 1. Criar a Edge Function

A Edge Function já foi criada! O arquivo está em: `supabase/functions/send-verification-email/index.ts`

Se precisar recriar (por algum motivo):

```powershell
cd C:\Users\combo\Documents\projetos\vistoria-mobile-pro

# Usar npx (não precisa instalar globalmente)
npx supabase functions new send-verification-email
```

### 2. Implementar a Função

A função já está implementada e usa a biblioteca `resend` do npm. Veja o arquivo:
`supabase/functions/send-verification-email/index.ts`

**Características:**
- ✅ Usa a biblioteca `resend` (mais segura que raw fetch)
- ✅ Template HTML profissional
- ✅ Validação de entrada
- ✅ Logs detalhados
- ✅ Tratamento de erros

### 3. Criar arquivo CORS compartilhado

✅ Já criado em: `supabase/functions/_shared/cors.ts`

### 4. Configurar Secrets

⚠️ **IMPORTANTE**: Você precisa configurar os secrets no **Supabase Dashboard**, não via CLI (que requer autenticação).

#### Opção A: Via Dashboard (Recomendado)

1. Acesse: https://app.supabase.com/project/estngdkevauuuwgjcpg/functions
2. Procure por "Functions" no menu lateral
3. Clique em "send-verification-email"
4. Procure a aba "Secrets" ou "Environment Variables"
5. Adicione as variáveis:
   - `RESEND_API_KEY` = `re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj`
   - `RESEND_FROM_EMAIL` = `onboarding@resend.dev`

#### Opção B: Via CLI (Requer Personal Access Token)

```powershell
# 1. Criar token pessoal em: https://app.supabase.com/account/tokens
# 2. Configurar variável de ambiente
$env:SUPABASE_ACCESS_TOKEN = "seu_token_pessoal_aqui"

# 3. Configurar secrets
npx supabase secrets set RESEND_API_KEY=re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj --project-ref estngdkevauuuwgjcpg
npx supabase secrets set RESEND_FROM_EMAIL=onboarding@resend.dev --project-ref estngdkevauuuwgjcpg

# 4. Verificar
npx supabase secrets list --project-ref estngdkevauuuwgjcpg
```

### 5. Testar Localmente (Opcional)

```powershell
# Iniciar Supabase localmente
npx supabase start

# Em outro terminal, testar a função
curl -X POST http://localhost:54321/functions/v1/send-verification-email `
  -H "Content-Type: application/json" `
  -d '{"email": "seu-email@example.com", "code": "123456", "name": "Seu Nome"}'

# Parar Supabase local
npx supabase stop
```

### 6. Deploy da Edge Function

```powershell
# Com authentication token configurado
npx supabase functions deploy send-verification-email --project-ref estngdkevauuuwgjcpg
```

**Saída esperada:**
```
✓ Function 'send-verification-email' deployed successfully
```

Se der erro de autenticação, você pode fazer o deploy via Supabase Dashboard:

1. Vá para: https://app.supabase.com/project/estngdkevauuuwgjcpg/functions
2. Clique em "send-verification-email"
3. Clique em "Deploy" ou "Publish"

### 7. Verificar Deploy

```powershell
# Listar funções (requer autenticação)
npx supabase functions list --project-ref estngdkevauuuwgjcpg
```

Ou no Dashboard: https://app.supabase.com/project/estngdkevauuuwgjcpg/functions

Deve aparecer:
```
send-verification-email | (deployed) | Enabled
```

## Fluxo de Funcionamento

```
1. Usuário cadastra com email: user@example.com
                ↓
2. App chama: https://estngdkevauuuwgjcpg.supabase.co/functions/v1/send-verification-email
                ↓
3. Edge Function recebe: { email, code, name }
                ↓
4. Edge Function chama Resend API com Bearer token
                ↓
5. Resend envia email HTML bonito
                ↓
6. Usuário recebe email com código
                ↓
7. Usuário verifica o código no app
```

## Troubleshooting

### Erro: "supabase: O termo não é reconhecido"

**Solução**: Use `npx` em vez de `supabase`:

```powershell
# ❌ Errado
supabase functions deploy send-verification-email

# ✅ Correto
npx supabase functions deploy send-verification-email
```

### Erro: "POST https://...functions/v1/send-verification-email 403"

**Causa**: Supabase ANON key sem permissão ou secrets não configurados

**Solução**: 
1. Verificar secrets foram configurados no Dashboard
2. Ou, usar um Personal Access Token

### Erro: "RESEND_API_KEY not found" em produção

**Solução**: Configurar no Dashboard:

1. Vá para: https://app.supabase.com/project/estngdkevauuuwgjcpg/functions
2. Clique em "send-verification-email"
3. Aba "Secrets" ou "Environment Variables"
4. Adicione:
   - `RESEND_API_KEY` = `re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj`
   - `RESEND_FROM_EMAIL` = `onboarding@resend.dev`

Ou via CLI:
```powershell
$env:SUPABASE_ACCESS_TOKEN = "seu_token_pessoal"
npx supabase secrets set RESEND_API_KEY=re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj --project-ref estngdkevauuuwgjcpg
```

### Erro: "Email function not found" em produção

**Causa**: Função ainda não foi deployada

**Solução**:
```powershell
npx supabase functions deploy send-verification-email --project-ref estngdkevauuuwgjcpg
```

Ou via Dashboard: https://app.supabase.com/project/estngdkevauuuwgjcpg/functions

### Emails não chegam

1. ✅ Verificar RESEND_API_KEY é válida (pode testar direto em api.resend.com)
2. ✅ Verificar se email está na lista de verificação do Resend (free tier tem restrições)
3. ✅ Verificar logs da Edge Function no Supabase Dashboard → Functions → send-verification-email → Logs

### Erro ao fazer login na CLI

Se `npx supabase login` não funciona:

1. Crie um Personal Access Token: https://app.supabase.com/account/tokens
2. Configure a variável de ambiente:
   ```powershell
   $env:SUPABASE_ACCESS_TOKEN = "seu_token_aqui"
   ```
3. Agora os comandos `npx supabase secrets set` funcionarão

## Próximos Passos

### 1. ✅ Implementar Edge Function
   - [x] Função já existe em `supabase/functions/send-verification-email/index.ts`
   - [x] CORS configurado em `supabase/functions/_shared/cors.ts`

### 2. 🔑 Configurar Secrets
   - [ ] Via Dashboard ou CLI com Personal Access Token
   - [ ] Adicionar `RESEND_API_KEY`
   - [ ] Adicionar `RESEND_FROM_EMAIL`

### 3. 🚀 Deploy no Supabase
   ```powershell
   npx supabase functions deploy send-verification-email --project-ref estngdkevauuuwgjcpg
   ```

### 4. 🧪 Testar Fluxo de Cadastro
   ```powershell
   npm run dev
   ```
   - Criar conta com email
   - Verificar se email é recebido
   - Completar fluxo de OTP

### 5. 🌐 Deploy no Vercel
   ```powershell
   git push origin main
   ```

### 6. 📊 Verificar Logs
   - Dashboard: https://app.supabase.com/project/estngdkevauuuwgjcpg/functions

### Futuro (Não Bloqueante)
   - [ ] Reset de senha por email
   - [ ] Notificações em tempo real (Realtime Subscriptions)
   - [ ] Autenticação biométrica
   - [ ] Suporte a WhatsApp/SMS

## Checklist de Deploy

```
DESENVOLVIMENTO LOCAL
[ ] Supabase CLI instalado (npx supabase)
[ ] emailService.ts configura Edge Function com fallback
[ ] npm run email-proxy para desenvolvimento local
[ ] npm run dev funciona

SUPABASE PRODUCTION
[ ] Personal Access Token criado (opcional)
[ ] Secrets RESEND_API_KEY e RESEND_FROM_EMAIL configurados
[ ] Edge Function deployada
[ ] Logs aparecem em Dashboard

APLICAÇÃO
[ ] Fluxo de cadastro funciona
[ ] Email é recebido
[ ] OTP verifica corretamente
[ ] Dados sincronizam offline-first

VERCEL
[ ] Projeto conectado ao GitHub
[ ] Build executa sem erros
[ ] Edge Function URL configurada em .env
[ ] Deploy automático ativado
```

## Documentação Oficial

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Resend SDK Deno](https://resend.com/docs/send-email)
- [Deno Runtime](https://docs.deno.com/)
- [Personal Access Tokens](https://supabase.com/docs/guides/auth/api-tokens)
