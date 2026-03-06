#!/bin/bash
# SIGEO v2 - Deploy Frontend para S3 (+ invalidação CloudFront opcional)
# Uso: ./deploy-web-s3.sh <bucket-name> [distribution-id]
# Ex: ./deploy-web-s3.sh sigeo-web-v2-320674390105 E3RLLWX6JCRSBC

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUCKET_NAME="${1:?Informe o bucket S3}"
DIST_ID="${2:-}"

# Frontend Vite fica em ../../ (pasta SIGEO, irmã de docs)
WEB_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🏗️ Building Frontend v2..."
cd "$WEB_DIR"
npm install
npm run build

echo "📤 Sincronizando com S3: $BUCKET_NAME..."
aws s3 sync dist/ "s3://$BUCKET_NAME/" --delete
aws s3 cp dist/index.html "s3://$BUCKET_NAME/index.html" --cache-control "no-cache"

if [ -n "$DIST_ID" ]; then
  echo "🧹 Invalidando Cache CloudFront..."
  aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
fi

echo "✅ Deploy web v2 concluído: s3://$BUCKET_NAME"
