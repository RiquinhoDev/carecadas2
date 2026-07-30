# Carecadas Astro Editorial Platform Design

**Estado:** aprovado para planeamento em 2026-07-30

## 1. Objetivo

Transformar o Carecadas numa plataforma editorial moderna, rápida e
indexável, preservando os estudos HTML atuais durante uma migração gradual.
A primeira fase deve funcionar sem CMS, base de dados ou servidor permanente
e ter um custo operacional alvo de EUR 0, excluindo um eventual domínio
próprio.

O sistema começa com conteúdo criado pelos autores em Git, através de MDX e
dados estruturados. A arquitetura deve permitir acrescentar posteriormente
um CMS, uma equipa editorial, autenticação, subscrições, conteúdo reservado,
uma API e uma base de dados sem reescrever o site editorial.

## 2. Contexto atual

O projeto atual é um servidor Express que publica ficheiros estáticos:

- `public/index.html` contém a página inicial e links manuais;
- `public/estudos/*.html` contém os estudos, cada um com estrutura, estilos e
  comportamento próprios;
- `server.js` serve `public/` e usa a página inicial como fallback;
- não existem comandos de build, lint, typecheck ou testes;
- a maioria dos estudos contém apenas metadados HTML mínimos;
- o estudo de BTC já contém description, Open Graph e Twitter Cards;
- o deploy atual é feito no Railway.

Os estudos existentes são conteúdo válido e devem continuar acessíveis nas
URLs públicas atuais enquanto a nova representação é construída. Não serão
reescritos todos de uma vez.

## 3. Decisões arquiteturais

### 3.1 Framework e renderização

A aplicação pública usará Astro, TypeScript e React.

- Astro gera HTML estático por omissão.
- React é usado apenas em ilhas que precisam de estado ou interação, como
  gráficos, filtros, pesquisa avançada ou futuros controlos autenticados.
- O conteúdo essencial, navegação e metadados existem no HTML inicial sem
  depender de JavaScript no browser.
- A primeira versão é uma única aplicação, não um monorepo.
- Um monorepo só será introduzido quando existir uma segunda aplicação ou um
  pacote efetivamente partilhado.
- A aplicação autenticada futura pode viver em `app.<dominio>` e a API em
  `api.<dominio>`, mantendo o site editorial em Astro.

### 3.2 Organização modular

A estrutura de referência é:

```text
src/
├── components/       componentes Astro e ilhas React
├── content/          artigos, autores e taxonomias
├── domain/           tipos e regras editoriais independentes
├── i18n/             dicionários de interface e helpers de locale
├── layouts/          layouts de página
├── pages/            rotas Astro
├── repositories/     acesso à origem de conteúdo
├── seo/              metadados, JSON-LD e regras de indexação
└── styles/           tokens e estilos globais
public/
├── estudos/          URLs legadas preservadas durante a migração
└── media/            recursos públicos
scripts/              verificações e automações editoriais
tests/                testes unitários, integração e browser
```

Cada módulo tem uma responsabilidade clara. O domínio editorial não importa
Astro, MDX, React, Cloudflare nem um SDK de CMS.

### 3.3 Origem do conteúdo

As páginas não devem depender diretamente do sistema de ficheiros ou de um
SDK de CMS. O código de aplicação consulta um contrato de leitura de conteúdo
com operações para:

- listar artigos publicados;
- obter um artigo por locale e slug;
- listar autores, categorias e etiquetas;
- encontrar traduções publicadas pelo `translationKey`;
- excluir rascunhos e publicações futuras da saída pública.

A primeira implementação usa as Content Collections do Astro e MDX local.
Uma futura implementação poderá carregar conteúdo remoto de um CMS através do
mesmo modelo de domínio. Só serão criadas abstrações que tenham utilização
real na primeira versão; não haverá camadas ou interfaces vazias em nome de
Clean Architecture.

## 4. Modelo editorial

Cada versão linguística de um artigo é um documento editorial autónomo. O
frontmatter é validado por schema e inclui:

- `title`;
- `description`;
- `slug`;
- `locale`;
- `translationKey`;
- `publishedAt`;
- `updatedAt`, quando aplicável;
- `authors`;
- `categories`;
- `tags`;
- `heroImage`;
- `heroImageAlt`;
- `sources`;
- `status`, com os valores `draft` ou `published`;
- `legacyPath`, quando o documento substitui um estudo atual.

Os autores e taxonomias também são coleções validadas. Um autor tem identidade
editorial, nome público, biografia, imagem opcional, locale e ligações públicas
relevantes. Categorias são estáveis e curadas; etiquetas podem ser mais
granulares, mas não são criadas automaticamente a partir de texto.

O build falha perante:

- campos obrigatórios inválidos;
- slugs ou canonicals duplicados;
- referências a autores, imagens ou taxonomias inexistentes;
- `translationKey` incompatível;
- datas inválidas;
- uma publicação marcada como pública sem os metadados exigidos;
- HTML perigoso não autorizado em MDX.

Rascunhos e artigos com data futura não entram nas rotas públicas, navegação,
pesquisa, sitemap ou RSS.

## 5. Internacionalização

O locale canónico é `pt-PT`. Inglês é suportado como `en`.

- Português usa URLs sem prefixo, por exemplo
  `/estudos/ciclos-bitcoin/`.
- Inglês usa prefixo, por exemplo
  `/en/research/bitcoin-cycles/`.
- Menus, botões, estados e mensagens usam dicionários TypeScript tipados.
- Título, resumo, corpo, imagens e metadados de um artigo pertencem à sua
  versão editorial e não aos dicionários da interface.
- A tradução é escrita e aprovada pelo autor; não existe tradução automática
  no fluxo de publicação inicial.
- O seletor de idioma só oferece versões efetivamente publicadas.
- Uma tradução inexistente devolve 404; não mostra conteúdo português numa URL
  inglesa.
- `hreflang` e alternates só referenciam traduções publicadas.
- Números, datas, moedas e unidades são formatados pelo locale de apresentação.
- Valores factuais vindos de uma base de dados futura não são traduzidos; os
  seus rótulos e formatos são localizados.

## 6. Migração dos estudos legados

A migração é incremental e reversível:

1. Manter cada HTML atual na sua URL pública exata.
2. Extrair conteúdo para MDX e substituir padrões repetidos por componentes
   reutilizáveis.
3. Construir a nova rota sem remover a antiga.
4. Comparar conteúdo, apresentação, comportamento, acessibilidade, links e
   metadados.
5. Publicar a nova rota quando cumprir os critérios de equivalência.
6. Criar um redirect HTTP permanente da URL antiga para a nova.
7. Confirmar o redirect, canonical, sitemap e ausência de links internos para
   a rota antiga.
8. Só então retirar o ficheiro legado do artefacto público.

Um mapa versionado de redirects preserva ligações externas e autoridade
acumulada. Durante o período em que ambas as versões são acessíveis, a
estratégia canonical deve impedir concorrência entre conteúdo duplicado.

## 7. SEO técnico

Cada página indexável produz no HTML inicial:

- `title` e meta description únicos;
- canonical absoluto;
- alternates `hreflang` válidos;
- Open Graph e Twitter Cards;
- datas verdadeiras de publicação e atualização;
- autor ligado a uma página pública;
- imagem social com dimensões e texto alternativo;
- um único `h1` e hierarquia coerente de títulos;
- elementos semânticos como `article`, `header`, `nav` e `footer`.

O site gera:

- sitemap XML com `lastmod` correspondente a alterações reais;
- RSS por idioma;
- `robots.txt` com referência ao sitemap;
- páginas de autor, categoria e arquivo;
- breadcrumbs;
- página 404;
- redirects permanentes versionados.

JSON-LD usa os tipos adequados ao conteúdo visível, incluindo `Article`,
`Person`, `Organization` e `BreadcrumbList`. Os dados estruturados nunca
afirmam informação que não esteja representada na página. A validação inclui
testes automatizados e verificação inicial no Google Rich Results Test.

Google Search Console e Bing Webmaster Tools serão configurados quando existir
um domínio de produção. IndexNow notificará URLs criadas, alteradas ou
removidas depois de um deploy bem-sucedido. A sua falha não invalida o deploy;
o sitemap continua a ser o mecanismo base de descoberta.

## 8. Descoberta por motores com IA

Não existe uma camada separada de "LLM SEO" com garantias de ranking. A base
para Google AI Overviews, AI Mode e sistemas de recuperação é a mesma:
conteúdo público, indexável, útil, citável e tecnicamente acessível.

As páginas devem:

- apresentar resumos claros;
- atribuir autoria e datas;
- ligar fontes às afirmações relevantes;
- acompanhar tabelas, gráficos e imagens com contexto textual;
- usar títulos de secção descritivos;
- evitar texto artificial criado apenas para crawlers.

`OAI-SearchBot` será permitido para descoberta no ChatGPT Search. A política
de `GPTBot`, usado para potencial treino, é uma decisão independente e fica
configurada explicitamente no `robots.txt`. Não se depende de `robots.txt`
para proteger conteúdo privado.

Um eventual `llms.txt` é experimental, opcional e não constitui critério de
aceitação. O Google declara que não são necessários ficheiros AI ou markup
especial para aparecer nas suas funcionalidades generativas.

## 9. Acessibilidade, desempenho e segurança

- O site segue HTML semântico, navegação por teclado, contraste suficiente,
  foco visível e textos alternativos úteis.
- JavaScript no cliente é limitado às ilhas que o exigem.
- Imagens são dimensionadas, otimizadas e carregadas de acordo com a sua
  prioridade visual.
- Fontes e recursos críticos evitam dependências externas desnecessárias.
- Conteúdo MDX não permite scripts arbitrários por omissão.
- Segredos não entram no repositório, conteúdo, bundle ou variáveis públicas.
- Conteúdo privado futuro é protegido por autenticação e autorização no
  servidor, nunca apenas por `robots.txt` ou elementos escondidos.

## 10. Desenvolvimento local

O fluxo local previsto é:

```powershell
npm.cmd install
npm.cmd run dev
```

O servidor de desenvolvimento Astro fica normalmente disponível em
`http://localhost:4321` e atualiza o browser durante a edição.

Também existirão:

- `npm.cmd run build` para gerar o artefacto de produção;
- `npm.cmd run preview` para servir localmente o artefacto;
- uma forma de executar lint, typecheck, testes e verificações editoriais;
- Wrangler apenas quando for necessário validar funcionalidades Cloudflare.

Os HTML legados permanecem acessíveis no ambiente local através das mesmas
rotas públicas usadas em produção.

## 11. Qualidade e gates

O projeto terá:

- TypeScript strict;
- ESLint e Prettier;
- validação das Content Collections;
- testes unitários para domínio, SEO, URLs e i18n;
- testes de integração para artigos, sitemap e feeds;
- Playwright para home, artigo, idioma, navegação e URLs legadas;
- axe para verificações de acessibilidade;
- verificação de links, imagens e referências;
- build Astro obrigatório;
- Lighthouse para desempenho, SEO, acessibilidade e boas práticas.

O pipeline de entrega é:

```text
edição local
→ lint, typecheck e testes
→ build estático
→ pull request
→ preview Cloudflare
→ revisão
→ deploy de produção
→ smoke test
→ notificação IndexNow
```

Um gate que encontre um erro real bloqueia a publicação. Testes ou validações
não são enfraquecidos para forçar um resultado verde.

## 12. Deploy, observabilidade e custos

Cloudflare Pages será o destino inicial:

- integração com Git;
- builds e previews por pull request;
- CDN, TLS e domínio próprio;
- artefactos estáticos sem processo Express permanente.

Cloudflare Web Analytics é a primeira opção de analytics. Search Console e
Bing Webmaster Tools medem descoberta e indexação. Referências de assistentes
de IA são acompanhadas quando a ferramenta de analytics as identificar.

O orçamento inicial é:

| Componente | Custo alvo |
| --- | ---: |
| Astro, React e TypeScript | EUR 0 |
| GitHub | EUR 0 |
| Cloudflare Pages e previews | EUR 0 |
| Cloudflare Web Analytics | EUR 0 |
| Search Console e Bing Webmaster Tools | EUR 0 |
| CMS | não utilizado |
| Base de dados | não utilizada |
| Domínio próprio | custo opcional separado |

Nenhum serviço pago será introduzido sem necessidade concreta e aprovação
explícita. Os limites dos planos gratuitos são documentados e revalidados antes
de decisões de infraestrutura, porque podem mudar.

## 13. Evolução futura

### Fase 1: fundação editorial

Astro estático, MDX tipado, design system mínimo, SEO, i18n, testes, deploy e
preservação integral dos estudos atuais.

### Fase 2: produto editorial

Pesquisa, newsletter, comentários e analytics podem usar serviços externos
gratuitos através de adaptadores substituíveis. Cada integração tem política
de privacidade, fallback e limite de custo.

### Fase 3: colaboração

Quando vários editores precisarem de painel, um CMS headless implementa o
contrato de conteúdo existente. A migração é testada antes de trocar a origem
oficial.

### Fase 4: plataforma

Contas, subscrições, conteúdo reservado e dashboards usam uma aplicação e API
independentes quando a complexidade justificar. O site público, conteúdo,
schemas, SEO e componentes partilháveis permanecem válidos.

## 14. Fora do âmbito da fundação

- criar já um CMS;
- criar base de dados;
- implementar autenticação ou pagamentos;
- converter todos os estudos legados;
- construir pesquisa remota;
- criar uma aplicação autenticada vazia;
- criar abstrações para fornecedores ainda não escolhidos;
- garantir ranking ou indexação por qualquer motor de pesquisa;
- introduzir serviços pagos.

## 15. Critérios de sucesso da fundação

A fundação está pronta quando:

- o site Astro corre localmente e gera um build estático;
- a home e pelo menos um artigo de referência usam a nova arquitetura;
- todos os estudos legados continuam acessíveis nas URLs atuais;
- schemas impedem conteúdo editorial inválido;
- pt-PT funciona como locale canónico e a arquitetura aceita uma versão
  inglesa publicada pelo autor;
- metadados, canonical, `hreflang`, JSON-LD, sitemap, RSS e `robots.txt` são
  gerados e testados;
- lint, typecheck, testes, Playwright e build passam;
- existe preview no Cloudflare Pages;
- o custo operacional obrigatório da fase editorial permanece em EUR 0;
- a documentação explica como criar, validar, publicar e migrar um artigo.

## 16. Referências oficiais

- Astro Content Collections:
  https://docs.astro.build/en/guides/content-collections/
- Astro internationalization:
  https://docs.astro.build/en/guides/internationalization/
- Astro on Cloudflare:
  https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
- Cloudflare Pages limits:
  https://developers.cloudflare.com/pages/platform/limits/
- Google article structured data:
  https://developers.google.com/search/docs/appearance/structured-data/article
- Google AI features and websites:
  https://developers.google.com/search/docs/appearance/ai-features
- OpenAI publishers and developers FAQ:
  https://help.openai.com/en/articles/12627856-publishers-and-developers-faq
- IndexNow protocol:
  https://www.indexnow.org/documentation
