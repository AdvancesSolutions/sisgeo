#!/bin/bash
# Automação de Deploy SIGEO v2 via SSH
# Uso: ./ssh-deploy-v2.sh <IP_DA_EC2> <CAMINHO_DA_CHAVE.pem> [SECRET_ARN] [JWT_SECRET] [FRONTEND_URL]
# Exemplo: ./ssh-deploy-v2.sh 54.123.45.67 ~/.ssh/advances.pem "arn:aws:secretsmanager:..." "meu-jwt-secret" "https://sigeo.advances.com.br"

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TAR_FILE="$BACKEND_DIR/sigeo-backend-v2.tar"

EC2_IP="$1"
KEY_PATH="$2"
SECRET_ARN="${3:-}"
JWT_SECRET="${4:-}"
FRONTEND_URL="${5:-https://sigeo.advances.com.br}"

if [ -z "$EC2_IP" ] || [ -z "$KEY_PATH" ]; then
  echo "❌ Erro: Informe o IP da EC2 e o caminho da chave .pem"
  echo "   Uso: $0 <IP_DA_EC2> <CAMINHO_DA_CHAVE.pem> [SECRET_ARN] [JWT_SECRET] [FRONTEND_URL]"
  exit 1
fi

if [ ! -f "$TAR_FILE" ]; then
  echo "❌ Arquivo $TAR_FILE não encontrado. Execute antes: $SCRIPT_DIR/deploy-backend-ec2.sh"
  exit 1
fi

echo "🚀 Enviando imagem v2 para a EC2 da Advances..."
scp -i "$KEY_PATH" "$TAR_FILE" "ec2-user@${EC2_IP}:/home/ec2-user/sigeo-backend-v2.tar"

echo "🐋 Atualizando container na EC2..."
# Opções do container (args 3, 4, 5 = SECRET_ARN, JWT_SECRET, FRONTEND_URL)
RUN_OPTS="-e AWS_REGION=sa-east-1 -e FRONTEND_URL=$FRONTEND_URL"
[ -n "$SECRET_ARN" ] && RUN_OPTS="$RUN_OPTS -e SECRET_ARN=$SECRET_ARN"
[ -n "$JWT_SECRET" ] && RUN_OPTS="$RUN_OPTS -e JWT_SECRET=$JWT_SECRET"

ssh -i "$KEY_PATH" "ec2-user@${EC2_IP}" << REMOTEEOF
  docker load -i /home/ec2-user/sigeo-backend-v2.tar
  docker stop sigeo-backend-v2 2>/dev/null || true
  docker rm sigeo-backend-v2 2>/dev/null || true
  docker run -d --name sigeo-backend-v2 -p 30:3000 --restart always $RUN_OPTS sigeo-backend-v2:latest
  rm -f /home/ec2-user/sigeo-backend-v2.tar
  echo "✅ Deploy v2 concluído com sucesso!"
REMOTEEOF
