# Atualizações OTA (Over-The-Air) – SIGEO Mobile

Com OTA, você publica **atualizações de JavaScript e assets** sem precisar gerar nova APK. O app instalado verifica atualizações ao abrir e aplica automaticamente.

## Pré-requisitos

- **Conta Expo** (grátis): [expo.dev](https://expo.dev)
- **EAS CLI**: `npm install -g eas-cli`

## 1. Configurar uma vez (por projeto)

```bash
cd SIGEO-mobile
eas login
eas update:configure
```

O `eas update:configure` pergunta se quer criar/linkar um projeto EAS e adiciona em `app.json` a URL de updates (ex.: `https://u.expo.dev/<seu-project-id>`).

## 2. Gerar a APK que receberá OTA

A APK precisa ter sido construída **depois** de configurar o EAS (para já incluir a URL de updates).

**Opção A – Build local (como hoje):**

```bash
npx expo prebuild --platform android --clean
cd android
# Defina ANDROID_HOME e rode:
gradlew.bat app:assembleRelease
```

**Opção B – Build na nuvem EAS (recomendado para OTA):**

```bash
eas build --platform android --profile production
```

O EAS gera a APK e já deixa o app “ligado” ao canal de updates. Baixe a APK no painel e distribua.

## 3. Publicar uma atualização (sem nova APK)

**Importante:** rode o comando **dentro da pasta do app** (`SIGEO-mobile`), não na raiz do repositório.

Depois de alterar código (telas, lógica, textos, etc.):

```bash
cd SIGEO-mobile
eas update --branch production --message "Correção login demo"
```

Ou com npx: `npx eas-cli update --branch production --message "Sua mensagem"`

Ou use os scripts:

```bash
npm run update -- "Descrição da atualização"
```

Usuários que já têm o app instalado (build com OTA configurado) receberão a atualização na **próxima abertura** do app (verificação em `ON_LOAD`).

## 4. Comportamento no app

- **Em desenvolvimento** (`expo start` / Expo Go): OTA é ignorado.
- **Em build de produção**: ao abrir o app, ele chama `Updates.checkForUpdateAsync()`. Se houver update, baixa e aplica com `Updates.reloadAsync()`.
- **runtimeVersion**: em `app.json` está `"runtimeVersion": "1.0.0"`. Só builds com o mesmo `runtimeVersion` recebem o update. Se mudar código **nativo** (plugins, dependências nativas), altere o `runtimeVersion` (ex.: `1.0.1`) e gere uma **nova APK**; a partir daí pode voltar a usar só OTA para mudanças de JS/assets.

## 5. Canais (opcional)

- **production**: usuários finais (`eas update --branch production`).
- **preview**: testes (`eas update --branch preview`). Builds de preview devem usar o canal `preview` no perfil do `eas.json`.

## Resumo

| Ação | Comando |
|------|--------|
| Configurar OTA (uma vez) | `eas login` e `eas update:configure` |
| Gerar APK que recebe OTA | `eas build -p android --profile production` ou prebuild + gradle (após configure) |
| Publicar update (sem nova APK) | `eas update --branch production --message "..."` ou `npm run update -- "..."` |

Assim, ao atualizar o app você **não precisa baixar outra APK**: basta publicar com `eas update` e os usuários recebem a nova versão ao reabrir o app.
