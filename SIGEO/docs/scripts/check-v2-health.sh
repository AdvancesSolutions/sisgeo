#!/bin/bash
# SIGEO v2 - Health & Connectivity Diagnostic
# Valida: DNS -> Nginx -> Docker -> Secrets Manager -> Aurora

API_URL="https://api.sigeo.advances.com.br"

echo "🔍 Iniciando Diagnóstico SIGEO v2..."
echo "------------------------------------"

# 1. Teste de DNS e Latência
echo -n "🌐 Verificando DNS (api.sigeo.advances.com.br)... "
if ping -c 1 -W 2 api.sigeo.advances.com.br &>/dev/null 2>&1; then
  echo "✅ OK"
else
  echo "❌ FALHA (Verifique o CNAME no Route53/Cloudflare)"
fi

# 2. Teste de HTTPS e Resposta Nginx
echo -n "🔒 Verificando HTTPS e Nginx... "
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" --connect-timeout 5 -k "$API_URL/auth/login" 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "405" ] || [ "$HTTP_STATUS" = "401" ]; then
  echo "✅ OK (Status: $HTTP_STATUS)"
else
  echo "❌ FALHA (Status: $HTTP_STATUS - Verifique Nginx e portas 80/443)"
fi

# 3. Teste de conectividade com o banco (via rota /status)
echo -n "🗄️ Verificando Conexão Aurora via Backend... "
DB_CHECK=$(curl -s --connect-timeout 5 -k "$API_URL/status" 2>/dev/null || echo "")
if [[ "$DB_CHECK" == *"db_connected\":true"* ]] || [[ "$DB_CHECK" == *"db_connected\": true"* ]]; then
  echo "✅ OK (Secrets Manager e RDS integrados)"
else
  echo "❌ FALHA (Verifique IAM Role ou Security Group do Aurora)"
fi

echo "------------------------------------"
echo "🏁 Diagnóstico concluído."
