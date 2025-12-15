# Deploy com Supabase Edge Functions + Offline-First

## Resumo da Solução

Este projeto implementa uma arquitetura **hybrid offline-first**:
- **Supabase Edge Functions** para autenticação (login/cadastro) com envio de emails
- **IndexedDB** para armazenamento local de dados da vistoria
- **Sincronização automática** quando online

**Benefício**: Funciona completamente offline EXCETO login/cadastro. Quando back online, sincroniza dados.

## Arquitetura

```
DESENVOLVIMENTO LOCAL:
┌─────────────────────────┐
│   React App (PWA)       │
│   - IndexedDB (local)   │
│   - Service Worker      │
└──────────────┬──────────┘
               │
        ┌──────┴──────────┐
        │                 │
   [ONLINE]          [OFFLINE]
        │                 │
        ↓                 ↓
┌─────────────────┐  IndexedDB
│ Supabase        │  persiste
│ Auth + Email    │  dados
└─────────────────┘
        │
        ↓
   Banco de Dados
   (PostgreSQL)


PRODUÇÃO (Vercel):
┌─────────────────────────┐
│   React App (PWA)       │  <- Vercel
│   - IndexedDB (local)   │
│   - Service Worker      │
└──────────────┬──────────┘
               │
        ┌──────┴──────────┐
        │                 │
   [ONLINE]          [OFFLINE]
        │                 │
        ↓                 ↓
┌──────────────────┐  IndexedDB
│ Supabase         │  persiste
│ Edge Functions   │  + Queue
│ + Auth + Email   │
└──────────────────┘
        │
        ↓
   Banco de Dados
   (PostgreSQL)
```

## Fluxo Offline-First

### 1. Vistoria (Funciona Offline ✅)
```
Usuário preenche vistoria
    ↓
Salva no IndexedDB localmente
    ↓
[Se ONLINE] → Sincroniza para Supabase
[Se OFFLINE] → Adiciona à fila de sincronização
    ↓
Quando volta online → Sincroniza automaticamente
```

### 2. Login/Cadastro (Requer Online)
```
Usuário tenta fazer login/cadastro
    ↓
[Se OFFLINE] → Mostra mensagem: "Cadastro requer conexão"
[Se ONLINE] → 
    ↓
Envia para Supabase Edge Function
    ↓
Edge Function valida + envia email via Resend
    ↓
Usuário recebe OTP
    ↓
Verifica OTP (funciona offline após primeira sync)
    ↓
Acesso liberado
```

## Implementação

### Step 1: Criar Supabase Edge Function

```powershell
# Criar função
supabase functions new send-verification-email --project-ref estngdkevauuuwgjcpg
```

### Step 2: Atualizar Edge Function

Arquivo: `supabase/functions/send-verification-email/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";

serve(async (req) => {
  // Apenas POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { email, code, name } = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email e code são obrigatórios" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Chamar Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: email,
        subject: "Seu código de verificação - Vistoria Mobile",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Bem-vindo${name ? `, ${name}` : ""}! 👋</h2>
            <p>Seu código de verificação é:</p>
            <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="letter-spacing: 10px; color: #1f3a8a; margin: 0;">${code}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">
              ⏱️ Válido por 10 minutos<br>
              Se você não solicitou este código, ignore este email.
            </p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao enviar email");
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

### Step 3: Atualizar emailService.ts

```typescript
export async function sendVerificationEmail(
  email: string,
  code: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Tentar usar Edge Function primeiro (produção)
    const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-verification-email`;
    
    try {
      const response = await fetch(edgeFunctionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email, code, name }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Email enviado via Supabase Edge Function:", data.id);
        return { success: true };
      }
    } catch (edgeError) {
      console.warn("Edge Function indisponível, tentando fallback...");
    }

    // Fallback: Email Proxy local (desenvolvimento)
    const response = await fetch("http://localhost:3001/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, name }),
    });

    if (response.ok) {
      console.log("✅ Email enviado via Email Proxy local");
      return { success: true };
    }

    return { success: false, error: "Proxy indisponível" };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false, error: error.message };
  }
}
```

### Step 4: Deploy no Supabase

```powershell
# Terminal (com admin token)
supabase secrets set RESEND_API_KEY=re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj \
  RESEND_FROM_EMAIL=onboarding@resend.dev \
  --project-ref estngdkevauuuwgjcpg

# Deploy
supabase functions deploy send-verification-email --project-ref estngdkevauuuwgjcpg
```

### Step 5: Atualizar Vistoria Service (Sincronização)

Já está implementado em `vistoriaService.ts`:
- ✅ Salva localmente no IndexedDB
- ✅ Se online, sincroniza com Supabase
- ✅ Se offline, adiciona à fila de sincronização
- ✅ Sincroniza automaticamente quando volta online

## Desenvolvimento Local

### Terminal 1: Email Proxy (Fallback)
```powershell
npm run email-proxy
```

### Terminal 2: App Dev
```powershell
npm run dev
```

**Nota**: O app usa Edge Function se disponível, fallback para proxy local.

## Deploy em Produção

### Vercel Frontend
```powershell
git push origin main
# Deploy automático no Vercel
```

### Supabase Backend
```powershell
# Caso não tenha permissões ainda, pedir ao admin:
supabase functions deploy send-verification-email --project-ref estngdkevauuuwgjcpg
```

**Pronto!** Nenhum servidor Node.js separado necessário.

## Funcionalidades por Modo

| Feature | Online | Offline |
|---------|--------|---------|
| Login/Cadastro | ✅ | ❌ (msg) |
| Verificar OTP | ✅ | ✅ (após sync) |
| Criar Vistoria | ✅ | ✅ |
| Salvar Vistoria | ✅ | ✅ |
| Sincronizar Dados | ✅ | ⏸️ (depois) |
| Ver Vistorias | ✅ | ✅ (locais) |

## Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://estngdkevauuuwgjcpg.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
VITE_RESEND_API_KEY=re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj
VITE_RESEND_FROM_EMAIL=onboarding@resend.dev
```

## Troubleshooting

### "Email Function not found" em produção
- Verificar se Edge Function foi deployada
- Checar: `supabase functions list --project-ref estngdkevauuuwgjcpg`

### Dados offline não sincronizam
- Verificar conexão com Supabase
- Checar IndexedDB: DevTools → Application → IndexedDB
- Verificar logs em `vistoriaService.ts`

## Próximos Passos

1. ✅ Implementar Supabase Edge Function
2. ✅ Testar localmente com proxy
3. ✅ Deploy no Supabase
4. ✅ Deploy no Vercel
5. Implementar reset de senha por email
6. Adicionar notificações em tempo real (Realtime Subscriptions)
