#!/bin/bash
# SIGEO v2 - Cria/atualiza o registro DNS no Route 53 para api.sigeo.advances.com.br
# Uso: ./setup-dns-route53.sh <HOSTED_ZONE_ID> <INSTANCE_ID ou IP>
# Ex.: ./setup-dns-route53.sh Z1234567890ABC i-0abcd1234
# Ex.: ./setup-dns-route53.sh Z1234567890ABC 54.123.45.67

set -e

HOSTED_ZONE_ID="${1:?Informe o ID da Hosted Zone do Route 53 (ex: Z1234567890ABC)}"
INSTANCE_OR_IP="${2:?Informe o ID da instância EC2 (i-xxxx) ou o IP público}"

RECORD_NAME="api.sigeo.advances.com.br"
AWS_REGION="${AWS_REGION:-sa-east-1}"

echo "🔧 Configurando DNS no Route 53 para $RECORD_NAME..."
echo "   Hosted Zone ID: $HOSTED_ZONE_ID"
echo "   Região: $AWS_REGION"
echo ""

# Resolver IP: se for instance ID (i-xxx), buscar IP; senão usar como IP
if [[ "$INSTANCE_OR_IP" == i-* ]]; then
  echo "📡 Obtendo IP público da instância $INSTANCE_OR_IP..."
  IP=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_OR_IP" \
    --region "$AWS_REGION" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text 2>/dev/null || true)
  if [[ -z "$IP" || "$IP" == "None" ]]; then
    echo "❌ Não foi possível obter o IP da instância. Verifique o ID e a região."
    exit 1
  fi
  echo "   IP público: $IP"
else
  IP="$INSTANCE_OR_IP"
  echo "   Usando IP informado: $IP"
fi

# Criar JSON para change-resource-record-sets (upsert do registro A)
TMPFILE=$(mktemp)
cat > "$TMPFILE" << EOF
{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "$RECORD_NAME",
      "Type": "A",
      "TTL": 300,
      "ResourceRecords": [{ "Value": "$IP" }]
    }
  }]
}
EOF

echo ""
echo "📝 Criando/atualizando registro A: $RECORD_NAME -> $IP"

if aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch "file://$TMPFILE" \
  --region "$AWS_REGION" 2>/dev/null; then
  echo "✅ Registro DNS configurado com sucesso."
  echo ""
  echo "Aguarde alguns minutos para a propagação e teste:"
  echo "   https://$RECORD_NAME/status"
  echo ""
  echo "Ou rode o diagnóstico: ./check-v2-health.sh"
else
  echo "❌ Erro ao atualizar o Route 53. Verifique:"
  echo "   - AWS CLI configurado (aws configure)"
  echo "   - Hosted Zone ID correto para o domínio advances.com.br (ou sigeo.advances.com.br)"
  echo "   - Permissão route53:ChangeResourceRecordSets na conta"
  rm -f "$TMPFILE"
  exit 1
fi

rm -f "$TMPFILE"
