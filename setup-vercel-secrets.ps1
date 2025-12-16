# Script para configurar as variáveis de ambiente na Vercel

Write-Host "🚀 Configurando variáveis de ambiente na Vercel..." -ForegroundColor Green
Write-Host ""

# Verificar se está logado na Vercel
Write-Host "Verificando login na Vercel..."
$vercelStatus = & vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Você não está logado na Vercel. Execute: vercel login" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Logado como: $vercelStatus" -ForegroundColor Green
Write-Host ""

# Adicionar variáveis de ambiente
Write-Host "Adicionando variáveis de ambiente..." -ForegroundColor Yellow

# VITE_SUPABASE_URL
& vercel env add VITE_SUPABASE_URL production <<< "https://esrtngdkevauuuwgjcpg.supabase.co"
Write-Host "✅ VITE_SUPABASE_URL configurada" -ForegroundColor Green

# VITE_SUPABASE_ANON_KEY
& vercel env add VITE_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzcnRuZ2RrZXZhdXV1d2dqY3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Mzk5OTYsImV4cCI6MjA4MTQxNTk5Nn0.5uZtvChVjgZUhdMh7aGol7_Mk6GLJgU8M3F3wnHb1Lg"
Write-Host "✅ VITE_SUPABASE_ANON_KEY configurada" -ForegroundColor Green

# VITE_RESEND_API_KEY
& vercel env add VITE_RESEND_API_KEY production <<< "re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj"
Write-Host "✅ VITE_RESEND_API_KEY configurada" -ForegroundColor Green

# VITE_RESEND_FROM_EMAIL
& vercel env add VITE_RESEND_FROM_EMAIL production <<< "onboarding@resend.dev"
Write-Host "✅ VITE_RESEND_FROM_EMAIL configurada" -ForegroundColor Green

# RESEND_API_KEY para a Edge Function
& vercel env add RESEND_API_KEY production <<< "re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj"
Write-Host "✅ RESEND_API_KEY (Edge Function) configurada" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Todas as variáveis foram configuradas!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Execute: git push"
Write-Host "2. A Vercel fará o deploy automático"
Write-Host "3. Verifique em: https://vistoria-mobile-fxcw2lfzw-juankalleo4-9284s-projects.vercel.app"
