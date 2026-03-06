# Guia de Deploy SIGEO v2

A versão 2 é isolada para garantir a integridade da versão 1 já existente.

---

## 1. Aurora RDS

- **Cluster:** Criar Amazon Aurora (MySQL ou Postgres) no console RDS.
- **Setup:** Rodar `docs/scripts/aurora-init.sql` (MySQL) ou `docs/scripts/aurora-init.pg.sql` (PostgreSQL) no console do banco. Trocar o hash do admin por um BCrypt real antes de executar.
- **Security Group:** Liberar porta **3306** (MySQL) ou **5432** (PostgreSQL) para o IP ou Security Group da EC2 do backend.

---

## 2. Backend (EC2 + Docker)

- Instalar Docker na EC2: use o script `docs/scripts/ec2-setup-backend.sh` ou `sudo yum install docker -y && sudo service docker start`.
- **Modo corporativo (Secrets Manager):** em vez de `.env` ou `DATABASE_URL`, defina **`SECRET_ARN`** (ARN do secret no AWS Secrets Manager). O backend busca as credenciais do Aurora em tempo real. A EC2 deve ter uma **IAM Role** com permissão `secretsmanager:GetSecretValue` para esse ARN.
- **Variáveis de ambiente:**
  - **Com Secrets Manager:** `SECRET_ARN`, `JWT_SECRET`, `FRONTEND_URL`, `AWS_REGION` (ex: `sa-east-1`). Opcional: `SECRET_DATABASE` (default: `sigeo_db`).
  - **Sem Secrets Manager:** `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`.

**Executar o container v2 (com Secrets Manager):**

```bash
docker run -d --restart always -p 30:3000 \
  -e AWS_REGION=sa-east-1 \
  -e SECRET_ARN="arn:aws:secretsmanager:sa-east-1:ACCOUNT:secret:rds!cluster-xxx" \
  -e JWT_SECRET="..." -e FRONTEND_URL="https://sigeo.advances.com.br" \
  --name sigeo-backend-v2 sigeo-backend-v2:latest
```

A API fica exposta na **porta 30** do host. Abra **Inbound Rule** no Security Group da EC2 para a porta **30**.

---

## 3. Frontend (S3)

- Build via Vite na pasta do frontend (SIGEO): `npm install && npm run build`.
- Upload para o bucket S3 (Static Website Hosting ou origem do CloudFront).
- Script: `docs/scripts/deploy-web-s3.sh <bucket-name> [distribution-id]`.

**Naming (DNS):**
- **SIGEO v2 (este projeto):** **sigeo.advances.com.br** — DNS aponta para o CloudFront v2 (`d2qar6y47tn4rs.cloudfront.net`). Para o HTTPS responder neste domínio, na conta onde está a distribuição antiga (`d128hx2c5x0vmt`) é preciso trocar o alias de `sigeo.advances.com.br` para `sigeo-old.advances.com.br`; depois adicionar o alias `sigeo.advances.com.br` na distribuição v2 (E3RLLWX6JCRSBC).
- **SIGEO antigo:** **sigeo-old.advances.com.br** — DNS (Route 53) aponta para o CloudFront antigo (`d128hx2c5x0vmt.cloudfront.net`). Na distribuição antiga, configurar o alias `sigeo-old.advances.com.br` para o HTTPS funcionar nesse domínio.

**Ambiente atual (v2):**
- **Bucket:** `sigeo-web-v2-320674390105` (região us-east-1).
- **CloudFront:** distribuição `E3RLLWX6JCRSBC` (alias atual: `sigeo-v2.advances.com.br`; alias desejado: `sigeo.advances.com.br`, após liberação na outra conta).
- **URLs do site v2:** https://sigeo.advances.com.br (DNS já aponta; alias no CloudFront pendente) e https://sigeo-v2.advances.com.br.
- **URL do site antigo:** https://sigeo-old.advances.com.br (DNS criado; a distribuição antiga precisa do alias `sigeo-old.advances.com.br`).
- Para novo deploy: `./deploy-web-s3.sh sigeo-web-v2-320674390105 E3RLLWX6JCRSBC` (invalida cache do CloudFront).

---

## 4. Mobile (Expo)

- Apontar `EXPO_PUBLIC_API_URL` no app para o novo endpoint (ex: `https://api.sigeo.advances.com.br`).

---

## 5. Nginx (reverse proxy) e HTTPS

Para que **https://api.sigeo.advances.com.br** funcione apontando para o container na porta 30, configure o Nginx na EC2 como reverse proxy.

### 5.1 Script de configuração (executar na EC2)

```bash
# Copie o script para a EC2 ou execute via SSH
chmod +x setup-nginx-proxy.sh
sudo ./setup-nginx-proxy.sh
```

O script **`docs/scripts/setup-nginx-proxy.sh`** instala o Nginx, cria o virtual host para `api.sigeo.advances.com.br` encaminhando para `http://127.0.0.1:30`, testa e reinicia o Nginx.

### 5.2 SSL (HTTPS)

- **Certbot (na EC2):** após o Nginx estar no ar e o DNS apontando para a EC2, rode na instância:  
  `sudo certbot --nginx -d api.sigeo.advances.com.br`
- **AWS (ALB/CloudFront):** se o tráfego passar por um Application Load Balancer ou CloudFront, configure o certificado SSL no console AWS; o Nginx na EC2 pode continuar ouvindo só na porta 80.

### 5.3 Frontend (Vite) – URL da API

Para o site Web v2 usar o backend em produção, defina a URL da API no build:

- **Arquivo:** na raiz do frontend (pasta SIGEO), crie ou edite **`.env.production`** (use **`.env.production.example`** como modelo).
- **Conteúdo:**  
  `VITE_API_URL=https://api.sigeo.advances.com.br`
- Em seguida faça o build: `npm run build`. O `src/services/api.ts` já usa `import.meta.env.VITE_API_URL` com esse default.

---

## 6. Health Check (diagnóstico)

Antes de abrir o sistema para os usuários, valide o “túnel” completo: **DNS → Nginx → Docker → Secrets Manager → Aurora**.

O backend expõe a rota **`GET /status`** (sem autenticação), que retorna `db_connected: true` quando a conexão com o banco está OK. O script de diagnóstico chama essa rota e interpreta o resultado.

### 6.1 Executando o diagnóstico final

No terminal (WSL, Linux ou Mac), execute **`docs/scripts/check-v2-health.sh`** para validar a cadeia completa e ter controle total antes de abrir para usuários:

```bash
chmod +x SIGEO/docs/scripts/check-v2-health.sh
./SIGEO/docs/scripts/check-v2-health.sh
```

O script verifica:

1. **DNS** – resolução de `api.sigeo.advances.com.br`
2. **HTTPS e Nginx** – resposta da API em `/auth/login` (200, 405 ou 401 = OK)
3. **Aurora via backend** – resposta de `/status` com `db_connected: true` (Secrets Manager e RDS integrados)

**O que cada ✅ OK significa:**

| Teste | Significado do "✅ OK" |
| :--- | :--- |
| **DNS** | O domínio `api.sigeo.advances.com.br` já aponta para o IP correto da sua EC2. |
| **HTTPS/Nginx** | O Nginx recebeu a conexão e a encaminhou com sucesso para o container Docker na porta 30. |
| **Aurora via Backend** | O backend conseguiu obter as credenciais no Secrets Manager e abriu a conexão com o cluster Aurora. |

Com os três itens em OK, o “túnel” Internet → EC2 → Aurora está desobstruído e o SIGEO v2 está **pronto para produção**. Se algum item falhar, use a mensagem exibida pelo script para corrigir (CNAME, Nginx, IAM Role ou Security Group do Aurora).

### 6.2 Teste de fogo (jeito mais rápido)

Rode o script; se retornar os três OKs, o tráfego está chegando ao banco pela internet:

```bash
./SIGEO/docs/scripts/check-v2-health.sh
```

- **DNS OK?** O domínio `api.sigeo.advances.com.br` já resolve para a sua EC2.
- **HTTPS OK?** O Nginx está ativo e o certificado SSL está protegendo a rota.
- **Aurora OK?** O backend conseguiu "abrir o cofre" do Secrets Manager e ler o banco.

### 6.3 Verificação manual da API

Abra o navegador ou use Postman/Insomnia e acesse:

**https://api.sigeo.advances.com.br/status**

Resposta esperada (JSON):

```json
{
  "status": "online",
  "version": "2.0.0",
  "db_connected": true,
  "timestamp": "2026-03-05T..."
}
```

Se aparecer `db_connected: true`, a publicação foi concluída com sucesso e o backend está oficialmente validado.

**O que esperar ao abrir o link:**

| Cenário | O que você vê | Ação |
| :--- | :--- | :--- |
| **Sucesso total** | JSON `{"status": "online", "db_connected": true, ...}` | Backend validado. Próximo: frontend S3 ou teste mobile. |
| **Timeout** (página carregando infinitamente) | Nada carrega | **Security Group:** liberar portas **80** e **443** na EC2 (Inbound). |
| **502 Bad Gateway** | Página de erro 502 | Nginx está de pé; o **container Docker v2** pode estar parado. Na EC2: `docker ps` e subir o container. |

### 6.3.1 Teste definitivo no terminal (após DNS)

Depois de limpar o cache DNS (`flush-dns-windows.bat` ou `ipconfig /flushdns`) e/ou configurar o DNS 8.8.8.8 no adaptador de rede, confirme no PowerShell ou CMD:

```powershell
nslookup api.sigeo.advances.com.br
```

- **Se retornar `Address: 18.228.206.86`** (ou o IP da sua EC2): o caminho está livre; pode abrir o navegador em **https://api.sigeo.advances.com.br/status**.
- **Se retornar "Non-existent domain"**: o cache do provedor de internet ainda está antigo; aguarde alguns minutos ou use aba anônima / DNS 8.8.8.8 no PC.

### 6.4 Verificação no Console AWS

Para conferir o "hardware" rodando:

| Onde | O que verificar |
| :--- | :--- |
| **EC2** | Em **Instâncias**, status **Executando** e verificações de status **2/2**. |
| **Secrets Manager** | Em **Segredos**, o ARN do secret com **Último acesso** recente (indica que o backend leu as credenciais). |
| **S3 (Frontend)** | No bucket (ex.: `sigeo-v2`), o `index.html` com data de modificação de hoje. |

### 6.5 E se não estiver funcionando?

| Sintoma | O que checar |
| :--- | :--- |
| **ERR_NAME_NOT_RESOLVED** – "Não foi possível encontrar o endereço IP do servidor" | O DNS ainda não está configurado. Crie um registro **CNAME** ou **A** para `api.sigeo.advances.com.br` apontando para o IP ou hostname da sua EC2 (veja **6.6** abaixo). |
| **"Site não encontrado"** ao digitar o endereço | **Security Group:** portas **80** e **443** liberadas no firewall da EC2 (Inbound). |
| **502 ou API não responde** | **Docker:** entre na EC2 via SSH e rode `docker ps`. O container **sigeo-backend-v2** deve aparecer na lista. Se não estiver, suba com o comando do passo de deploy. |

### 6.6 Configurar DNS (corrigir ERR_NAME_NOT_RESOLVED)

Esse erro significa que **o domínio `api.sigeo.advances.com.br` ainda não aponta para nenhum servidor**. É preciso criar o registro DNS onde o domínio `advances.com.br` está gerenciado.

1. **Obtenha o IP público da EC2**  
   No Console AWS: **EC2** → **Instâncias** → selecione a instância do SIGEO v2 → copie o **IPv4 público**.

2. **Crie o registro no seu provedor DNS** (Route 53, Cloudflare, Registro.br, etc.):

   | Provedor | Tipo | Nome / Host | Valor / Aponta para |
   | :--- | :--- | :--- | :--- |
   | **Route 53** | A | `api.sigeo` (ou `api` no subdomínio desejado) | IP público da EC2 |
   | **Cloudflare** | A | `api.sigeo` | IP público da EC2 (nuvem laranja ou cinza, como preferir) |
   | **Outros** | A ou CNAME | `api.sigeo.advances.com.br` ou só `api.sigeo` | IP da EC2 ou hostname público da EC2 (ex.: `ec2-xx-xx-xx-xx.sa-east-1.compute.amazonaws.com`) |

3. **Aguarde a propagação** (alguns minutos até 48 h, em geral < 1 h). Depois teste de novo:  
   `https://api.sigeo.advances.com.br/status`

Se o domínio principal for `advances.com.br`, o host do registro costuma ser **`api.sigeo`** (resultando em `api.sigeo.advances.com.br`). Ajuste conforme a estrutura do seu DNS (ex.: zona `sigeo.advances.com.br` → host `api`).

**Automação (Route 53):** na pasta `docs/scripts` há o script **`setup-dns-route53.sh`**. Com AWS CLI configurado, execute (Linux/WSL/Mac):

```bash
# Sintaxe: ./setup-dns-route53.sh <HOSTED_ZONE_ID> <INSTANCE_ID ou IP>
./setup-dns-route53.sh Z0191965M21VHTLKJSYP i-0f73ae1ae2361763e
```

Ele obtém o IP da instância (se passar o ID) e cria/atualiza o registro A de `api.sigeo.advances.com.br` na zona indicada.

---

## 🛡️ IAM – Política restrita para Secrets Manager

Para o backend acessar o Secrets Manager **sem chaves no código**, crie uma política IAM que permite apenas leitura do secret do Aurora e anexe à **IAM Role** da instância EC2.

1. **Console AWS** → **IAM** → **Policies** → **Create policy** → aba **JSON**.
2. Cole o conteúdo de **`docs/scripts/iam-policy-secrets-manager.json`** (ou o JSON abaixo).
3. **Next** → nome sugerido: `SIGEO-v2-SecretsManager-Aurora` → **Create policy**.
4. **IAM** → **Roles** → role da sua EC2 → **Add permissions** → **Attach policies** → selecione a política criada.

**JSON da política (permissão restrita ao ARN do secret):**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "secretsmanager:GetSecretValue",
            "Resource": "arn:aws:secretsmanager:sa-east-1:320674390105:secret:rds!cluster-7ae817fd-d18d-4504-a55e-d00c6569806b-Q1XanF"
        }
    ]
}
```

Ajuste o **Resource** (ARN do secret) se o seu secret for outro. Com isso, a EC2 passa a obter as credenciais do Aurora via Secrets Manager sem variáveis de ambiente de senha.

---

## Checklist de automação

| Componente | Configuração necessária | Status | Responsável |
| :--- | :--- | :--- | :--- |
| IAM Role | Criar política (JSON em `docs/scripts/iam-policy-secrets-manager.json`) e anexar à Role da EC2 | [ ] | DevOps |
| Secrets Manager | Validar se o Host no Secret aponta para o Cluster Aurora | [ ] | DevOps |
| Porta 30 | Abrir Inbound Rule no Security Group da EC2 (porta **30**) | [ ] | DevOps |
| Criar Cluster Aurora | Criar cluster e rodar aurora-init (MySQL ou PG) | [ ] | DevOps |
| Security Group Aurora | Liberar 3306/5432 para a EC2 | [ ] | DevOps |
| Build Docker img v2 | CI/CD ou script `deploy-backend-ec2.sh` | [ ] | CI/CD |
| Deploy backend na EC2 | Rodar container com `SECRET_ARN`, `JWT_SECRET`, `FRONTEND_URL` | [ ] | DevOps |
| Nginx reverse proxy | Rodar na EC2: `docs/scripts/setup-nginx-proxy.sh` (80/443 → 30) | [ ] | DevOps |
| Security Group 80/443 | Abrir portas 80 e 443 na EC2 para acesso ao Nginx | [ ] | DevOps |
| Frontend .env.production | `VITE_API_URL=https://api.sigeo.advances.com.br` antes do build | [ ] | Dev |
| CORS | Backend já libera `https://sigeo.advances.com.br` e `http://localhost:5173` | [ ] | — |
| Rota /status | Backend expõe `GET /status` para health check e scripts | [ ] | — |
| Health check | Rodar `docs/scripts/check-v2-health.sh` antes do Go-Live | [ ] | DevOps |
| S3 Sync (frontend) | Script `deploy-web-s3.sh` | [ ] | Script |
| Configurar Mobile API URL | `EXPO_PUBLIC_API_URL` apontando para `https://api.sigeo.advances.com.br` | [ ] | Dev |

---

## Como executar a automação

### Checklist de execução (ordem sugerida)

| Passo | Ação | Comando / Onde |
| :--- | :--- | :--- |
| **1. IAM** | Criar política e anexar à Role da EC2 | IAM > Policies > Create (JSON de `docs/scripts/iam-policy-secrets-manager.json`) → anexar à Role da EC2 |
| **2. Build** | Gerar imagem Docker v2 | `cd SIGEO/docs/scripts && ./deploy-backend-ec2.sh` (gera `sigeo-backend-v2.tar` em `docs/`) |
| **3. Push** | Enviar imagem para a EC2 e subir o container | `./ssh-deploy-v2.sh <IP_DA_EC2> <CAMINHO_DA_CHAVE.pem> [SECRET_ARN] [JWT_SECRET] [FRONTEND_URL]` |

### Comandos

1. **Scripts executáveis:**  
   `chmod +x SIGEO/docs/scripts/*.sh`

2. **Build da imagem (gera o tar):**  
   `./SIGEO/docs/scripts/deploy-backend-ec2.sh`

3. **Deploy via SSH (envia tar, carrega na EC2, reinicia o container):**  
   `./SIGEO/docs/scripts/ssh-deploy-v2.sh <SEU_IP> <SUA_CHAVE.pem>`  
   Opcional: informe em seguida `SECRET_ARN`, `JWT_SECRET` e `FRONTEND_URL` para o container usar Secrets Manager e JWT.

4. **Deploy frontend:**  
   `./SIGEO/docs/scripts/deploy-web-s3.sh <bucket> [cloudfront-dist-id]`

---

## 🏁 Checklist de finalização (Go-Live v2)

| Ação | Onde | Objetivo |
| :--- | :--- | :--- |
| **DNS CNAME** | Cloudflare / Route 53 | Apontar `api.sigeo.advances.com.br` para o IP (ou hostname) da EC2. |
| **Security Group** | Console AWS (EC2) | Abrir portas **80** e **443** (Inbound) para o tráfego desejado (0.0.0.0/0 ou IPs do ALB). |
| **Nginx setup** | Terminal na EC2 | Rodar `docs/scripts/setup-nginx-proxy.sh` para proxy 80/443 → porta 30. |
| **SSL** | EC2 (Certbot) ou AWS (ALB/CloudFront) | Certificado HTTPS para `api.sigeo.advances.com.br`. |
| **CORS** | Backend (Node) | Backend já permite `https://sigeo.advances.com.br` e `http://localhost:5173`; opcional: `FRONTEND_URL` no container. |
| **Frontend .env.production** | Pasta SIGEO | `VITE_API_URL=https://api.sigeo.advances.com.br` antes do build. |
| **Health check** | Qualquer máquina | Rodar `docs/scripts/check-v2-health.sh` para validar DNS → Nginx → Docker → Aurora. |

---

## Próximos passos (após ver o JSON de status)

Assim que **https://api.sigeo.advances.com.br/status** retornar `db_connected: true`, o backend está validado. Escolha o que fazer em seguida:

| Opção | O que fazer |
| :--- | :--- |
| **Subir o Frontend v2** | Deploy no S3: `docs/scripts/deploy-web-s3.sh sigeo-web-v2-320674390105 E3RLLWX6JCRSBC`. Site v2: **https://sigeo-v2.advances.com.br** (CNAME `sigeo.advances.com.br` já em uso por outra distribuição). |
| **Testar o Mobile** | Abrir o Expo Go, apontar o app para a nova API (`EXPO_PUBLIC_API_URL=https://api.sigeo.advances.com.br`) e verificar se as tarefas e o login carregam. |
