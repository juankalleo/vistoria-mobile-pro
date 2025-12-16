# Fix: Configurar Variáveis de Ambiente na Vercel

## Problema

Ao fazer deploy na Vercel, o app não consegue acessar o Supabase porque as variáveis de ambiente não foram configuradas.

**Erros:**
- `net::ERR_NAME_NOT_RESOLVED` - Supabase URL não está configurada
- `Failed to fetch` - Requisição para Supabase falha
- `manifest.json 401` - PWA manifest não está sendo servido

## Solução

### 1. Acessar Vercel Dashboard

https://vercel.com/dashboard

### 2. Selecionar o Projeto

Procure por: `vistoria-mobile`

### 3. Ir em Settings

No menu superior do projeto, clique em **Settings**

### 4. Variáveis de Ambiente (Environment Variables)

No menu lateral esquerdo, procure por **Environment Variables**

### 5. Adicionar as Variáveis

Clique em **Add Environment Variable** e adicione:

#### Variable 1: Supabase URL
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://estngdkevauuuwgjcpg.supabase.co`
- **Environment**: Selecione "Production", "Preview", "Development"

#### Variable 2: Supabase Anonymous Key
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdG5nZGtldmF1dXV3Z2pjcGciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMTMyODkwMywiZXhwIjoxNzYyODY0OTAzfQ.iH6dQ9dRBvXbwVBLwJxG7gvwT0WjH4w7-0dFkfwJ5Wk`
- **Environment**: Selecione "Production", "Preview", "Development"

#### Variable 3: Resend API Key
- **Name**: `VITE_RESEND_API_KEY`
- **Value**: `re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj`
- **Environment**: Selecione "Production", "Preview", "Development"

#### Variable 4: Resend From Email
- **Name**: `VITE_RESEND_FROM_EMAIL`
- **Value**: `onboarding@resend.dev`
- **Environment**: Selecione "Production", "Preview", "Development"

### 6. Triggerar Novo Deploy

Após adicionar as variáveis:

1. Clique em **Deployments** (menu superior)
2. Procure o deployment mais recente
3. Clique nos 3 pontinhos (...) ao lado
4. Selecione **Redeploy**

Ou, faça push no GitHub:
```powershell
git add .
git commit -m "trigger: redeploy with env vars"
git push origin main
```

### 7. Verificar se Funcionou

Acesse: https://vistoria-mobile-9ix4sw3q5-juankalleo4-9284s-projects.vercel.app/

E tente registrar novamente.

## Alternativa: Usar Arquivo .env.local (Desenvolvimento)

Se quiser testar localmente sem Vercel:

1. Copie `.env` para `.env.local`
2. Execute: `npm run dev`
3. Abra: http://localhost:8080

## Alternativa: GitHub Secrets + Vercel Integration

Se quiser automação completa:

1. Vá ao repositório GitHub
2. Settings → Secrets and variables → Actions
3. Adicione os secrets
4. Configure Vercel para usar os secrets do GitHub (mais avançado)

## Troubleshooting

### "Variables não aparecem no Dashboard"

Solução: Limpar cache do navegador ou fazer logout/login novamente

### "Build ainda falha após adicionar variáveis"

Solução: 
1. Clique em Settings → General
2. Procure por "Build & Development Settings"
3. Verifique se "Build Cache" está ativado/desativado corretamente
4. Faça Redeploy

### "Ainda dá erro de CORS"

Solução: Verificar se o ANON_KEY do Supabase está correto:
1. Acesse: https://app.supabase.com/project/estngdkevauuuwgjcpg/settings/api
2. Copie a chave correta
3. Atualize na Vercel

### "Manifest.json 401"

Solução: O PWA manifest deve ser público. Verificar `public/manifest.json` existe e não tem autenticação.

## Próximos Passos

1. ✅ Adicionar variables na Vercel
2. ✅ Triggar redeploy
3. ✅ Testar registro
4. ⏳ Configurar secrets para Edge Functions
5. ⏳ Testar email com Edge Function

