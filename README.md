# SIGEO v2

Sistema de gestão operacional (tarefas, equipe, validação, ponto). Repositório unificado com **web** e **app mobile**.

## Estrutura

| Pasta | Descrição |
|-------|-----------|
| **SIGEO/** | Frontend web (Vite + React). Deploy: AWS Amplify, S3/CloudFront. |
| **SIGEO-mobile/** | App mobile (Expo / React Native). Build: APK, EAS Update. |

## Desenvolvimento

**Web (SIGEO):**
```bash
cd SIGEO
npm install
npm run dev
```

**Mobile (SIGEO-mobile):**
```bash
cd SIGEO-mobile
npm install
npx expo start
```

## Deploy

- **Web:** Amplify conectado ao branch `main` (build em `SIGEO/`). Domínio: sigeo.advances.com.br.
- **API:** Backend em EC2/Aurora; ver `SIGEO/docs/` para scripts e documentação AWS.
- **Mobile:** Build APK e OTA; ver `SIGEO-mobile/BUILD-APK.md` e `SIGEO-mobile/OTA-UPDATES.md`.

## Documentação

- **SIGEO/docs/** – Backend, Aurora, deploy AWS, Amplify, DNS.
- **SIGEO-mobile/** – Integração, build APK, atualizações OTA.
