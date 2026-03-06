# DNS e aliases – SIGEO (sigeo-old vs sigeo)

## Resumo

| Sistema   | Domínio                      | CloudFront / destino        |
|----------|-----------------------------|-----------------------------|
| **v2 (atual)** | **sigeo.advances.com.br**     | `d2qar6y47tn4rs` (E3RLLWX6JCRSBC) |
| **Antigo**    | **sigeo-old.advances.com.br** | `d128hx2c5x0vmt`                 |

## O que já está feito (nesta conta)

- **Route 53**
  - `sigeo.advances.com.br` → A (Alias) → `d2qar6y47tn4rs.cloudfront.net` (v2).
  - `sigeo-old.advances.com.br` → A (Alias) → `d128hx2c5x0vmt.cloudfront.net` (antigo).
  - `sigeo-v2.advances.com.br` → A (Alias) → `d2qar6y47tn4rs.cloudfront.net` (v2).
  - `api.sigeo.advances.com.br` → A → IP da EC2.

## Para o v2 responder em https://sigeo.advances.com.br

O alias `sigeo.advances.com.br` ainda está na distribuição antiga (`d128hx2c5x0vmt`). Quando for liberado (na outra conta):

1. Na distribuição antiga: trocar o CNAME de `sigeo.advances.com.br` para `sigeo-old.advances.com.br`.
2. Nesta conta, adicionar o alias na distribuição v2:

```bash
# Gera o config com alias sigeo.advances.com.br (Node em UTF-8)
node -e "
const fs = require('fs');
const { execSync } = require('child_process');
const out = execSync('aws cloudfront get-distribution-config --id E3RLLWX6JCRSBC --output json', { encoding: 'utf8' });
const data = JSON.parse(out);
const config = data.DistributionConfig;
config.Aliases.Quantity = 2;
config.Aliases.Items = ['sigeo-v2.advances.com.br', 'sigeo.advances.com.br'];
fs.writeFileSync('cf-update-node.json', JSON.stringify(config, null, 2), 'utf8');
"
ETAG=$(aws cloudfront get-distribution-config --id E3RLLWX6JCRSBC --query "ETag" --output text)
aws cloudfront update-distribution --id E3RLLWX6JCRSBC --if-match "$ETAG" --distribution-config file://cf-update-node.json
```

(No Windows/PowerShell use o `cf-update-node.json` já gerado em `docs/scripts/` e o ETag atual.)

## Arquivos de apoio

- `route53-sigeo-old-and-main.json` – criação/atualização do registro `sigeo-old.advances.com.br`.
- `route53-sigeo-main-to-v2.json` – apontamento de `sigeo.advances.com.br` para o CloudFront v2.
- `cf-update-node.json` – config da distribuição v2 com alias `sigeo.advances.com.br` (gerado pelo script acima).
