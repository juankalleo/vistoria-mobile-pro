@echo off
REM Deploy da Edge Function Supabase

echo.
echo ========================================
echo RESEND + SUPABASE EDGE FUNCTION SETUP
echo ========================================
echo.

REM Verificar se SUPABASE_ACCESS_TOKEN está configurado
if "%SUPABASE_ACCESS_TOKEN%"=="" (
    echo [1] Obter Access Token em:
    echo     https://app.supabase.com/account/tokens
    echo.
    echo [2] Clique em "Generate New Token"
    echo.
    echo [3] Copie o token
    echo.
    echo [4] Execute no PowerShell:
    echo     $env:SUPABASE_ACCESS_TOKEN='seu_token_aqui'
    echo.
    echo [5] Depois execute este arquivo novamente
    echo.
    pause
    exit /b 1
)

echo ✓ Access Token encontrado
echo.
echo Fazendo deploy da Edge Function...
echo.

cd /d "%~dp0"

npx supabase functions deploy send-verification-email --project-ref estngdkevauuuwgjcpg

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Deploy concluído com sucesso!
    echo.
    echo Próximo passo: Adicionar o secret RESEND_API_KEY
    echo Execute:
    echo   npx supabase secrets set RESEND_API_KEY "re_CXzuhxay_P9xUmuZE75qwV2KUFzwKdvWj" --project-ref estngdkevauuuwgjcpg
    echo.
) else (
    echo.
    echo ❌ Erro no deploy. Tente novamente.
    echo.
)

pause
