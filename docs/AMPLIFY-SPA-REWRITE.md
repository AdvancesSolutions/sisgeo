# Amplify: corrigir 404 em rotas do app (SPA)

Se ao acessar diretamente uma URL como `/employees/` ou `/tasks` aparecer **HTTP ERROR 404**, é porque o Amplify não está servindo `index.html` para essas rotas (o React Router resolve no cliente).

## Solução: regra de rewrite no Console

1. Abra o **AWS Console** → **Amplify** → escolha o app **sigeo**.
2. No menu lateral: **Hosting** → **Rewrites and redirects**.
3. Clique em **Manage redirects**.
4. No editor JSON, **adicione** a regra de rewrite (200) para SPA.  
   Se já existir outras regras, inclua esta no **início** do array:

**Regra recomendada (regex)**  
Ela manda para `index.html` só caminhos que **não** são arquivos estáticos (.js, .css, .png, etc.), para não quebrar o carregamento de scripts e estilos. Substitua todo o conteúdo do editor por:

```json
[
  {
    "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>",
    "status": "200",
    "target": "/index.html",
    "condition": null
  }
]
```

5. Clique em **Save**.

A regra faz com que qualquer caminho que **não** seja arquivo estático (.js, .css, .png, etc.) seja atendido pelo `/index.html` (status 200), e o React Router passa a resolver `/employees/`, `/tasks`, etc.

Depois de salvar, teste de novo: https://main.d4eu378gsc65t.amplifyapp.com/employees/
