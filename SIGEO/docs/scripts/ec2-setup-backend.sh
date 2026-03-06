#!/bin/bash
# SIGEO v2 - EC2 Environment Setup (executar na instância EC2)

set -e
echo "🛠️ Atualizando pacotes e instalando Docker..."
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user 2>/dev/null || true

echo "🔑 NOTA: Certifique-se que esta EC2 tem uma IAM Role com permissão 'secretsmanager:GetSecretValue' para o ARN do secret."

echo "📦 Carregando imagem (se enviou sigeo-backend-v2.tar)..."
if [ -f /tmp/sigeo-backend-v2.tar ]; then
  docker load -i /tmp/sigeo-backend-v2.tar
fi

echo ""
echo "🐳 Rodando o Backend SIGEO v2 (credenciais via Secrets Manager + IAM Role)..."
echo "   Variáveis: SECRET_ARN (obrigatório), JWT_SECRET, FRONTEND_URL, AWS_REGION"
echo ""
docker run -d \
  --name sigeo-backend-v2 \
  -p 30:3000 \
  --restart always \
  -e AWS_REGION="${AWS_REGION:-sa-east-1}" \
  -e SECRET_ARN="${SECRET_ARN}" \
  -e JWT_SECRET="${JWT_SECRET}" \
  -e FRONTEND_URL="${FRONTEND_URL:-https://sigeo.advances.com.br}" \
  sigeo-backend-v2:latest

echo "✅ Container rodando. API exposta na porta 30 (host). Abra Inbound Rule no Security Group da EC2 para a porta 30."
