# API Mock – testar o app no celular

**Tecnologia:** **Node.js** (Express).

Servidor mock que atende os endpoints que o app mobile espera, **sem banco de dados**. Útil para desenvolvimento e testes com o celular na mesma rede.

## Comando para “abrir” o servidor para o celular

No terminal (na pasta do servidor):

```powershell
cd D:\SERVIDOR\SISGEO\SIGEOV2\SIGEO-mobile\server
npm install
npm start
```

Ou, a partir da pasta `SIGEO-mobile`:

```powershell
cd server
npm install
npm start
```

O servidor sobe na **porta 3000** e escuta em **0.0.0.0** (todas as interfaces), então o celular consegue acessar pelo IP do PC (ex.: `http://192.168.1.11:3000`).

## Conferir no celular

1. Celular e PC na mesma rede Wi‑Fi.
2. No `.env` do app: `EXPO_PUBLIC_API_URL=http://SEU_IP:3000` (ex.: `http://192.168.1.11:3000`).
3. Backend mock rodando com `npm start` no PC.
4. No app: login com qualquer email/senha (ex.: `demo@teste.com` / `123`).

---

**Backend “real” (com banco):** o projeto tem um backend de referência em **Node.js (Express)** em `SIGEO/docs/backend-server.js`. Ele usa **PostgreSQL** e variáveis de ambiente (`DATABASE_URL`, `JWT_SECRET`). Para rodar esse servidor para o celular na mesma rede:

```powershell
cd D:\SERVIDOR\SISGEO\SIGEOV2\SIGEO\docs
set PORT=3000
node backend-server.js
```

Para o celular acessar, o servidor precisa estar escutando em **0.0.0.0** (no código atual está `app.listen(PORT, ...)`; para garantir, use `app.listen(PORT, '0.0.0.0', () => ...)`). Esse backend exige banco e env configurados.
