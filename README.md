# Carecadas Estudos

Site simples para publicar estudos pessoais no Railway.

## Estrutura

- `public/index.html`: página inicial com links dos estudos.
- `public/estudos/`: coloque aqui todos os seus arquivos HTML de estudo.
- `server.js`: servidor Express para deploy no Railway.

## Rodar localmente

```bash
npm install
npm start
```

Abra `http://localhost:3000`.

## Deploy no Railway

1. Suba esse projeto para um repositório GitHub.
2. No Railway: `New Project` -> `Deploy from GitHub repo`.
3. Selecione o repositório.
4. Railway detecta Node automaticamente e roda `npm start`.
5. Ao finalizar, abra o domínio gerado.

## Como adicionar novo estudo

1. Adicione o arquivo em `public/estudos/`.
2. Inclua um link novo em `public/index.html`.
3. Commit + push para o GitHub.
4. Railway faz redeploy automático.
