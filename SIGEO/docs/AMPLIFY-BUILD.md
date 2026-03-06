# Build do SIGEO no AWS Amplify

## Se o `npm ci` falhar com "package.json and package-lock.json are in sync"

1. **Root directory em branco**  
   No Amplify: **Build settings** (ou **Configurações de compilação**) → campo **Root directory** deve estar **vazio**.  
   O build precisa rodar na **raiz do repositório** para que o `amplify.yml` use `cd SIGEO && npm ci`.  
   Se Root directory estiver como `SIGEO`, o Amplify roda dentro da pasta SIGEO e o comando `cd SIGEO` falha; aí o spec pode não rodar como esperado.

2. **Repositório correto**  
   Em **Configurações da aplicação** (ou **General**) confira se o repositório e o branch são os que você está usando (ex.: `main`).  
   O `SIGEO/package-lock.json` atualizado precisa estar nesse repositório/branch.

3. **Limpar cache e reimplantar**  
   No app Amplify → **Hosting** → último build → **Redeploy** (Reimplantar).  
   Se houver opção para **Clear cache and redeploy**, use para garantir que não está usando cache antigo.

4. **Sincronizar o lock localmente (se precisar de novo)**  
   Na pasta **SIGEO** (raiz do frontend):

   ```bash
   cd SIGEO
   npm install
   npm ci   # deve passar
   git add package-lock.json
   git commit -m "fix: sincroniza package-lock para Amplify"
   git push origin main
   ```

Depois disso, dispare um novo build e confira os logs: deve aparecer `pwd`, `ls -la` e o uso de `SIGEO/package-lock.json`.
