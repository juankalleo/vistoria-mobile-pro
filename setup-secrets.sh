#!/bin/bash
# Script para configurar secrets no Supabase

# Você precisa criar um Personal Access Token em: https://app.supabase.com/account/tokens

# Usando via API REST em vez de CLI
PROJECT_ID="ncnycfmhzpfjmmqzevaz"

# Esse comando precisa de autenticação
# Alternativa: Use o Supabase Dashboard diretamente
# 1. Vá para: https://app.supabase.com/project/$PROJECT_ID/functions
# 2. Clique em "Secrets" ou "Environment Variables"
# 3. Adicione:
#    - RESEND_API_KEY=re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj
#    - RESEND_FROM_EMAIL=onboarding@resend.dev

echo "Para configurar os secrets, execute os comandos abaixo com um Personal Access Token:"
echo ""
echo "1. Crie um Personal Access Token em: https://app.supabase.com/account/tokens"
echo ""
echo "2. Então execute:"
echo "   export SUPABASE_ACCESS_TOKEN=seu_token_aqui"
echo "   npx supabase secrets set RESEND_API_KEY=re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj --project-ref $PROJECT_ID"
echo "   npx supabase secrets set RESEND_FROM_EMAIL=onboarding@resend.dev --project-ref $PROJECT_ID"
