# ✅ SETUP FINAL - Resend + Supabase

## O que foi feito:

1. ✅ Edge Function Supabase criada (`supabase/functions/send-verification-email/`)
2. ✅ emailService.ts atualizado para chamar Edge Function (sem CORS)
3. ✅ App compila sem erros
4. ✅ Código gerado localmente para offline

## Próximos 3 passos:

### 1. PowerShell - Obter Token
```powershell
# Vá a: https://app.supabase.com/account/tokens
# Clique em "Generate New Token"
# Copie e execute:
$env:SUPABASE_ACCESS_TOKEN = "seu_token_aqui"
```

### 2. PowerShell - Deploy Edge Function
```powershell
npx supabase functions deploy send-verification-email --project-ref ncnycfmhzpfjmmqzevaz
```

### 3. PowerShell - Adicionar Secret Resend
```powershell
npx supabase secrets set RESEND_API_KEY "re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj" --project-ref ncnycfmhzpfjmmqzevaz
```

## Testar:

```bash
npm run dev
# Registre um novo usuário
# Verifique se recebeu o email
```

## Pronto! 🎉

Emails agora serão enviados via Resend através da Edge Function.
