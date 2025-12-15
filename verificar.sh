#!/bin/bash
# Script de Verificação - Todos os arquivos criados

echo "🔍 Verificando Implementação..."
echo ""

# Contar arquivos
echo "📊 ESTATÍSTICAS:"
echo "─────────────────────────────"

# Telas
echo "✅ Telas React:"
test -f "src/screens/LoginScreen.tsx" && echo "  ✓ LoginScreen.tsx" || echo "  ✗ LoginScreen.tsx"
test -f "src/screens/VerifyOTPScreen.tsx" && echo "  ✓ VerifyOTPScreen.tsx" || echo "  ✗ VerifyOTPScreen.tsx"
test -f "src/screens/AdminPanel.tsx" && echo "  ✓ AdminPanel.tsx" || echo "  ✗ AdminPanel.tsx"

# Serviços
echo ""
echo "✅ Serviços:"
test -f "src/services/authService.ts" && echo "  ✓ authService.ts" || echo "  ✗ authService.ts"
test -f "src/services/vistoriaService.ts" && echo "  ✓ vistoriaService.ts" || echo "  ✗ vistoriaService.ts"
test -f "src/services/supabaseClient.ts" && echo "  ✓ supabaseClient.ts" || echo "  ✗ supabaseClient.ts"

# Store
echo ""
echo "✅ Estado (Zustand):"
test -f "src/store/useAuthStore.ts" && echo "  ✓ useAuthStore.ts" || echo "  ✗ useAuthStore.ts"

# Tipos
echo ""
echo "✅ Tipos:"
test -f "src/types/auth.ts" && echo "  ✓ auth.ts" || echo "  ✗ auth.ts"

# Banco de Dados
echo ""
echo "✅ Banco de Dados:"
test -f "SUPABASE_SETUP.sql" && echo "  ✓ SUPABASE_SETUP.sql" || echo "  ✗ SUPABASE_SETUP.sql"

# Configuração
echo ""
echo "✅ Configuração:"
test -f ".env.example" && echo "  ✓ .env.example" || echo "  ✗ .env.example"
test -f "package.json" && echo "  ✓ package.json" || echo "  ✗ package.json"

# Documentação
echo ""
echo "✅ Documentação:"
test -f "LEIA_PRIMEIRO.md" && echo "  ✓ LEIA_PRIMEIRO.md" || echo "  ✗ LEIA_PRIMEIRO.md"
test -f "COMECE_AQUI.md" && echo "  ✓ COMECE_AQUI.md" || echo "  ✗ COMECE_AQUI.md"
test -f "IMPLEMENTACAO.md" && echo "  ✓ IMPLEMENTACAO.md" || echo "  ✗ IMPLEMENTACAO.md"
test -f "AUTH_SETUP_GUIDE.md" && echo "  ✓ AUTH_SETUP_GUIDE.md" || echo "  ✗ AUTH_SETUP_GUIDE.md"
test -f "CHECKLIST_IMPLEMENTACAO.md" && echo "  ✓ CHECKLIST_IMPLEMENTACAO.md" || echo "  ✗ CHECKLIST_IMPLEMENTACAO.md"
test -f "RESULTADO_FINAL.md" && echo "  ✓ RESULTADO_FINAL.md" || echo "  ✗ RESULTADO_FINAL.md"
test -f "RESUMO_EXECUTIVO.md" && echo "  ✓ RESUMO_EXECUTIVO.md" || echo "  ✗ RESUMO_EXECUTIVO.md"
test -f "INDICE_DOCUMENTACAO.md" && echo "  ✓ INDICE_DOCUMENTACAO.md" || echo "  ✗ INDICE_DOCUMENTACAO.md"

echo ""
echo "─────────────────────────────"
echo "✅ VERIFICAÇÃO COMPLETA!"
echo ""
echo "📖 PRÓXIMO PASSO: Leia LEIA_PRIMEIRO.md"
echo ""
