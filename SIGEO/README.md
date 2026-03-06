# SIGEO - Sistema Integrado de Gestão Operacional 🚀

O **SIGEO** é uma plataforma avançada de *Field Service Management* (FSM) desenvolvida pela **Advances Solutions**. O sistema foca no monitoramento em tempo real, alocação inteligente de recursos técnicos e auditoria de conformidade para operações de campo.

## 🛠️ Tecnologias Principais

* **Frontend:** React.js + Tailwind CSS
* **Design System:** Customizado (Navy & Amber Palette)
* **Gráficos:** Recharts (BI & Analytics)
* **Ícones:** Lucide React
* **CI/CD:** GitHub Actions + AWS (S3/CloudFront)

---

## 🏗️ Estrutura de Versionamento

Seguimos o padrão **Semantic Versioning (SemVer)** e utilizamos o fluxo de branches abaixo para garantir a estabilidade:

* **`main`**: Código em produção. Protegida contra pushes diretos.
* **`develop`**: Branch de integração. Todas as features devem ser mescladas aqui primeiro.
* **`feature/*`**: Branches temporárias para novas funcionalidades ou correções.

### Marcos de Lançamento (Tags)
Sempre que uma versão estável é alcançada, criamos uma Tag no Git:
- `v1.0.0`: Lançamento inicial (Core, Dashboard, OS).
- `v1.1.0`: Implementação de Auditoria e Controle de Materiais.

---

## 🚀 Fluxo de Deploy (CI/CD)

O deploy é automatizado via **GitHub Actions** para a infraestrutura da **AWS**.

1.  **Merge para `main`**: Dispara automaticamente o build e deploy no ambiente de Produção.
2.  **Criação de Tag**: Dispara o workflow de versionamento oficial.

**Comandos de Release:**
```bash
# Para correções (1.0.1)
npm run release:patch

# Para novas funcionalidades (1.1.0)
npm run release:minor
```

---

## 💻 Instalação e Execução

**Clonar o repositório:**
```bash
git clone https://github.com/AdvancesSolutions/site.git
```

**Instalar dependências:**
```bash
npm install
```

**Configurar Variáveis de Ambiente:**
Crie um arquivo `.env` na raiz:
```
REACT_APP_API_URL=https://api.sigeo.advances.com.br
```

**Rodar em Desenvolvimento:**
```bash
npm run dev
```

---

## 🔒 Regras de Usuário (RBAC)

O SIGEO utiliza controle de acesso baseado em cargos:

| Papel | Descrição |
|-------|-----------|
| **Super Admin** | Gestão global e configurações de sistema |
| **Gestor** | Administração de unidades, funcionários e aprovação de OS |
| **Técnico** | Execução de tarefas e registros via aplicativo móvel |

---

## 🛡️ Auditoria e Conformidade

Todas as ações críticas (ajustes de estoque, aprovações e logins) são registradas na **Trilha de Auditoria** (Audit Trail), garantindo integridade e impossibilidade de deleção de logs para fins de compliance.

---

© 2026 Advances Solutions - Todos os direitos reservados.
