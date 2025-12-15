# Deploy Edge Function - Passo a Passo

$projectRef = "estngdkevauuuwgjcpg"
$resendApiKey = "re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj"

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "RESEND + SUPABASE SETUP" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Passo 1: Obter Access Token
if (-not $env:SUPABASE_ACCESS_TOKEN) {
    Write-Host "[1] Obter Access Token:" -ForegroundColor Yellow
    Write-Host "    https://app.supabase.com/account/tokens" -ForegroundColor White
    Write-Host ""
    Write-Host "[2] Clique em 'Generate New Token'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "[3] Copie o token e execute:" -ForegroundColor Yellow
    Write-Host '    $env:SUPABASE_ACCESS_TOKEN = "seu_token_aqui"' -ForegroundColor White
    Write-Host ""
    Write-Host "[4] Execute novamente este script" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pressione ENTER quando tiver o token"
    exit
}

Write-Host "✓ Access Token encontrado" -ForegroundColor Green
Write-Host ""

# Passo 2: Deploy da Edge Function
Write-Host "Fazendo deploy da Edge Function..." -ForegroundColor Cyan
Write-Host ""

npx supabase functions deploy send-verification-email --project-ref $projectRef

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximo passo: Adicionar o secret RESEND_API_KEY" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Execute:" -ForegroundColor White
    Write-Host "  npx supabase secrets set RESEND_API_KEY `"$resendApiKey`" --project-ref $projectRef" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erro no deploy. Tente novamente." -ForegroundColor Red
    Write-Host ""
}
