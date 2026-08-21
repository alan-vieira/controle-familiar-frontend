#!/bin/bash
# ============================================
# Script de Validação do Container Docker
# Testa saúde, roteamento SPA, cache headers e segurança
# ============================================
set -e

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
HOST="http://localhost:8080"
MAX_WAIT=60
INTERVAL=2
PASSED=0
FAILED=0

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}🧪 Validação do Container Docker${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Função para aguardar container ficar healthy
wait_for_healthy() {
    echo -e "${YELLOW}⏳ Aguardando container ficar healthy (máx. ${MAX_WAIT}s)...${NC}"
    local elapsed=0
    
    while [ $elapsed -lt $MAX_WAIT ]; do
        local status=$(docker inspect controle-familiar-frontend --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
        
        if [ "$status" = "healthy" ]; then
            echo -e "\n${GREEN}✅ Container está healthy!${NC}"
            return 0
        elif [ "$status" = "unhealthy" ]; then
            echo -e "\n${RED}❌ Container está unhealthy${NC}"
            docker compose logs frontend | tail -20
            return 1
        fi
        
        sleep $INTERVAL
        elapsed=$((elapsed + INTERVAL))
        echo -n "."
    done
    
    echo -e "\n${RED}❌ Timeout aguardando health check${NC}"
    return 1
}

# Função para testar endpoint (conteúdo)
test_endpoint() {
    local url=$1
    local expected_pattern=$2
    local description=$3
    
    local response=$(curl -s "$url" 2>/dev/null || echo "ERROR")
    
    if echo "$response" | grep -qi "$expected_pattern"; then
        echo -e "${GREEN}✅ $description${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ $description${NC}"
        echo "   URL: $url"
        echo "   Esperado conter: $expected_pattern"
        ((FAILED++))
        return 1
    fi
}

# Função para testar headers
test_header() {
    local url=$1
    local header_name=$2
    local expected_value=$3
    local description=$4
    
    local header_value=$(curl -sI "$url" 2>/dev/null | grep -i "^$header_name:" | head -1 | sed "s/.*: //" | tr -d '\r' | tr '\n' ' ' || echo "")
    
    if echo "$header_value" | grep -qi "$expected_value"; then
        echo -e "${GREEN}✅ $description${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ $description${NC}"
        echo "   URL: $url"
        echo "   Header: $header_name"
        echo "   Esperado conter: $expected_value"
        echo "   Recebido: '$header_value'"
        ((FAILED++))
        return 1
    fi
}

# Função para testar headers com gzip
test_header_gzip() {
    local url=$1
    local header_name=$2
    local expected_value=$3
    local description=$4
    
    local header_value=$(curl -sI -H "Accept-Encoding: gzip" "$url" 2>/dev/null | grep -i "^$header_name:" | head -1 | sed "s/.*: //" | tr -d '\r' | tr '\n' ' ' || echo "")
    
    if echo "$header_value" | grep -qi "$expected_value"; then
        echo -e "${GREEN}✅ $description${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ $description${NC}"
        echo "   URL: $url"
        echo "   Header: $header_name"
        echo "   Esperado conter: $expected_value"
        echo "   Recebido: '$header_value'"
        ((FAILED++))
        return 1
    fi
}

# Função para testar status code
test_status_code() {
    local url=$1
    local expected_code=$2
    local description=$3
    
    local code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$code" = "$expected_code" ]; then
        echo -e "${GREEN}✅ $description${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ $description${NC}"
        echo "   URL: $url"
        echo "   Esperado: $expected_code"
        echo "   Recebido: '$code'"
        ((FAILED++))
        return 1
    fi
}

# Wrapper para executar e continuar mesmo com falhas (para ver todos os resultados)
run_test() {
    local desc=$1
    local func=$2
    shift 2
    $func "$@" || true
}

# ============================================
# EXECUÇÃO DOS TESTES
# ============================================

# Fase 1: Health Check
echo -e "${BLUE}--- Fase 1: Health Check ---${NC}"
wait_for_healthy || exit 1

# Fase 2: Roteamento SPA
echo -e "\n${BLUE}--- Fase 2: Roteamento SPA ---${NC}"
run_test "Rota / retorna HTML" test_endpoint "$HOST/" "<!DOCTYPE html>" "Rota / retorna HTML"
run_test "Rota /login retorna HTML" test_endpoint "$HOST/login" "<!DOCTYPE html>" "Rota /login retorna HTML (SPA fallback)"
run_test "Rota /dashboard retorna HTML" test_endpoint "$HOST/dashboard" "<!DOCTYPE html>" "Rota /dashboard retorna HTML (SPA fallback)"

# Fase 3: Cache Headers
echo -e "\n${BLUE}--- Fase 3: Cache Headers ---${NC}"
run_test "Assets com cache imutável" test_header "$HOST/assets/index-BV8_I2Bu.js" "Cache-Control" "max-age=31536000" "Assets com cache de 1 ano"
run_test "SW sem cache" test_header "$HOST/sw.js" "Cache-Control" "no-cache" "Service Worker sem cache"
run_test "Manifest sem cache" test_header "$HOST/manifest.webmanifest" "Cache-Control" "no-cache" "Manifest sem cache"
run_test "HTML sem cache" test_header "$HOST/" "Cache-Control" "no-cache" "HTML sem cache agressivo"

# Fase 4: Compressão
echo -e "\n${BLUE}--- Fase 4: Compressão ---${NC}"
run_test "Gzip habilitado" test_header_gzip "$HOST/" "Content-Encoding" "gzip" "Compressão gzip ativa"

# Fase 5: Segurança
echo -e "\n${BLUE}--- Fase 5: Segurança ---${NC}"
run_test "Bloqueio .env" test_status_code "$HOST/.env" "403" "Arquivos .env bloqueados (403)"
run_test "Bloqueio .git" test_status_code "$HOST/.git" "403" "Pastas .git bloqueadas (403)"
run_test "Header X-Frame-Options" test_header "$HOST/" "X-Frame-Options" "SAMEORIGIN" "Header X-Frame-Options presente"
run_test "Header X-Content-Type-Options" test_header "$HOST/" "X-Content-Type-Options" "nosniff" "Header X-Content-Type-Options presente"

# ============================================
# RESUMO FINAL
# ============================================
echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}✅ TESTES PASSARAM: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ TESTES FALHARAM: $FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM! Ambiente 100% validado.${NC}"
fi
echo -e "${BLUE}=========================================${NC}"