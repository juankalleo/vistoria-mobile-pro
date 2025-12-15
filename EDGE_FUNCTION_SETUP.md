# Configurar Supabase Edge Function para Email

## Visão Geral

Ao invés de usar um Node.js proxy separado, vamos usar **Supabase Edge Functions** (Deno) para enviar emails via Resend. Isso simplifica muito o deploy.

## Pré-requisitos

- ✅ Supabase CLI instalada
- ✅ Resend API key: `re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj`
- ✅ Projeto Supabase: `ncnycfmhzpfjmmqzevaz`

## Step-by-Step

### 1. Criar a Edge Function

Se ainda não existe, criar:

```powershell
cd C:\Users\combo\Documents\projetos\vistoria-mobile-pro

supabase functions new send-verification-email --project-ref ncnycfmhzpfjmmqzevaz
```

Isso cria: `supabase/functions/send-verification-email/index.ts`

### 2. Implementar a Função

Abra `supabase/functions/send-verification-email/index.ts` e substitua o conteúdo:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Apenas POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { email, code, name } = await req.json();

    // Validar entrada
    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email e code são obrigatórios" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validar API key
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "Email service não configurado" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #1f3a8a; margin: 0;">Bem-vindo${name ? `, ${name}` : ""}! 👋</h2>
              <p style="color: #666; margin-top: 10px;">Vistoria Mobile - Verificação Veicular</p>
            </div>

            <div style="background: linear-gradient(135deg, #1f3a8a 0%, #6366f1 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
              <p style="color: white; margin: 0 0 10px; opacity: 0.9;">Seu código de verificação:</p>
              <h1 style="letter-spacing: 8px; color: white; margin: 0; font-size: 48px; font-weight: bold;">${code}</h1>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                ⏱️ Este código expira em <strong>10 minutos</strong>
              </p>
              <p style="margin: 10px 0 0; color: #666; font-size: 14px;">
                💡 Se não solicitou este código, ignore este email.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Vistoria Mobile v1.0 | Verificação Veicular Profissional
              </p>
            </div>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend error:", data);
      return new Response(
        JSON.stringify({ error: data.message || "Erro ao enviar email" }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Email enviado com sucesso:", data.id);
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
```

### 3. Criar arquivo CORS compartilhado

Se não existe `supabase/functions/_shared/cors.ts`, criar:

```typescript
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

### 4. Configurar Secrets

```powershell
# Configurar as variáveis de ambiente da Edge Function
supabase secrets set RESEND_API_KEY=re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj `
  RESEND_FROM_EMAIL=onboarding@resend.dev `
  --project-ref ncnycfmhzpfjmmqzevaz
```

**Saída esperada:**
```
✓ Secrets set for project ncnycfmhzpfjmmqzevaz
```

### 5. Testar Localmente (Opcional)

```powershell
# Iniciar Supabase localmente (se tiver banco local)
supabase start --project-ref ncnycfmhzpfjmmqzevaz

# Em outro terminal, testar a função
curl -X POST http://localhost:54321/functions/v1/send-verification-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu-token-aqui" \
  -d '{"email": "seu-email@example.com", "code": "123456", "name": "Seu Nome"}'
```

### 6. Deploy da Edge Function

```powershell
supabase functions deploy send-verification-email --project-ref ncnycfmhzpfjmmqzevaz
```

**Saída esperada:**
```
✓ Function 'send-verification-email' deployed successfully
```

### 7. Verificar Deploy

```powershell
# Listar funções deployadas
supabase functions list --project-ref ncnycfmhzpfjmmqzevaz
```

Deve aparecer:
```
send-verification-email | (deployed)
```

## Fluxo de Funcionamento

```
1. Usuário cadastra com email: user@example.com
                ↓
2. App chama: https://ncnycfmhzpfjmmqzevaz.supabase.co/functions/v1/send-verification-email
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

### Erro: "POST https://...functions/v1/send-verification-email 403"

**Causa**: Supabase ANON key sem permissão

**Solução**: Use `VITE_SUPABASE_ANON_KEY` correta ou configure RLS:

```sql
-- No Supabase SQL Editor
CREATE POLICY "Allow public function calls"
ON public.functions
FOR SELECT
USING (true);
```

### Erro: "RESEND_API_KEY not found"

**Solução**: Verificar se secrets foram configurados:

```powershell
supabase secrets list --project-ref ncnycfmhzpfjmmqzevaz
```

Se não aparecer, executar:

```powershell
supabase secrets set RESEND_API_KEY=re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj \
  --project-ref ncnycfmhzpfjmmqzevaz
```

### Erro: "Email function not found" em produção

**Causa**: Função ainda não foi deployada

**Solução**:
```powershell
supabase functions deploy send-verification-email --project-ref ncnycfmhzpfjmmqzevaz
```

### Emails não chegam

1. Verificar RESEND_API_KEY é válida (pode testar direto em api.resend.com)
2. Verificar se email está na lista de verificação do Resend (free tier)
3. Verificar logs da Edge Function no Supabase Dashboard → Functions

## Próximos Passos

1. ✅ Implementar Edge Function
2. ✅ Deploy no Supabase
3. ✅ Testar fluxo de cadastro
4. Implementar reset de senha
5. Adicionar autenticação biométrica (fingerprint)

## Documentação

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Resend Docs](https://resend.com/docs)
- [Deno](https://docs.deno.com/)
