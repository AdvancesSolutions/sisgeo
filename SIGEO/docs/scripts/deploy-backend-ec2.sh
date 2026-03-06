#!/bin/bash
# SIGEO v2 - Build e Push para ECR ou Geração de Tarball
# Uso: ./deploy-backend-ec2.sh [--ecr]
# Com --ecr: usa variáveis AWS_REGION e AWS_ACCOUNT_ID

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
IMAGE_NAME="sigeo-backend-v2"
TAG="latest"

echo "🔨 Iniciando Build da Imagem v2..."
cd "$BACKEND_DIR"
docker build -t "$IMAGE_NAME:$TAG" -f Dockerfile .

if [ "$1" == "--ecr" ]; then
  echo "☁️ Fazendo Push para o AWS ECR..."
  aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
  ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_NAME:$TAG"
  docker tag "$IMAGE_NAME:$TAG" "$ECR_URI"
  aws ecr describe-repositories --repository-names "$IMAGE_NAME" --region "$AWS_REGION" 2>/dev/null || \
    aws ecr create-repository --repository-name "$IMAGE_NAME" --region "$AWS_REGION"
  docker push "$ECR_URI"
  echo "✅ Imagem disponível: $ECR_URI"
else
  echo "📦 Gerando sigeo-backend-v2.tar para envio manual..."
  docker save "$IMAGE_NAME:$TAG" -o "$BACKEND_DIR/sigeo-backend-v2.tar"
  echo "✅ Arquivo gerado: $BACKEND_DIR/sigeo-backend-v2.tar"
fi

echo ""
echo "Na EC2: docker run -d --restart unless-stopped -p 3000:3000 \\"
echo "  -e DATABASE_URL=... -e JWT_SECRET=... -e FRONTEND_URL=... \\"
echo "  --name sigeo-api-v2 $IMAGE_NAME:$TAG"
