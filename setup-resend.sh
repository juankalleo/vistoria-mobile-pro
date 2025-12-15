#!/bin/bash
# 📧 Resend Setup - Script de Configuração Rápida

echo "🚀 Iniciando configuração do Resend com Supabase..."
echo ""

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instalando..."
    npm install -g supabase
fi

echo "✅ Supabase CLI encontrado"
echo ""

# Login
echo "🔐 Fazendo login no Supabase..."
supabase login

echo ""
echo "🔗 Linkando projeto..."
supabase link --project-ref ncnycfmhzpfjmmqzevaz

echo ""
echo "🔑 Adicionando RESEND_API_KEY como secret..."
read -sp "Digite sua chave Resend (ou pressione Enter para usar a pré-configurada): " RESEND_KEY
echo ""

if [ -z "$RESEND_KEY" ]; then
    RESEND_KEY="re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj"
fi

supabase secrets set RESEND_API_KEY "$RESEND_KEY"

echo ""
echo "📦 Fazendo deploy da Edge Function..."
supabase functions deploy send-verification-email

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Abra o app em http://localhost:8080"
echo "2. Registre um novo usuário"
echo "3. Verifique os logs da Edge Function em:"
echo "   https://app.supabase.com/project/ncnycfmhzpfjmmqzevaz/functions"
echo ""
echo "💡 Para testes locais, o código ainda é salvo no console"
