# ⚡ Quick Fix: Adicionar Environment Variables na Vercel

## Problema Atual

❌ O arquivo `.env` foi removido do Git (correto para segurança)
❌ Vercel não tem acesso às variáveis durante o build
❌ Por isso dá erro de "ERR_NAME_NOT_RESOLVED" no Supabase

## Solução (3 minutos)

### Opção 1: Via Dashboard (Mais Fácil) ⭐

1. Abra: https://vercel.com/dashboard
2. Clique no seu projeto: `vistoria-mobile`
3. Menu superior → **Settings**
4. Lateral esquerda → **Environment Variables**
5. Clique em **Add Environment Variable**

**Adicione estes 4 valores:**

```
Nome: VITE_SUPABASE_URL
Valor: https://estngdkevauuuwgjcpg.supabase.co
Ambientes: ✓ Production ✓ Preview ✓ Development

Nome: VITE_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdG5nZGtldmF1dXV3Z2pjcGciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMTMyODkwMywiZXhwIjoxNzYyODY0OTAzfQ.iH6dQ9dRBvXbwVBLwJxG7gvwT0WjH4w7-0dFkfwJ5Wk
Ambientes: ✓ Production ✓ Preview ✓ Development

Nome: VITE_RESEND_API_KEY
Valor: re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj
Ambientes: ✓ Production ✓ Preview ✓ Development

Nome: VITE_RESEND_FROM_EMAIL
Valor: onboarding@resend.dev
Ambientes: ✓ Production ✓ Preview ✓ Development
```

6. Depois que adicionar todos, vá em **Deployments**
7. Clique no último deploy
8. Clique nos **3 pontinhos** → **Redeploy**
9. Aguarde ~2 minutos

✅ **Pronto!** O app agora vai funcionar em produção.

### Opção 2: Via CLI (Para Automação)

Instale Vercel CLI:
```powershell
npm i -g vercel
vercel login
```

Depois execute:
```powershell
vercel env add VITE_SUPABASE_URL
# Copie e cole: https://estngdkevauuuwgjcpg.supabase.co
# Selecione: Production, Preview, Development

vercel env add VITE_SUPABASE_ANON_KEY
# Copie e cole: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdG5nZGtldmF1dXV3Z2pjcGciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMTMyODkwMywiZXhwIjoxNzYyODY0OTAzfQ.iH6dQ9dRBvXbwVBLwJxG7gvwT0WjH4w7-0dFkfwJ5Wk

vercel env add VITE_RESEND_API_KEY
# Copie e cole: re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj

vercel env add VITE_RESEND_FROM_EMAIL
# Copie e cole: onboarding@resend.dev

# Depois:
vercel redeploy
```

### Opção 3: Via Script Node.js

```powershell
node add-vercel-env.cjs
```

## Próximos Passos

✅ Variáveis configuradas na Vercel
✅ App faz deploy automaticamente
⏳ Testar registro em: https://vistoria-mobile-9ix4sw3q5-juankalleo4-9284s-projects.vercel.app/

Quando funcionar, próximo é configurar a Edge Function para enviar emails!

## Por que .env foi removido?

- ❌ Nunca commitir `.env` (contém chaves secretas)
- ✅ Usar `.env.local` para desenvolvimento local
- ✅ Usar Dashboard/CLI da Vercel para produção
- ✅ Usar GitHub Secrets para CI/CD (futuro)

**Segurança em primeiro lugar! 🔒**
