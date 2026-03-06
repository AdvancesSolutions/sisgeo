# SIGEO Mobile - Integração com Backend

## 1. API Unificada

- **Base URL**: `EXPO_PUBLIC_API_URL` ou `https://api.sigeo.advances.com.br`
- **Autenticação**: JWT no header `Authorization: Bearer <token>`

### Estrutura do Dashboard (GET /dashboard)

```json
{
  "usuario": {
    "id": "123",
    "nome": "João",
    "iniciais": "JS",
    "cargo": "Técnico de Manutenção"
  },
  "estatisticas_dia": {
    "total_tarefas": 3,
    "concluidas": 1,
    "percentual_progresso": 33.3
  },
  "tarefas": [
    {
      "id": "OS-001",
      "titulo": "Limpeza geral",
      "status": "Concluída",
      "local": "Unidade Centro",
      "horario": "08:00",
      "prioridade": "Normal",
      "cor_status": "#4CAF50"
    }
  ]
}
```

### Consistência Visual

- **IDs**: OS-001, OS-002, etc. — mesmos no Desktop e Mobile
- **Unidades**: Unidade Centro, Unidade Sul — nomes idênticos

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/dashboard` | Usuario + estatísticas + tarefas |
| POST | `/auth/login` | Login (email, password) |
| POST | `/timeclock/checkin` | Check-in com lat, lng, timestamp |
| POST | `/tasks` | **Gestor:** Criar O.S. (title, description, priority, location, address, photo_opening) |
| POST | `/upload` | **Evidências:** multipart (photo + taskId + type) → retorna s3Url |
| PATCH | `/tasks/:id/status` | Atualizar status + `atualizado_via_mobile_em` |
| POST | `/tasks/:id/finish` | Finalizar com fotos, notas, **signatureData** (base64), `atualizado_via_mobile_em` |
| GET | `/tasks/by-qr?code=OS-001` | Tarefa por QR Code |

## 2. Sincronização de Status

- **Tempo real**: João clica "Concluir" no celular → API recebe → painel Web atualiza o gráfico na hora
- **Fila de mensagens**: João no subsolo (sem internet) → app guarda → ao subir (térreo) envia automaticamente
- **Web exibe**: "Atualizado via mobile há 2 minutos" (usando `atualizado_via_mobile_em`)

## 3. Offline First

- Ações enfileiradas em `AsyncStorage` quando sem internet
- Sincronização automática ao detectar conexão
- Banner exibido quando offline ou com pendências
- Botão "Sincronizar" para forçar envio

## 4. QR Code

- Menu do usuário → "Escanear QR Code"
- Etiquetas geradas no SIGEO Web (formato: OS-001, OS-002, etc.)
- Ao escanear, abre a tarefa correspondente

## 5. Evidências e Geolocalização

### Upload de fotos para S3 (momento da verdade)

O técnico tira foto **Antes** e **Depois** no detalhe da tarefa; cada foto é enviada de imediato para o backend e guardada no Amazon S3. O gestor valida as evidências na versão Web.

- **Mobile:** Permissão de câmera → `launchCameraAsync` (aspecto 16:9, qualidade 0.7) → `FormData` com `photo`, `taskId`, `type` (`before` | `after`) → `POST /upload` (multipart). Em sucesso recebe `s3Url`; em falha de rede a foto fica guardada localmente e pode ser enviada ao concluir.
- **Endpoint:** `POST /upload` — multipart/form-data: campo `photo` (ficheiro), `taskId`, `type`. Resposta: `{ s3Url: "https://..." }`.
- **Backend (AWS):** Receber com `multer`, enviar para S3 com `multer-s3` (bucket ex.: `sigeo-evidencias-advances`), atualizar na BD as colunas `photo_before` / `photo_after` com a URL. Exemplo:

```javascript
const multerS3 = require('multer-s3');
const upload = multer({
  storage: multerS3({
    s3, bucket: 'sigeo-evidencias-advances',
    acl: 'public-read',
    key: (req, file, cb) => cb(null, `tasks/${req.body.taskId}/${Date.now()}-${file.originalname}`)
  })
});
app.post('/upload', upload.single('photo'), async (req, res) => {
  const { taskId, type } = req.body;
  const column = type === 'before' ? 'photo_before' : 'photo_after';
  await db.query(`UPDATE tasks SET ${column} = $1 WHERE id = $2`, [req.file.location, taskId]);
  res.json({ s3Url: req.file.location });
});
```

- Coordenadas GPS no check-in para mapa no Web.

### Assinatura digital do cliente (carimbo final)

O encerramento da O.S. exige a assinatura do cliente no telemóvel (biblioteca `react-native-signature-canvas`). A assinatura é enviada como **data URL (base64)** no corpo de `POST /tasks/:id/finish` (`signatureData`). O backend pode guardar em S3 e preencher `signature_url` / `completed_at` na tabela de tarefas para o gestor ver na Web.

- **Mobile:** Após fotos Antes/Depois, o técnico toca em "Finalizar e Enviar" → abre o pad de assinatura → cliente assina com o dedo → "Finalizar O.S." envia a imagem (base64) no finish.
- **Web (validação):** Exibir a assinatura ao lado das fotos, por exemplo: `<img src={task.signature_url} alt="Assinatura" />` e texto "Assinado digitalmente via SIGEO Mobile em: {task.completed_at}".
- **Auditoria:** Registar em Audit Trail: utilizador, ação "Encerramento de OS", detalhes "OS #id finalizada com assinatura digital".

## 6. Push Notifications (SIGEO "vivo")

O sistema de notificações push faz o técnico receber a O.S. assim que o gestor lança na AWS — o telemóvel vibra no bolso.

### Mobile (Expo)

- **Registo:** Ao iniciar o app, pede permissão, obtém o **Expo Push Token** e envia-o para o backend via `POST /users/me/push-token` (body: `{ token, platform }`). O backend deve guardar o token na tabela `employees` (ou equivalente) associado ao utilizador logado.
- **Foreground:** `setNotificationHandler` está configurado para mostrar alerta, som e banner quando uma notificação chega com o app aberto.
- **Toque na notificação:** O listener `addNotificationResponseReceivedListener` e `getLastNotificationResponseAsync` (app aberto a partir do toque) navegam para a aba **Tarefas** e abrem o modal de detalhe da tarefa usando `data.taskId` enviado pelo servidor.

### Backend (AWS Lambda / Node.js)

Quando o gestor cria uma tarefa, o servidor deve enviar a push ao técnico atribuído usando **expo-server-sdk**:

```javascript
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

// Após guardar a tarefa no RDS e obter technician_id e newTaskId:
const techToken = await db.query('SELECT push_token FROM employees WHERE id = $1', [technician_id]);

if (techToken && Expo.isExpoPushToken(techToken)) {
  await expo.sendPushNotificationsAsync([{
    to: techToken,
    sound: 'default',
    title: '📌 Nova O.S. Atribuída!',
    body: `O Gestor criou a tarefa: ${title}`,
    data: { taskId: newTaskId },
    priority: 'high',
  }]);
}
```

O campo **data.taskId** é usado no app para navegar para os detalhes da tarefa. Em Expo Go as push não funcionam; use um build de desenvolvimento ou produção (EAS Build) para testar.

## Configuração

### Produção

Crie `.env` (copie de `.env.example`) com:

```
EXPO_PUBLIC_API_URL=https://api.sigeo.advances.com.br
```

### Desenvolvimento local (app no celular + backend no PC)

No celular, **localhost** é o próprio aparelho — o app precisa do **IP do seu computador**.

1. **Backend rodando no PC**  
   Inicie a API (ex: `npm run dev`, `python main.py`) e anote a porta (ex: 3000, 8000).

2. **Descobrir o IP do PC**  
   - Windows: `ipconfig` → use o **IPv4** (ex: 192.168.1.5).  
   - Mac/Linux: `ifconfig` ou `ip addr`.

3. **Configurar no app**  
   Crie/edite `.env` na pasta do SIGEO-mobile:

   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.5:3000
   ```
   (Troque pelo seu IP e pela porta do backend.)

4. **Reiniciar o Expo**  
   Após mudar o `.env`, reinicie: `npx expo start --clear`.

5. **Firewall**  
   Se o celular não conseguir acessar, libere a porta no Firewall do Windows/Mac ou teste no navegador do celular: `http://SEU_IP:PORTA/status` (ou outro endpoint).

**Arquivo `.env`:** Já existe em `SIGEO-mobile/.env` com o IP da sua rede (192.168.1.11) e porta 3000. Se o seu backend usar outra porta (ex: 8000), edite o `.env` e troque `:3000` pela porta correta.

### Servidor mock (Node.js) — sem banco

Para testar o app no celular sem configurar banco, use a API mock na pasta `server`:

**Tecnologia:** Node.js (Express).

**Comando para abrir o servidor para o celular:**

```powershell
cd D:\SERVIDOR\SISGEO\SIGEOV2\SIGEO-mobile\server
npm install
npm start
```

O servidor sobe na porta 3000 e escuta em todas as interfaces (0.0.0.0), então o celular acessa por `http://SEU_IP:3000`.

### Testar perfis (gestor, técnico, admin)

Com o **mock API** rodando, você pode testar os perfis de duas formas:

1. **Botões na tela de login**  
   Use os botões "Técnico", "Gestor" e "Admin" para entrar direto com cada perfil (senha: `demo123`).

2. **Login manual**  
   Digite email e senha; o perfil é definido pelo email:

| Perfil   | Email                  | Senha   |
|----------|------------------------|--------|
| Técnico  | `tecnico@sigeo.com.br` | qualquer (ex: `demo123`) |
| Gestor   | `gestor@sigeo.com.br`  | qualquer |
| Admin    | `admin@sigeo.com.br`   | qualquer |

Emails que contenham "gestor" ou "manager" entram como **Gestor**; "admin" como **Admin**; qualquer outro como **Técnico**. O nome e as iniciais exibidos no app mudam conforme o perfil (João Santos / Maria Gestora / Admin Sistema).
