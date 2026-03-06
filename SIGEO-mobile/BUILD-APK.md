# Gerar APK do SIGEO Mobile

**Atualizações sem nova APK:** depois da primeira instalação, você pode publicar atualizações de código (JS/assets) via **OTA**. Veja **[OTA-UPDATES.md](./OTA-UPDATES.md)**.

## Pré-requisitos

- **Node.js** e `npm install` na pasta do projeto
- **Android SDK** (Android Studio ou [command-line tools](https://developer.android.com/studio#command-tools))
- **ANDROID_HOME** apontando para o SDK (ex.: `C:\Users\<user>\AppData\Local\Android\Sdk` no Windows)

## Passo a passo

### 1. Gerar o projeto Android (prebuild)

```bash
cd SIGEO-mobile
npx expo prebuild --platform android --clean
```

Se o Android SDK não for encontrado, crie `android/local.properties` (não versionar) com:

```properties
sdk.dir=C:/Users/SEU_USUARIO/AppData/Local/Android/Sdk
```

(Ajuste o caminho para o seu sistema.)

### 2. Build da APK

**Windows (PowerShell/CMD):**

```bash
cd android
set ANDROID_HOME=C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk
gradlew.bat app:assembleRelease
```

**Linux/macOS:**

```bash
cd android
export ANDROID_HOME=~/Android/Sdk   # ou o seu caminho
./gradlew app:assembleRelease
```

### 3. Onde está a APK

- **Caminho direto:** `android/app/build/outputs/apk/release/app-release.apk`
- **Cópia em build:** `build/SIGEO-Mobile-v1.0.0-release.apk` (se você copiar para lá)

A APK gerada é assinada com a chave de debug (para testes). Para distribuição (Play Store), use assinatura release e EAS Build ou configure `android/app/build.gradle` com sua keystore.

## Versão e pacote

- **Pacote Android:** `br.com.advances.sigeo` (em `app.json` → `expo.android.package`)
- **Versão:** `app.json` → `expo.version`

## API em produção (backend AWS)

Para a APK usar o backend na AWS, o **`.env`** na raiz do projeto deve ter:

```bash
EXPO_PUBLIC_API_URL=https://api.sigeo.advances.com.br
```

**Importante:** a URL é gravada no bundle no momento do build. Se o `.env` estiver com IP local (ex.: `http://192.168.1.11:3000`), a APK ficará apontando para esse endereço. Ajuste o `.env` para a URL da AWS e rode `gradlew app:assembleRelease` de novo para gerar uma APK conectada ao backend em produção.
