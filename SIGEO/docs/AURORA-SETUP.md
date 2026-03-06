# SIGEO – Configuração AWS Aurora

Guia para conectar o backend ao **Amazon Aurora** (MySQL ou PostgreSQL) e unificar o login Web + Mobile.

---

## 1. String de conexão unificada (Node.js/Backend)

Configure no servidor (EC2, Lambda ou ECS) a variável de ambiente:

```bash
# Aurora MySQL
DATABASE_URL=mysql://admin:sua_senha_mestre@sigeo-cluster.cluster-xyz.us-east-1.rds.amazonaws.com:3306/sigeo_db

# Aurora PostgreSQL (alternativa)
# DATABASE_URL=postgresql://admin:sua_senha_mestre@sigeo-cluster.cluster-xyz.us-east-1.rds.amazonaws.com:5432/sigeo_db
```

O backend em `docs/backend-server.js` usa o módulo **`docs/db/connection.js`**, que detecta automaticamente o driver pelo `DATABASE_URL`:
- **`mysql://`** → usa `mysql2` (placeholders `$1`,`$2` são convertidos para `?`).
- **`postgresql://`** → usa `pg`.

Instalação das dependências (na pasta `docs/`): `npm install`. Ver `docs/package.json`.

Arquivo de exemplo: `docs/.env.example`.

---

## 2. Script de inicialização (Aurora)

Execute no console do Aurora (Query Editor) para criar o **Admin Mestre** e a **primeira unidade**. Sem isso, não será possível logar para cadastrar o restante da equipe.

| Engine   | Arquivo |
|----------|---------|
| **MySQL**      | `docs/scripts/aurora-init.sql` |
| **PostgreSQL** | `docs/scripts/aurora-init.pg.sql` |

Ambos criam as tabelas `units` e `users`; o script PG também cria `audit_logs`.

**Importante:** antes de rodar, substituir `$2b$10$HASH_DA_SENHA_AQUI` por um hash BCrypt da senha desejada:

```bash
node -e "console.log(require('bcryptjs').hashSync('SuaSenhaSegura123', 10))"
```

---

## 3. Login unificado (Web e Mobile)

Web (sigeo.advances.com.br) e app (Expo) usam o **mesmo endpoint** de autenticação, que consulta o Aurora.

**Fluxo:**

1. Mobile/Web envia e-mail e senha.
2. Backend consulta a tabela `users` (ou `employees`) no Aurora.
3. Aurora retorna o `role` (admin, manager, technician) e `unit_id`.
4. Backend gera um **JWT** com `role` e `unit_id` e devolve token + user.

**Exemplo de resposta da API após consulta ao Aurora:**

```json
{
  "token": "ey...jwt_token",
  "user": {
    "id": "1",
    "name": "Alessandro",
    "email": "admin@advances.com.br",
    "role": "admin",
    "unit_id": null
  }
}
```

- **Admin:** `unit_id: null` (acesso total).
- **Gestor/Técnico:** `unit_id` preenchido (vinculado à unidade).

O mobile já trata `role` e e-mail para exibir as abas corretas (Gestor/Admin vs Técnico).

---

## 4. Security Groups (AWS)

Para o Aurora aceitar conexões do backend:

1. Console AWS → **RDS** → **Databases** → seu cluster Aurora.
2. **Connectivity & security** → abrir o **VPC Security Group**.
3. **Edit inbound rules** → **Add rule**:
   - **Type:** MySQL/Aurora (3306) ou PostgreSQL (5432), conforme o engine.
   - **Source:** IP do servidor backend ou Security Group da aplicação (EC2/ECS/Lambda).

---

## 5. Próximos passos

| Item | Descrição |
|------|-----------|
| **Deploy do backend** | Ajustar `backend-server.js` para usar `DATABASE_URL` (e, se for Aurora MySQL, trocar `pg` por `mysql2` e schema `users`/`units`). |
| **Painel de Unidades (Web Admin)** | Tela onde o Admin cadastra os polos (unidades) no Aurora. |
| **Relatórios de custos** | Usar o Aurora para calcular gasto de materiais por unidade (BI). |

---

## Referência rápida

- **Init SQL:** `docs/scripts/aurora-init.sql`
- **Env de exemplo:** `docs/.env.example`
- **Backend de referência:** `docs/backend-server.js` (PostgreSQL)
