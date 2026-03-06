# Aplicação SIGEO na AWS

Recursos criados para a aplicação web **SIGEO** (nova aplicação na AWS).

## AWS Amplify (aparece na lista do Amplify)

O app **SIGEO** está criado no Amplify e aparece na lista:

- **App ID:** `dlfqr6sbjb6zp`
- **Console:** [Amplify – Apps](https://us-east-1.console.aws.amazon.com/amplify/home?region=us-east-1) → SIGEO
- **URL padrão Amplify:** https://main.dlfqr6sbjb6zp.amplifyapp.com (após o primeiro deploy concluir)

**Deploy manual (sem Git):** na pasta do projeto, gere o zip e rode o script:

```powershell
cd D:\SERVIDOR\SISGEO\SIGEOV2\SIGEO
npm run build
Compress-Archive -Path dist\* -DestinationPath dist-sigeo.zip -Force
& .\docs\scripts\amplify-deploy-manual.ps1
```

## Recursos

| Recurso | Nome / ID |
|--------|------------|
| **Bucket S3** | `sigeo-advances-web-320674390105` (região us-east-1) |
| **CloudFront** | Distribuição `ESQOBWWRD345Y` — domínio `d3cuhyoqdjo7lt.cloudfront.net` |
| **Alias** | `sigeo.advances.com.br` |
| **OAC** | `EYEINLY0FOMCK` (acesso do CloudFront ao S3) |

## URL

- **Produção:** https://sigeo.advances.com.br  
- Após a propagação do DNS (alguns minutos), o site estará no ar.

## Deploy (atualizar o site)

1. Build do frontend (na pasta `SIGEO`):
   ```bash
   npm run build
   ```
2. Upload para o S3:
   ```bash
   aws s3 sync dist/ s3://sigeo-advances-web-320674390105/ --delete
   aws s3 cp dist/index.html s3://sigeo-advances-web-320674390105/index.html --cache-control "no-cache, no-store, must-revalidate" --content-type "text/html"
   ```
3. (Opcional) Invalidar cache do CloudFront:
   ```bash
   aws cloudfront create-invalidation --distribution-id ESQOBWWRD345Y --paths "/*"
   ```

## API

O frontend usa a API em **https://api.sigeo.advances.com.br** (definida em `.env.production` como `VITE_API_URL`). Mantenha esse endpoint configurado no backend (EC2/Nginx) e no CORS.
