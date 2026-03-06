# Limpeza de arquivos – SIGEO Mobile

## O que já foi limpo (uma vez)

- **build/** – Mantida apenas a APK mais recente com OTA (`SIGEO-Mobile-v1.0.0-OTA-release.apk`). A APK antiga (sem OTA) foi removida.
- **SIGEO/docs/scripts** – Removido `route53-sigeo-v2-alias.json` (uso único; registro já criado no Route 53).
- **android/app/.cxx** – Cache do CMake removido (é recriado no próximo build).
- **.expo** – Cache do Expo removido (é recriado ao rodar `expo start`).

## O que o .gitignore já evita commitar

- `/android` (projeto nativo gerado pelo prebuild)
- `/build` e `*.apk`
- `node_modules/`, `.expo/`, `dist/`

## Limpeza manual (quando quiser liberar espaço)

1. **Só uma APK em build/**  
   Apague as mais antigas e deixe só a que for distribuir.

2. **Artefatos do Android**  
   Dentro de `SIGEO-mobile/android`:
   - `./gradlew clean` (pode falhar em algum passo do CMake; não é crítico).
   - Ou apague manualmente: `android/app/build`, `android/build`, `android/app/.cxx`.

3. **Cache do Metro**  
   `npx expo start --clear` ou apague a pasta `.expo` se existir.

4. **Reinstalar dependências**  
   Apague `node_modules` e rode `npm install` (útil se algo quebrar).
