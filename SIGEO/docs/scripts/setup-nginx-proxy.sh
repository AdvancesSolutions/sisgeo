#!/bin/bash
# Configuração de Proxy Reverso Nginx para SIGEO v2
# Executar NA EC2. Nginx recebe 80/443 e encaminha para o container na porta 30.

set -e
echo "📥 Instalando Nginx..."
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo "⚙️ Configurando o domínio api.sigeo.advances.com.br..."

sudo tee /etc/nginx/conf.d/sigeo_v2.conf > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name api.sigeo.advances.com.br;

    location / {
        proxy_pass http://127.0.0.1:30;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

echo "🔄 Testando e reiniciando Nginx..."
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Proxy configurado. Próximos passos:"
echo "   1. DNS: CNAME api.sigeo.advances.com.br → IP desta EC2"
echo "   2. Security Group: abrir portas 80 e 443 (Inbound)"
echo "   3. SSL: sudo certbot --nginx -d api.sigeo.advances.com.br (Certbot) ou terminar SSL no ALB/CloudFront"
