# Carecadas Astro Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Express-served home with a production-ready Astro editorial foundation while preserving every current study URL and keeping mandatory operating costs at EUR 0.

**Architecture:** Astro 7 statically renders the public site from typed Content Collections. A narrow repository module isolates content queries, Astro components own presentation, React is installed for future interactive islands, and Cloudflare Pages serves the static artefact. Existing HTML studies remain unchanged in `public/estudos/` until each one passes a separate migration gate.

**Tech Stack:** Astro 7.1+, TypeScript strict, React 19, MDX, Astro Content Layer, Zod through `astro/zod`, Vitest, Playwright Chromium, axe, ESLint, Prettier, Lighthouse CI, Cloudflare Pages.

## Global Constraints

- Use Node `24` locally and in CI; declare `engines.node` as `>=22.12.0`.
- Use npm and commit the generated `package-lock.json`.
- Keep the public application statically generated; do not add an SSR adapter, database, CMS, authentication, payment provider, or permanent Node server.
- Keep `pt-PT` as the canonical locale without a URL prefix and reserve `/en/` for editor-published English content.
- Preserve every tracked file under `public/estudos/` byte-for-byte and preserve `public/watchlists.html`.
- Do not redirect or delete a legacy URL in this foundation.
- Use React only for components that require browser-side state; the foundation itself must work without client JavaScript.
- Keep mandatory operating cost at EUR 0. A custom domain remains optional.
- Treat `SITE_URL` as deploy configuration. Local fallback is `http://localhost:4321`; production documentation must require the final HTTPS origin.
- Permit `OAI-SearchBot`; keep the `GPTBot` training decision explicit and default to disallowing it until the publisher chooses otherwise.
- Every implementation task follows RED, GREEN, refactor, fresh verification, then one coherent commit.
- Run Playwright against Chromium only and one test process at a time.
- Push only `codex/astro-foundation`, after the complete fresh gate passes.

---

## File Structure

The foundation creates or changes these units:

```text
.
├── .github/workflows/ci.yml
├── .nvmrc
├── astro.config.ts
├── eslint.config.js
├── lighthouse.config.cjs
├── package.json
├── playwright.config.ts
├── prettier.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── legacy-source/index.html
├── public/
│   ├── _headers
│   ├── robots.txt
│   ├── watchlists.html
│   └── estudos/*              unchanged legacy studies
├── scripts/
│   ├── notify-indexnow.mjs
│   └── validate-production-env.mjs
├── src/
│   ├── components/
│   │   ├── ArticleCard.astro
│   │   ├── LanguageSwitcher.astro
│   │   └── SeoHead.astro
│   ├── content/
│   │   ├── articles/pt-PT/bem-vindo-ao-carecadas.mdx
│   │   ├── authors/carecao.json
│   │   └── categories/investigacao.json
│   ├── content.config.ts
│   ├── data/legacyStudies.ts
│   ├── domain/
│   │   ├── article.ts
│   │   └── locale.ts
│   ├── i18n/
│   │   ├── paths.ts
│   │   └── ui.ts
│   ├── layouts/
│   │   ├── ArticleLayout.astro
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── 404.astro
│   │   ├── autores/[slug].astro
│   │   ├── categorias/[slug].astro
│   │   ├── estudos/[slug].astro
│   │   ├── feed.xml.ts
│   │   └── index.astro
│   ├── repositories/contentRepository.ts
│   ├── seo/
│   │   ├── jsonLd.ts
│   │   └── metadata.ts
│   └── styles/global.css
├── tests/
│   ├── e2e/foundation.spec.ts
│   ├── fixtures/article.ts
│   ├── integration/discovery.test.ts
│   └── unit/
│       ├── article-schema.test.ts
│       ├── content-repository.test.ts
│       ├── i18n.test.ts
│       ├── legacy-contract.test.ts
│       └── seo.test.ts
└── docs/runbooks/
    ├── cloudflare-pages.md
    ├── local-development.md
    ├── migrate-legacy-study.md
    └── publish-article.md
```

Responsibilities:

- `src/domain/*` owns stable editorial types and locale rules.
- `src/content.config.ts` maps Astro loaders to domain schemas.
- `src/repositories/contentRepository.ts` is the only module that calls Astro collection query APIs.
- `src/seo/*` builds framework-independent metadata and JSON-LD objects.
- `src/components/SeoHead.astro` serializes trusted SEO view models into HTML.
- `src/data/legacyStudies.ts` is the typed, reviewed catalogue of old public documents.
- `src/pages/*` maps URLs to repositories, layouts, and components.
- `scripts/*` performs deploy-time checks and notifications; a notification failure never changes the generated site.

---

### Task 1: Scaffold Astro without breaking legacy URLs

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.gitignore`
- Create: `.nvmrc`
- Create: `astro.config.ts`
- Create: `tsconfig.json`
- Create: `eslint.config.js`
- Create: `prettier.config.mjs`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/pages/index.astro`
- Create: `tests/unit/legacy-contract.test.ts`
- Move: `public/index.html` to `legacy-source/index.html`
- Delete: `server.js`

**Interfaces:**

- Produces npm scripts: `dev`, `build`, `preview`, `check`, `lint`, `format:check`, `test`, `test:e2e`, and `qa`.
- Produces a static Astro home at `/`.
- Preserves all existing files and URLs below `/estudos/` and `/watchlists.html`.

- [ ] **Step 1: Install the framework and test toolchain**

Run:

```powershell
npm.cmd uninstall express
npm.cmd install astro@^7.1.0 @astrojs/mdx @astrojs/react @astrojs/rss @astrojs/sitemap react react-dom
npm.cmd install --save-dev @astrojs/check @axe-core/playwright @eslint/js @lhci/cli @playwright/test @types/node @types/react @types/react-dom eslint eslint-plugin-astro eslint-plugin-jsx-a11y prettier prettier-plugin-astro typescript typescript-eslint vitest
```

Edit `package.json` so its scripts and engine are exactly:

```json
{
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:e2e": "playwright test --workers=1",
    "qa": "npm run format:check && npm run lint && npm run check && npm test && npm run build && npm run test:e2e"
  },
  "engines": {
    "node": ">=22.12.0"
  }
}
```

Keep the name, version, privacy flag, and description. Remove `main` and
Express. Let npm write the dependency versions and lockfile.

- [ ] **Step 2: Add the failing legacy contract test**

Create `tests/unit/legacy-contract.test.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const legacyPaths = [
  'public/estudos/biologia_tsmc_nichos.html',
  'public/estudos/btc_ciclos.html',
  'public/estudos/CaseStudy_Market_Crash_2026.html',
  'public/estudos/ciberseguranca_nichos.html',
  'public/estudos/energia_nichos.html',
  'public/estudos/estrategia-investimento-carecao.html',
  'public/estudos/estudo-investidores-completo.html',
  'public/estudos/meta-2q26.html',
  'public/estudos/quantum_computing_nichos.html',
  'public/estudos/robotica_fisica_nichos.html',
  'public/estudos/tsmc_nichos.html',
  'public/estudos/tsmc-2q26-carecao.html',
  'public/watchlists.html',
] as const;

describe('Astro migration contract', () => {
  it.each(legacyPaths)('preserves %s', (path) => {
    expect(existsSync(path)).toBe(true);
    expect(readFileSync(path, 'utf8').length).toBeGreaterThan(100);
  });

  it('uses Astro instead of the Express server', () => {
    expect(existsSync('src/pages/index.astro')).toBe(true);
    expect(existsSync('server.js')).toBe(false);
  });
});
```

- [ ] **Step 3: Run the test to verify RED**

Run:

```powershell
npm.cmd test -- tests/unit/legacy-contract.test.ts
```

Expected: FAIL because `src/pages/index.astro` does not exist and `server.js`
still exists. The legacy file assertions must already pass.

- [ ] **Step 4: Configure Astro and the static home**

Create `.nvmrc`:

```text
24
```

Create `astro.config.ts`:

```ts
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  output: 'static',
  integrations: [mdx(), react(), sitemap()],
  trailingSlash: 'always',
});
```

Create `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strictest",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

Create `vitest.config.ts`:

```ts
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4321/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

Create `eslint.config.js`:

```js
import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['.astro/**', 'dist/**', 'node_modules/**', 'playwright-report/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs['flat/recommended'],
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { 'jsx-a11y': jsxA11y },
    rules: jsxA11y.flatConfigs.recommended.rules,
  },
);
```

Create `prettier.config.mjs`:

```js
export default {
  plugins: ['prettier-plugin-astro'],
  overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
  singleQuote: true,
  trailingComma: 'all',
};
```

Append these exact entries to `.gitignore`:

```gitignore
.astro/
dist/
playwright-report/
test-results/
.lighthouseci/
```

Move the old homepage to `legacy-source/index.html`. Create
`src/pages/index.astro`:

```astro
---
const legacyStudiesUrl = '/estudos/';
---

<!doctype html>
<html lang="pt-PT">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Carecadas</title>
    <meta
      name="description"
      content="Estudos independentes sobre mercados, tecnologia e investimento."
    />
  </head>
  <body>
    <main>
      <h1>Carecadas</h1>
      <p>Uma nova base editorial está a nascer sem apagar os estudos existentes.</p>
      <a href={legacyStudiesUrl + 'btc_ciclos.html'}>Abrir estudo dos ciclos da BTC</a>
    </main>
  </body>
</html>
```

Delete `server.js`.

- [ ] **Step 5: Run the focused and structural gates**

Run:

```powershell
npm.cmd test -- tests/unit/legacy-contract.test.ts
npm.cmd run check
npm.cmd run build
```

Expected: the focused test passes, Astro check reports zero errors, and
`dist/index.html`, `dist/estudos/btc_ciclos.html`, and
`dist/watchlists.html` exist.

- [ ] **Step 6: Commit**

```powershell
git add package.json package-lock.json .gitignore .nvmrc astro.config.ts tsconfig.json eslint.config.js prettier.config.mjs vitest.config.ts playwright.config.ts src/pages/index.astro tests/unit/legacy-contract.test.ts legacy-source/index.html public/index.html server.js
git commit -m "build: establish Astro foundation"
```

---

### Task 2: Add the typed editorial model and content repository

**Files:**

- Create: `src/domain/locale.ts`
- Create: `src/domain/article.ts`
- Create: `src/content.config.ts`
- Create: `src/repositories/contentRepository.ts`
- Create: `src/content/authors/carecao.json`
- Create: `src/content/categories/investigacao.json`
- Create: `src/content/articles/pt-PT/bem-vindo-ao-carecadas.mdx`
- Create: `tests/fixtures/article.ts`
- Create: `tests/unit/article-schema.test.ts`
- Create: `tests/unit/content-repository.test.ts`

**Interfaces:**

- Produces: `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `Locale`.
- Produces: `articleSchema`, `ArticleData`, `isArticlePublished()`.
- Produces: `listPublishedArticles({ locale, now? })`,
  `getPublishedArticle({ locale, slug, now? })`, and
  `findPublishedTranslation({ translationKey, locale, now? })`.
- Produces: `getAuthor({ locale, slug })`, `getCategory({ locale, slug })`,
  `listAuthors(locale)`, and `listCategories(locale)`.
- Content pages use the repository functions and never call
  `getCollection()` directly.

- [ ] **Step 1: Write the failing schema tests**

Create `tests/fixtures/article.ts`:

```ts
import type { ArticleData } from '../../src/domain/article';

export const validArticleData: ArticleData = {
  title: 'Bem-vindo ao Carecadas',
  description: 'A base editorial dos estudos independentes do Carecadas.',
  slug: 'bem-vindo-ao-carecadas',
  locale: 'pt-PT',
  translationKey: 'welcome-carecadas',
  publishedAt: new Date('2026-07-30T09:00:00.000Z'),
  authors: ['carecao'],
  categories: ['investigacao'],
  tags: ['carecadas', 'estudos'],
  heroImage: '/logo-serriquinho.png',
  heroImageAlt: 'Símbolo editorial do Carecadas.',
  sources: [],
  status: 'published',
};
```

Create `tests/unit/article-schema.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { articleSchema, isArticlePublished } from '../../src/domain/article';
import { validArticleData } from '../fixtures/article';

describe('articleSchema', () => {
  it('accepts a complete pt-PT article', () => {
    expect(articleSchema.parse(validArticleData)).toMatchObject(validArticleData);
  });

  it('rejects missing social image alternative text', () => {
    const { heroImageAlt: _removed, ...invalid } = validArticleData;
    expect(() => articleSchema.parse(invalid)).toThrow();
  });

  it('keeps drafts and future articles private', () => {
    const now = new Date('2026-07-30T10:00:00.000Z');
    expect(isArticlePublished(validArticleData, now)).toBe(true);
    expect(isArticlePublished({ ...validArticleData, status: 'draft' }, now)).toBe(false);
    expect(
      isArticlePublished(
        { ...validArticleData, publishedAt: new Date('2026-07-31T10:00:00.000Z') },
        now,
      ),
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run the schema test to verify RED**

Run:

```powershell
npm.cmd test -- tests/unit/article-schema.test.ts
```

Expected: FAIL because `src/domain/article.ts` does not exist.

- [ ] **Step 3: Implement locale and article schemas**

Create `src/domain/locale.ts`:

```ts
export const SUPPORTED_LOCALES = ['pt-PT', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'pt-PT';
```

Create `src/domain/article.ts`:

```ts
import { z } from 'astro/zod';
import { SUPPORTED_LOCALES } from './locale';

export const articleSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(50).max(170),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  locale: z.enum(SUPPORTED_LOCALES),
  translationKey: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  authors: z.array(z.string().min(1)).min(1),
  categories: z.array(z.string().min(1)).min(1),
  tags: z.array(z.string().min(1)),
  heroImage: z.string().startsWith('/'),
  heroImageAlt: z.string().min(1).max(180),
  sources: z.array(
    z.object({
      title: z.string().min(1),
      url: z.string().url(),
    }),
  ),
  status: z.enum(['draft', 'published']),
  legacyPath: z.string().startsWith('/').optional(),
});

export type ArticleData = z.infer<typeof articleSchema>;

export function isArticlePublished(
  article: Pick<ArticleData, 'status' | 'publishedAt'>,
  now = new Date(),
): boolean {
  return article.status === 'published' && article.publishedAt <= now;
}
```

Create `src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { articleSchema } from './domain/article';
import { SUPPORTED_LOCALES } from './domain/locale';

const articles = defineCollection({
  loader: glob({
    base: './src/content/articles',
    pattern: '**/*.{md,mdx}',
  }),
  schema: articleSchema,
});

const authors = defineCollection({
  loader: glob({
    base: './src/content/authors',
    pattern: '**/*.json',
  }),
  schema: z.object({
    name: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    locale: z.enum(SUPPORTED_LOCALES),
    bio: z.string().min(1),
    image: z.string().startsWith('/').optional(),
    sameAs: z.array(z.string().url()),
  }),
});

const categories = defineCollection({
  loader: glob({
    base: './src/content/categories',
    pattern: '**/*.json',
  }),
  schema: z.object({
    name: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    locale: z.enum(SUPPORTED_LOCALES),
    description: z.string().min(1),
  }),
});

export const collections = { articles, authors, categories };
```

- [ ] **Step 4: Add real seed content**

Create `src/content/authors/carecao.json`:

```json
{
  "name": "Carecão",
  "slug": "carecao",
  "locale": "pt-PT",
  "bio": "Autor dos estudos independentes publicados no Carecadas.",
  "image": "/chibi.png",
  "sameAs": []
}
```

Create `src/content/categories/investigacao.json`:

```json
{
  "name": "Investigação",
  "slug": "investigacao",
  "locale": "pt-PT",
  "description": "Estudos aprofundados sobre mercados, empresas e tecnologia."
}
```

Create `src/content/articles/pt-PT/bem-vindo-ao-carecadas.mdx`:

```mdx
---
title: "Bem-vindo ao Carecadas"
description: "A nova base editorial para publicar os estudos independentes do Carecadas com mais clareza, contexto e rigor."
slug: "bem-vindo-ao-carecadas"
locale: "pt-PT"
translationKey: "welcome-carecadas"
publishedAt: "2026-07-30T09:00:00.000Z"
authors: ["carecao"]
categories: ["investigacao"]
tags: ["carecadas", "estudos"]
heroImage: "/logo-serriquinho.png"
heroImageAlt: "Símbolo editorial do Carecadas."
sources: []
status: "published"
---

O Carecadas reúne estudos independentes sobre mercados, empresas e
tecnologia. Esta nova fundação torna cada publicação mais fácil de encontrar,
ler, atualizar e citar.

Os estudos anteriores continuam disponíveis enquanto são migrados com cuidado.
Cada migração preservará o conteúdo, a identidade visual e as ligações que já
existem.
```

- [ ] **Step 5: Add and test the repository boundary**

Create `src/repositories/contentRepository.ts`:

```ts
import { getCollection, type CollectionEntry } from 'astro:content';
import { isArticlePublished } from '../domain/article';
import type { Locale } from '../domain/locale';

export type ArticleEntry = CollectionEntry<'articles'>;

type ArticleQuery = {
  locale: Locale;
  now?: Date;
};

export async function listPublishedArticles({
  locale,
  now = new Date(),
}: ArticleQuery): Promise<ArticleEntry[]> {
  const entries = await getCollection('articles');
  return entries
    .filter(
      ({ data }) => data.locale === locale && isArticlePublished(data, now),
    )
    .sort(
      (left, right) =>
        right.data.publishedAt.getTime() - left.data.publishedAt.getTime(),
    );
}

export async function getPublishedArticle({
  locale,
  slug,
  now = new Date(),
}: ArticleQuery & { slug: string }): Promise<ArticleEntry | undefined> {
  const entries = await listPublishedArticles({ locale, now });
  return entries.find(({ data }) => data.slug === slug);
}

export async function findPublishedTranslation({
  translationKey,
  locale,
  now = new Date(),
}: ArticleQuery & { translationKey: string }): Promise<ArticleEntry | undefined> {
  const entries = await listPublishedArticles({ locale, now });
  return entries.find(({ data }) => data.translationKey === translationKey);
}

export async function getAuthor({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const entries = await getCollection('authors');
  return entries.find(
    ({ data }) => data.locale === locale && data.slug === slug,
  );
}

export async function listAuthors(locale: Locale) {
  const entries = await getCollection('authors');
  return entries.filter(({ data }) => data.locale === locale);
}

export async function getCategory({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const entries = await getCollection('categories');
  return entries.find(
    ({ data }) => data.locale === locale && data.slug === slug,
  );
}

export async function listCategories(locale: Locale) {
  const entries = await getCollection('categories');
  return entries.filter(({ data }) => data.locale === locale);
}
```

Create `tests/unit/content-repository.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validArticleData } from '../fixtures/article';

const getCollection = vi.fn();
vi.mock('astro:content', () => ({ getCollection }));

const now = new Date('2026-07-30T10:00:00.000Z');
const published = { id: 'published', data: validArticleData, body: 'Published' };
const draft = {
  id: 'draft',
  data: { ...validArticleData, slug: 'draft', status: 'draft' as const },
  body: 'Draft',
};
const future = {
  id: 'future',
  data: {
    ...validArticleData,
    slug: 'future',
    publishedAt: new Date('2026-07-31T10:00:00.000Z'),
  },
  body: 'Future',
};

describe('contentRepository', () => {
  beforeEach(() => {
    getCollection.mockResolvedValue([future, draft, published]);
  });

  it('lists only currently published content', async () => {
    const { listPublishedArticles } = await import(
      '../../src/repositories/contentRepository'
    );
    await expect(
      listPublishedArticles({ locale: 'pt-PT', now }),
    ).resolves.toEqual([published]);
  });

  it('does not expose drafts by slug', async () => {
    const { getPublishedArticle } = await import(
      '../../src/repositories/contentRepository'
    );
    await expect(
      getPublishedArticle({ locale: 'pt-PT', slug: 'draft', now }),
    ).resolves.toBeUndefined();
  });
});
```

Run:

```powershell
npm.cmd test -- tests/unit/article-schema.test.ts tests/unit/content-repository.test.ts
npm.cmd run check
```

Expected: both files pass and Astro validates every content entry.

- [ ] **Step 6: Commit**

```powershell
git add src/content.config.ts src/content src/domain src/repositories tests/fixtures tests/unit/article-schema.test.ts tests/unit/content-repository.test.ts
git commit -m "feat(content): add typed editorial model"
```

---

### Task 3: Implement locale dictionaries and URL rules

**Files:**

- Create: `src/i18n/ui.ts`
- Create: `src/i18n/paths.ts`
- Create: `src/components/LanguageSwitcher.astro`
- Create: `tests/unit/i18n.test.ts`

**Interfaces:**

- Produces: `translate(locale, key)`.
- Produces: `articlePath(locale, slug)`.
- Produces: `localizedHomePath(locale)`.
- `LanguageSwitcher.astro` consumes published alternatives only; it never
  invents a fallback translation.

- [ ] **Step 1: Write failing i18n tests**

Create `tests/unit/i18n.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { articlePath, localizedHomePath } from '../../src/i18n/paths';
import { translate } from '../../src/i18n/ui';

describe('localized paths', () => {
  it('keeps pt-PT canonical routes unprefixed', () => {
    expect(localizedHomePath('pt-PT')).toBe('/');
    expect(articlePath('pt-PT', 'ciclos-bitcoin')).toBe('/estudos/ciclos-bitcoin/');
  });

  it('prefixes and translates English routes', () => {
    expect(localizedHomePath('en')).toBe('/en/');
    expect(articlePath('en', 'bitcoin-cycles')).toBe('/en/research/bitcoin-cycles/');
  });

  it('uses typed UI dictionaries', () => {
    expect(translate('pt-PT', 'nav.studies')).toBe('Estudos');
    expect(translate('en', 'nav.studies')).toBe('Research');
  });
});
```

- [ ] **Step 2: Run the tests to verify RED**

Run:

```powershell
npm.cmd test -- tests/unit/i18n.test.ts
```

Expected: FAIL because the i18n modules do not exist.

- [ ] **Step 3: Implement dictionaries and paths**

Create `src/i18n/ui.ts`:

```ts
import type { Locale } from '../domain/locale';

const ptPT = {
  'nav.home': 'Início',
  'nav.studies': 'Estudos',
  'article.published': 'Publicado',
  'article.updated': 'Atualizado',
  'article.sources': 'Fontes',
  'language.label': 'Idioma',
} as const;

type TranslationKey = keyof typeof ptPT;

const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  'pt-PT': ptPT,
  en: {
    'nav.home': 'Home',
    'nav.studies': 'Research',
    'article.published': 'Published',
    'article.updated': 'Updated',
    'article.sources': 'Sources',
    'language.label': 'Language',
  },
};

export function translate(locale: Locale, key: TranslationKey): string {
  return dictionaries[locale][key];
}
```

Create `src/i18n/paths.ts`:

```ts
import type { Locale } from '../domain/locale';

export function localizedHomePath(locale: Locale): string {
  return locale === 'pt-PT' ? '/' : '/en/';
}

export function articlePath(locale: Locale, slug: string): string {
  return locale === 'pt-PT'
    ? `/estudos/${slug}/`
    : `/en/research/${slug}/`;
}
```

Create `LanguageSwitcher.astro` with props:

```ts
type LanguageAlternative = {
  locale: Locale;
  href: string;
  label: string;
};

type Props = {
  currentLocale: Locale;
  alternatives: readonly LanguageAlternative[];
};
```

Render nothing when `alternatives.length === 0`. Otherwise render a labelled
`nav` containing only the supplied published alternatives.

- [ ] **Step 4: Verify and commit**

Run:

```powershell
npm.cmd test -- tests/unit/i18n.test.ts
npm.cmd run check
```

Expected: all i18n assertions pass and no untyped dictionary access is
possible.

```powershell
git add src/i18n src/components/LanguageSwitcher.astro tests/unit/i18n.test.ts
git commit -m "feat(i18n): add locale routing contract"
```

---

### Task 4: Build the SEO and structured-data boundary

**Files:**

- Create: `src/seo/metadata.ts`
- Create: `src/seo/jsonLd.ts`
- Create: `src/components/SeoHead.astro`
- Create: `tests/unit/seo.test.ts`

**Interfaces:**

- Produces: `buildArticleMetadata(input): ArticleMetadata`.
- Produces: `buildArticleJsonLd(input): ArticleJsonLd`.
- `SeoHead.astro` accepts a complete metadata view model and emits title,
  description, canonical, Open Graph, X/Twitter, robots, and JSON-LD tags.

- [ ] **Step 1: Write failing metadata tests**

Create `tests/unit/seo.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildArticleJsonLd } from '../../src/seo/jsonLd';
import { buildArticleMetadata } from '../../src/seo/metadata';
import { validArticleData } from '../fixtures/article';

const site = new URL('https://carecadas.test');

describe('article SEO', () => {
  it('builds absolute canonical and image URLs', () => {
    const metadata = buildArticleMetadata({
      article: validArticleData,
      site,
      alternates: [{ locale: 'en', slug: 'welcome-to-carecadas' }],
    });

    expect(metadata.canonical).toBe(
      'https://carecadas.test/estudos/bem-vindo-ao-carecadas/',
    );
    expect(metadata.image).toBe('https://carecadas.test/logo-serriquinho.png');
    expect(metadata.alternates).toEqual([
      {
        locale: 'en',
        href: 'https://carecadas.test/en/research/welcome-to-carecadas/',
      },
    ]);
  });

  it('keeps JSON-LD consistent with visible article data', () => {
    const jsonLd = buildArticleJsonLd({
      article: validArticleData,
      site,
      author: { name: 'Carecão', url: '/autores/carecao/' },
    });

    expect(jsonLd['@type']).toBe('Article');
    expect(jsonLd.headline).toBe(validArticleData.title);
    expect(jsonLd.inLanguage).toBe('pt-PT');
    expect(jsonLd.author).toMatchObject({ '@type': 'Person', name: 'Carecão' });
  });
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```powershell
npm.cmd test -- tests/unit/seo.test.ts
```

Expected: FAIL because the SEO modules do not exist.

- [ ] **Step 3: Implement pure metadata builders**

Define `ArticleMetadata` in `src/seo/metadata.ts`:

```ts
export type ArticleMetadata = {
  title: string;
  description: string;
  canonical: string;
  image: string;
  imageAlt: string;
  locale: Locale;
  publishedAt: string;
  updatedAt?: string;
  alternates: ReadonlyArray<{ locale: Locale; href: string }>;
};
```

Implement `buildArticleMetadata()`:

```ts
import type { ArticleData } from '../domain/article';
import type { Locale } from '../domain/locale';
import { articlePath } from '../i18n/paths';

export type ArticleMetadata = {
  title: string;
  description: string;
  canonical: string;
  image: string;
  imageAlt: string;
  locale: Locale;
  publishedAt: string;
  updatedAt?: string;
  alternates: ReadonlyArray<{ locale: Locale; href: string }>;
};

type MetadataInput = {
  article: ArticleData;
  site: URL;
  alternates: ReadonlyArray<{ locale: Locale; slug: string }>;
};

export function buildArticleMetadata({
  article,
  site,
  alternates,
}: MetadataInput): ArticleMetadata {
  return {
    title: article.title,
    description: article.description,
    canonical: new URL(articlePath(article.locale, article.slug), site).href,
    image: new URL(article.heroImage, site).href,
    imageAlt: article.heroImageAlt,
    locale: article.locale,
    publishedAt: article.publishedAt.toISOString(),
    updatedAt: article.updatedAt?.toISOString(),
    alternates: alternates.map(({ locale, slug }) => ({
      locale,
      href: new URL(articlePath(locale, slug), site).href,
    })),
  };
}
```

Define and implement `buildArticleJsonLd()` in `src/seo/jsonLd.ts`:

```ts
import type { ArticleData } from '../domain/article';
import { articlePath } from '../i18n/paths';

type JsonLdInput = {
  article: ArticleData;
  site: URL;
  author: { name: string; url: string };
};

export function buildArticleJsonLd({ article, site, author }: JsonLdInput) {
  const canonical = new URL(articlePath(article.locale, article.slug), site).href;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: new URL(article.heroImage, site).href,
    datePublished: article.publishedAt.toISOString(),
    dateModified: (article.updatedAt ?? article.publishedAt).toISOString(),
    inLanguage: article.locale,
    mainEntityOfPage: canonical,
    author: {
      '@type': 'Person',
      name: author.name,
      url: new URL(author.url, site).href,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Carecadas',
      url: site.origin,
    },
  } as const;
}
```

Create `SeoHead.astro`. Serialize JSON-LD with `JSON.stringify()` into a
`<script type="application/ld+json" set:html={serializedJsonLd} />`. Emit
`og:type=article`, Open Graph article dates, `twitter:card=summary_large_image`,
and `<meta name="robots" content="index,follow,max-image-preview:large" />`.

- [ ] **Step 4: Verify and commit**

Run:

```powershell
npm.cmd test -- tests/unit/seo.test.ts
npm.cmd run check
```

Expected: metadata and JSON-LD tests pass.

```powershell
git add src/seo src/components/SeoHead.astro tests/unit/seo.test.ts
git commit -m "feat(seo): add article metadata contract"
```

---

### Task 5: Build the editorial UI and static routes

**Files:**

- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/layouts/ArticleLayout.astro`
- Create: `src/components/ArticleCard.astro`
- Create: `src/data/legacyStudies.ts`
- Modify: `src/pages/index.astro`
- Create: `src/pages/estudos/[slug].astro`
- Create: `src/pages/autores/[slug].astro`
- Create: `src/pages/categorias/[slug].astro`
- Create: `src/pages/404.astro`
- Create: `tests/integration/pages.test.ts`

**Interfaces:**

- `BaseLayout.astro` consumes page-level metadata and locale.
- `ArticleLayout.astro` consumes an article entry, author, alternatives, and
  rendered MDX content.
- `legacyStudies` is a read-only catalogue used by the home; legacy HTML
  remains the source of its own body.

- [ ] **Step 1: Write a failing page-generation test**

Create `tests/integration/pages.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import ArticleCard from '../../src/components/ArticleCard.astro';
import BaseLayout from '../../src/layouts/BaseLayout.astro';

describe('editorial components', () => {
  it('renders a semantic legacy study card', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCard, {
      props: {
        title: 'BTC · Análise de Ciclos',
        description: 'Leitura dos ciclos históricos da Bitcoin.',
        href: '/estudos/btc_ciclos.html',
        topic: 'Bitcoin',
      },
    });

    expect(html).toContain('href="/estudos/btc_ciclos.html"');
    expect(html).toContain('BTC · Análise de Ciclos');
    expect(html).toContain('<article');
  });

  it('renders the pt-PT document shell and skip link', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BaseLayout, {
      props: {
        locale: 'pt-PT',
        title: 'Carecadas',
        description: 'Estudos independentes sobre mercados e tecnologia.',
      },
      slots: { default: '<h1>Carecadas</h1>' },
    });

    expect(html).toContain('<html lang="pt-PT"');
    expect(html).toContain('<meta name="viewport"');
    expect(html).toContain('Saltar para o conteúdo');
  });
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```powershell
npm.cmd test -- tests/integration/pages.test.ts
```

Expected: FAIL because the components and layouts do not exist.

- [ ] **Step 3: Add the legacy catalogue**

Create `src/data/legacyStudies.ts`:

```ts
export type LegacyStudy = {
  title: string;
  description: string;
  href: `/estudos/${string}.html`;
  topic: string;
};

export const legacyStudies = [
  {
    title: 'BTC · Análise de Ciclos',
    description: 'Leitura dos ciclos históricos, correções e cenários da Bitcoin.',
    href: '/estudos/btc_ciclos.html',
    topic: 'Bitcoin',
  },
  {
    title: 'TSMC 2Q26 — Série Carecão',
    description: 'Análise dos resultados e margens da TSMC no segundo trimestre.',
    href: '/estudos/tsmc-2q26-carecao.html',
    topic: 'Semicondutores',
  },
  {
    title: 'A Minha Estratégia · Tese de Investimento',
    description: 'Princípios usados para procurar qualidade a preços atrativos.',
    href: '/estudos/estrategia-investimento-carecao.html',
    topic: 'Estratégia',
  },
  {
    title: 'Crash 2026: Probabilidade, Ciclos e Cenários',
    description: 'Estudo de cenários e sinais associados a uma correção de mercado.',
    href: '/estudos/CaseStudy_Market_Crash_2026.html',
    topic: 'Mercados',
  },
  {
    title: 'Grandes Investidores, Grandes Pumps',
    description: 'Análise de investidores, filings e comportamento posterior dos ativos.',
    href: '/estudos/estudo-investidores-completo.html',
    topic: 'Investidores',
  },
  {
    title: 'O TSMC da Biologia',
    description: 'Mapa de nichos, dependências e vantagens competitivas em biologia.',
    href: '/estudos/biologia_tsmc_nichos.html',
    topic: 'Biologia',
  },
  {
    title: 'Cibersegurança · Mapa de Nichos',
    description: 'Mapa do ecossistema e dos nichos de cibersegurança.',
    href: '/estudos/ciberseguranca_nichos.html',
    topic: 'Cibersegurança',
  },
  {
    title: 'Energia · Mapa de Nichos',
    description: 'Mapa de dependências e oportunidades no setor energético.',
    href: '/estudos/energia_nichos.html',
    topic: 'Energia',
  },
  {
    title: 'Meta 2Q26 — Análise de Resultados',
    description: 'Leitura dos resultados da Meta e do impacto do investimento em IA.',
    href: '/estudos/meta-2q26.html',
    topic: 'Empresas',
  },
  {
    title: 'Quantum Computing · Mapa de Nichos',
    description: 'Mapa das camadas e oportunidades na computação quântica.',
    href: '/estudos/quantum_computing_nichos.html',
    topic: 'Computação quântica',
  },
  {
    title: 'Robótica Física · Mapa de Nichos',
    description: 'Análise das dependências e dos nichos da robótica física.',
    href: '/estudos/robotica_fisica_nichos.html',
    topic: 'Robótica',
  },
  {
    title: 'TSMC · Mapa de Dependências',
    description: 'Mapa do ecossistema, dependências e posição competitiva da TSMC.',
    href: '/estudos/tsmc_nichos.html',
    topic: 'Semicondutores',
  },
] as const satisfies readonly LegacyStudy[];
```

- [ ] **Step 4: Implement layouts and visual tokens**

Create `src/styles/global.css`:

```css
:root {
  color-scheme: dark;
  --bg: #0f1117;
  --surface: #181a20;
  --card: #1e2029;
  --border: rgb(255 255 255 / 8%);
  --text: #e8eaed;
  --muted: #9ca6b6;
  --accent: #4ade80;
  --content: 72rem;
  --reading: 46rem;
}
* { box-sizing: border-box; }
html { background: var(--bg); color: var(--text); font-family: system-ui, sans-serif; }
body { margin: 0; line-height: 1.6; }
a { color: inherit; }
a:focus-visible, button:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
img { display: block; height: auto; max-width: 100%; }
.container { margin-inline: auto; max-width: var(--content); padding: 1.25rem; }
.reading { margin-inline: auto; max-width: var(--reading); }
.skip-link { background: var(--accent); color: #07110a; left: 1rem; padding: .75rem 1rem; position: fixed; top: -5rem; z-index: 10; }
.skip-link:focus { top: 1rem; }
.site-header, .site-footer { border-block: 1px solid var(--border); }
.card-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); }
.article-card { background: var(--card); border: 1px solid var(--border); border-radius: 1rem; padding: 1.25rem; }
.article-card h2 { font-size: clamp(1.1rem, 2vw, 1.35rem); }
.eyebrow, .metadata { color: var(--muted); font-size: .875rem; }
.prose h1 { font-size: clamp(2rem, 6vw, 4rem); line-height: 1.05; }
.prose h2 { font-size: clamp(1.4rem, 4vw, 2rem); margin-top: 2.5rem; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; }
}
```

Create `src/components/ArticleCard.astro`:

```astro
---
type Props = {
  title: string;
  description: string;
  href: string;
  topic: string;
};
const { title, description, href, topic } = Astro.props;
---
<article class="article-card">
  <p class="eyebrow">{topic}</p>
  <h2><a href={href}>{title}</a></h2>
  <p>{description}</p>
</article>
```

Create `src/layouts/BaseLayout.astro`:

```astro
---
import type { Locale } from '../domain/locale';
import '../styles/global.css';
type Props = { locale: Locale; title: string; description: string; noindex?: boolean };
const { locale, title, description, noindex = false } = Astro.props;
---
<!doctype html>
<html lang={locale}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
    <meta name="description" content={description} />
    {noindex && <meta name="robots" content="noindex,follow" />}
  </head>
  <body>
    <a class="skip-link" href="#conteudo">Saltar para o conteúdo</a>
    <header class="site-header"><nav class="container" aria-label="Principal"><a href="/">Carecadas</a></nav></header>
    <main id="conteudo" class="container"><slot /></main>
    <footer class="site-footer"><div class="container">Carecadas</div></footer>
  </body>
</html>
```

Create `src/layouts/ArticleLayout.astro` with props
`article: ArticleData`, `author: { name: string; url: string }`,
`metadata: ArticleMetadata`, `jsonLd: ReturnType<typeof buildArticleJsonLd>`,
and `alternatives: LanguageAlternative[]`. Render `SeoHead` through a named
`head` slot on `BaseLayout`; extend `BaseLayout` with `<slot name="head" />`
inside `<head>`. Render one `<article class="reading prose">`, one `h1`,
byline, ISO `<time>` elements, hero image, default MDX slot, and sources list.

- [ ] **Step 5: Implement static routes**

Update `src/pages/index.astro`:

```astro
---
import ArticleCard from '../components/ArticleCard.astro';
import { articlePath } from '../i18n/paths';
import BaseLayout from '../layouts/BaseLayout.astro';
import { legacyStudies } from '../data/legacyStudies';
import { listPublishedArticles } from '../repositories/contentRepository';
const articles = await listPublishedArticles({ locale: 'pt-PT' });
---
<BaseLayout
  locale="pt-PT"
  title="Carecadas · Estudos independentes"
  description="Estudos independentes sobre mercados, empresas e tecnologia."
>
  <section>
    <img src="/chibi.png" width="180" height="180" alt="" />
    <h1>Estudos do Carecão</h1>
    <p>Investigação independente, fontes explícitas e contexto para pensar melhor.</p>
  </section>
  <section aria-labelledby="novos">
    <h2 id="novos">Publicações na nova plataforma</h2>
    <div class="card-grid">
      {articles.map(({ data }) => (
        <ArticleCard
          title={data.title}
          description={data.description}
          href={articlePath(data.locale, data.slug)}
          topic={data.categories[0]}
        />
      ))}
    </div>
  </section>
  <section aria-labelledby="arquivo">
    <h2 id="arquivo">Arquivo de estudos</h2>
    <div class="card-grid">
      {legacyStudies.map((study) => <ArticleCard {...study} />)}
    </div>
  </section>
</BaseLayout>
```

Implement `src/pages/estudos/[slug].astro`:

```astro
---
import { render } from 'astro:content';
import ArticleLayout from '../../layouts/ArticleLayout.astro';
import {
  findPublishedTranslation,
  getAuthor,
  listPublishedArticles,
} from '../../repositories/contentRepository';
import { buildArticleJsonLd } from '../../seo/jsonLd';
import { buildArticleMetadata } from '../../seo/metadata';

export async function getStaticPaths() {
  const articles = await listPublishedArticles({ locale: 'pt-PT' });
  return articles.map((article) => ({
    params: { slug: article.data.slug },
    props: { article },
  }));
}

const { article } = Astro.props;
const author = await getAuthor({
  locale: article.data.locale,
  slug: article.data.authors[0],
});
if (!author) throw new Error(`Missing author: ${article.data.authors[0]}`);
const english = await findPublishedTranslation({
  translationKey: article.data.translationKey,
  locale: 'en',
});
const alternates = english ? [{ locale: 'en' as const, slug: english.data.slug }] : [];
const site = Astro.site ?? new URL('http://localhost:4321');
const metadata = buildArticleMetadata({ article: article.data, site, alternates });
const jsonLd = buildArticleJsonLd({
  article: article.data,
  site,
  author: { name: author.data.name, url: `/autores/${author.data.slug}/` },
});
const { Content } = await render(article);
---
<ArticleLayout
  article={article.data}
  author={{ name: author.data.name, url: `/autores/${author.data.slug}/` }}
  metadata={metadata}
  jsonLd={jsonLd}
  alternatives={metadata.alternates}
>
  <Content />
</ArticleLayout>
```

Create `src/pages/autores/[slug].astro`:

```astro
---
import ArticleCard from '../../components/ArticleCard.astro';
import { articlePath } from '../../i18n/paths';
import BaseLayout from '../../layouts/BaseLayout.astro';
import {
  listAuthors,
  listPublishedArticles,
} from '../../repositories/contentRepository';

export async function getStaticPaths() {
  const authors = await listAuthors('pt-PT');
  return authors.map((author) => ({
    params: { slug: author.data.slug },
    props: { author },
  }));
}
const { author } = Astro.props;
const articles = (await listPublishedArticles({ locale: 'pt-PT' })).filter(
  ({ data }) => data.authors.includes(author.data.slug),
);
---
<BaseLayout
  locale="pt-PT"
  title={`${author.data.name} · Carecadas`}
  description={author.data.bio}
>
  <h1>{author.data.name}</h1>
  <p>{author.data.bio}</p>
  <div class="card-grid">
    {articles.map(({ data }) => (
      <ArticleCard
        title={data.title}
        description={data.description}
        href={articlePath(data.locale, data.slug)}
        topic={data.categories[0]}
      />
    ))}
  </div>
</BaseLayout>
```

Create `src/pages/categorias/[slug].astro`:

```astro
---
import ArticleCard from '../../components/ArticleCard.astro';
import { articlePath } from '../../i18n/paths';
import BaseLayout from '../../layouts/BaseLayout.astro';
import {
  listCategories,
  listPublishedArticles,
} from '../../repositories/contentRepository';

export async function getStaticPaths() {
  const categories = await listCategories('pt-PT');
  return categories.map((category) => ({
    params: { slug: category.data.slug },
    props: { category },
  }));
}
const { category } = Astro.props;
const articles = (await listPublishedArticles({ locale: 'pt-PT' })).filter(
  ({ data }) => data.categories.includes(category.data.slug),
);
---
<BaseLayout
  locale="pt-PT"
  title={`${category.data.name} · Carecadas`}
  description={category.data.description}
>
  <h1>{category.data.name}</h1>
  <p>{category.data.description}</p>
  <div class="card-grid">
    {articles.map(({ data }) => (
      <ArticleCard
        title={data.title}
        description={data.description}
        href={articlePath(data.locale, data.slug)}
        topic={category.data.name}
      />
    ))}
  </div>
</BaseLayout>
```

Implement `404.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout
  locale="pt-PT"
  title="Página não encontrada · Carecadas"
  description="A página pedida não existe."
  noindex
>
  <h1>Página não encontrada</h1>
  <p><a href="/">Voltar aos estudos</a></p>
</BaseLayout>
```

- [ ] **Step 6: Verify static output and legacy bytes**

Verify that the branch has not changed any legacy source bytes:

```powershell
git diff --exit-code origin/main -- public/estudos public/watchlists.html
```

Run:

```powershell
npm.cmd test -- tests/integration/pages.test.ts
npm.cmd run check
npm.cmd run build
```

Run the same `git diff --exit-code` command again after the build. Expected:

- Git reports no legacy source changes;
- `dist/estudos/bem-vindo-ao-carecadas/index.html` exists;
- all legacy `.html` files still exist in `dist/estudos/`;
- generated article HTML contains canonical, JSON-LD, author, and one `h1`.

- [ ] **Step 7: Commit**

```powershell
git add src/components src/data src/layouts src/pages src/styles tests/integration/pages.test.ts
git commit -m "feat(web): add editorial pages"
```

---

### Task 6: Generate discovery files and deploy notifications

**Files:**

- Create: `src/pages/feed.xml.ts`
- Create: `public/robots.txt`
- Create: `public/_headers`
- Create: `scripts/notify-indexnow.mjs`
- Create: `scripts/validate-production-env.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `tests/integration/discovery.test.ts`

**Interfaces:**

- `GET /feed.xml` returns a pt-PT RSS feed containing only published articles.
- `robots.txt` advertises the production sitemap and crawler policy.
- `notify-indexnow.mjs` consumes `SITE_URL`, `INDEXNOW_KEY`, and a newline
  separated list of changed public URLs.
- `validate-production-env.mjs` rejects a production build without an HTTPS
  `SITE_URL`.

- [ ] **Step 1: Write failing discovery tests**

Create `tests/integration/discovery.test.ts` that imports the `GET` handler
from `src/pages/feed.xml.ts` and asserts:

```ts
expect(response.headers.get('content-type')).toContain('application/xml');
expect(xml).toContain('<language>pt-PT</language>');
expect(xml).toContain('Bem-vindo ao Carecadas');
expect(xml).not.toContain('status: draft');
```

Also read `public/robots.txt` and assert it contains:

```text
User-agent: OAI-SearchBot
Allow: /
User-agent: GPTBot
Disallow: /
Sitemap:
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```powershell
npm.cmd test -- tests/integration/discovery.test.ts
```

Expected: FAIL because the feed and robots file do not exist.

- [ ] **Step 3: Implement RSS and crawler policy**

Implement `src/pages/feed.xml.ts`:

```ts
import rss from '@astrojs/rss';
import { articlePath } from '../i18n/paths';
import { listPublishedArticles } from '../repositories/contentRepository';

export async function GET(context: { site?: URL }) {
  const articles = await listPublishedArticles({ locale: 'pt-PT' });
  return rss({
    title: 'Carecadas',
    description: 'Estudos independentes sobre mercados, empresas e tecnologia.',
    site: context.site ?? new URL('http://localhost:4321'),
    customData: '<language>pt-PT</language>',
    items: articles.map(({ data }) => ({
      title: data.title,
      description: data.description,
      pubDate: data.publishedAt,
      link: articlePath(data.locale, data.slug),
    })),
  });
}
```

Create `public/robots.txt`:

```text
User-agent: *
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Disallow: /

Sitemap: https://carecadas.invalid/sitemap-index.xml
```

The `.invalid` origin makes accidental deployment visible. Add a production
build step that replaces it from `SITE_URL` and fails if the final file still
contains `.invalid`.

Create `public/_headers` with:

```text
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

- [ ] **Step 4: Implement production validation and IndexNow**

Create `scripts/validate-production-env.mjs`:

```js
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const rawSiteUrl = process.env.SITE_URL;
if (!rawSiteUrl) throw new Error('SITE_URL is required for production builds');
const site = new URL(rawSiteUrl);
if (site.protocol !== 'https:') throw new Error('SITE_URL must use HTTPS');
if (!existsSync('dist/sitemap-index.xml')) {
  throw new Error('dist/sitemap-index.xml was not generated');
}
const robotsPath = 'dist/robots.txt';
const robots = readFileSync(robotsPath, 'utf8').replaceAll(
  'https://carecadas.invalid',
  site.origin,
);
if (robots.includes('.invalid')) {
  throw new Error('robots.txt still contains a non-production origin');
}
writeFileSync(robotsPath, robots);
const indexNowKey = process.env.INDEXNOW_KEY;
if (indexNowKey) {
  if (!/^[A-Za-z0-9-]{8,128}$/.test(indexNowKey)) {
    throw new Error('INDEXNOW_KEY has an invalid format');
  }
  writeFileSync(`dist/${indexNowKey}.txt`, indexNowKey);
}
```

Create `scripts/notify-indexnow.mjs`:

```js
const key = process.env.INDEXNOW_KEY;
if (!key) {
  console.log('IndexNow skipped: INDEXNOW_KEY is not configured');
  process.exit(0);
}
const rawSiteUrl = process.env.SITE_URL;
if (!rawSiteUrl) throw new Error('SITE_URL is required for IndexNow');
const site = new URL(rawSiteUrl);
if (site.protocol !== 'https:') throw new Error('SITE_URL must use HTTPS');
const urlList = (process.env.INDEXNOW_URLS ?? '')
  .split(/\r?\n/)
  .map((value) => value.trim())
  .filter(Boolean)
  .slice(0, 10_000)
  .map((value) => new URL(value, site).href);
if (urlList.length === 0) {
  console.log('IndexNow skipped: no changed public URLs');
  process.exit(0);
}
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: site.host,
    key,
    keyLocation: new URL(`/${key}.txt`, site).href,
    urlList,
  }),
});
if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow returned HTTP ${response.status}`);
}
console.log(`IndexNow accepted ${urlList.length} URL(s)`);
```

Add scripts:

```json
{
  "build:production": "astro build && node scripts/validate-production-env.mjs",
  "notify:indexnow": "node scripts/notify-indexnow.mjs"
}
```

- [ ] **Step 5: Verify and commit**

Run:

```powershell
npm.cmd test -- tests/integration/discovery.test.ts
$env:SITE_URL='https://carecadas.test'; npm.cmd run build:production
Remove-Item Env:SITE_URL
```

Expected: tests pass; production validation passes with HTTPS. Then run:

```powershell
npm.cmd run build:production
```

Expected: FAIL because `SITE_URL` is absent. This verifies the deployment
guard.

```powershell
git add src/pages/feed.xml.ts public/robots.txt public/_headers scripts package.json package-lock.json tests/integration/discovery.test.ts
git commit -m "feat(discovery): add feeds and crawler policy"
```

---

### Task 7: Add browser, accessibility, Lighthouse, and CI gates

**Files:**

- Create: `tests/e2e/foundation.spec.ts`
- Create: `lighthouse.config.cjs`
- Create: `.github/workflows/ci.yml`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**

- `npm run test:e2e` builds first when called by `qa`, starts one preview
  server, and runs one Chromium worker.
- CI runs the same commands as local development.

- [ ] **Step 1: Write the failing browser tests**

Create `tests/e2e/foundation.spec.ts`:

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('home exposes new and legacy studies', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Carecadas/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('link', { name: /Bem-vindo ao Carecadas/ }),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/estudos/btc_ciclos.html"]'),
  ).toBeVisible();
});

test('new article is semantic and crawlable', async ({ page }) => {
  await page.goto('/estudos/bem-vindo-ao-carecadas/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/estudos\/bem-vindo-ao-carecadas\/$/,
  );
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  await expect(page.getByRole('article')).toBeVisible();
});

test('legacy study URL still works', async ({ page }) => {
  const response = await page.goto('/estudos/btc_ciclos.html');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/BTC/);
});

test('home has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter(({ impact }) =>
      ['serious', 'critical'].includes(impact ?? ''),
    ),
  ).toEqual([]);
});
```

- [ ] **Step 2: Run the tests to verify RED**

Run:

```powershell
npm.cmd run build
npm.cmd run test:e2e
```

Expected: at least one assertion fails until the final labels, landmarks, or
metadata from Task 5 are corrected. If everything passes immediately, mutate
the home link or article canonical locally, observe the targeted failure, then
restore it and continue.

- [ ] **Step 3: Fix only observed accessibility and contract failures**

Apply minimal fixes in the relevant component. Do not weaken role, metadata,
status, or axe assertions.

- [ ] **Step 4: Configure Lighthouse**

Create `lighthouse.config.cjs`:

```js
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['http://localhost/', 'http://localhost/estudos/bem-vindo-ao-carecadas/'],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

Add `"test:lighthouse": "lhci autorun --config=lighthouse.config.cjs"` and add
it to `qa` after E2E.

- [ ] **Step 5: Add CI**

Create `.github/workflows/ci.yml` with:

- trigger on pull requests and pushes to `codex/**`;
- `actions/checkout`;
- `actions/setup-node` with Node 24 and npm cache;
- `npm ci`;
- `npx playwright install --with-deps chromium`;
- `SITE_URL=https://carecadas.test npm run format:check`;
- `npm run lint`;
- `npm run check`;
- `npm test`;
- `SITE_URL=https://carecadas.test npm run build:production`;
- `npm run test:e2e`;
- `npm run test:lighthouse`.

Use PowerShell-compatible environment configuration through the workflow
`env:` block rather than inline shell assignment.

- [ ] **Step 6: Run the complete fresh gate**

Run sequentially:

```powershell
npm.cmd run format:check
npm.cmd run lint
npm.cmd run check
npm.cmd test
$env:SITE_URL='https://carecadas.test'; npm.cmd run build:production
npm.cmd run test:e2e
npm.cmd run test:lighthouse
Remove-Item Env:SITE_URL
```

Expected: every command exits 0. Playwright reports four passing tests with one
Chromium worker. Lighthouse meets all declared thresholds.

- [ ] **Step 7: Commit**

```powershell
git add tests/e2e/foundation.spec.ts lighthouse.config.cjs .github/workflows/ci.yml package.json package-lock.json
git commit -m "ci: enforce editorial quality gates"
```

---

### Task 8: Document publishing, migration, and zero-cost deployment

**Files:**

- Modify: `README.md`
- Create: `docs/runbooks/local-development.md`
- Create: `docs/runbooks/publish-article.md`
- Create: `docs/runbooks/migrate-legacy-study.md`
- Create: `docs/runbooks/cloudflare-pages.md`
- Create: `tests/unit/runbooks.test.ts`

**Interfaces:**

- A new contributor can run, write, preview, validate, and publish without
  reading implementation internals.
- The deployment runbook identifies every setting required in Cloudflare and
  distinguishes repository-complete from externally deployed.

- [ ] **Step 1: Write the failing runbook contract test**

Create `tests/unit/runbooks.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const requiredCommands = [
  'npm.cmd install',
  'npm.cmd run dev',
  'npm.cmd run qa',
] as const;

describe('operator documentation', () => {
  it('documents the complete local loop', () => {
    const guide = readFileSync('docs/runbooks/local-development.md', 'utf8');
    for (const command of requiredCommands) {
      expect(guide).toContain(command);
    }
    expect(guide).toContain('http://localhost:4321');
  });

  it('protects legacy URLs during migration', () => {
    const guide = readFileSync('docs/runbooks/migrate-legacy-study.md', 'utf8');
    expect(guide).toContain('SHA256');
    expect(guide).toContain('301');
    expect(guide).toContain('canonical');
    expect(guide).toContain('Search Console');
  });

  it('records the zero-cost Cloudflare settings', () => {
    const guide = readFileSync('docs/runbooks/cloudflare-pages.md', 'utf8');
    expect(guide).toContain('npm run build:production');
    expect(guide).toContain('dist');
    expect(guide).toContain('SITE_URL');
    expect(guide).toContain('EUR 0');
  });
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```powershell
npm.cmd test -- tests/unit/runbooks.test.ts
```

Expected: FAIL because the runbooks do not exist.

- [ ] **Step 3: Write exact operator runbooks**

`local-development.md` documents Node 24, installation, localhost, article
editing, all individual gates, `qa`, and how to stop the dev server.

`publish-article.md` documents every schema field, pt-PT and English path
examples, author-owned translations, drafts, future dates, preview review, and
the rule that sources must support visible claims.

`migrate-legacy-study.md` documents:

1. record SHA256 and screenshots;
2. create MDX without changing the legacy file;
3. reproduce interactive elements as isolated components;
4. compare content, links, visuals, accessibility, and metadata;
5. publish both routes temporarily with correct canonical policy;
6. add a Cloudflare-compatible 301 only after acceptance;
7. update internal links, sitemap, RSS, and IndexNow;
8. inspect the production URL and Search Console;
9. remove the old public file only in a later commit with rollback evidence.

`cloudflare-pages.md` documents:

- connect the GitHub repository;
- production branch selected by the owner;
- build command `npm run build:production`;
- output directory `dist`;
- Node version 24;
- `SITE_URL` with the final HTTPS origin;
- optional `INDEXNOW_KEY`;
- preview deployments;
- custom domain as optional;
- expected initial platform cost EUR 0 within current free-plan limits;
- smoke checks for `/`, the new article, one legacy study, sitemap, RSS, and
  robots;
- rollback procedure through Cloudflare deployment history.

Update `README.md` to describe Astro rather than Express/Railway and link all
four runbooks.

- [ ] **Step 4: Verify docs and full repository**

Run:

```powershell
npm.cmd test -- tests/unit/runbooks.test.ts
npm.cmd run format
npm.cmd run qa
git diff --check
```

Expected: runbook tests and the complete QA gate pass; formatting creates no
semantic content changes.

- [ ] **Step 5: Commit**

```powershell
git add README.md docs/runbooks tests/unit/runbooks.test.ts
git commit -m "docs: add editorial runbooks"
```

---

### Task 9: Final independent gate and branch publication

**Files:**

- Review only: all files changed by Tasks 1-8
- No implementation file should change unless a fresh gate reveals a real
  defect.

**Interfaces:**

- Produces a remote `codex/astro-foundation` branch at the exact locally
  verified commit.
- Does not merge, deploy, connect Cloudflare, or alter `main`.

- [ ] **Step 1: Review scope and legacy preservation**

Run:

```powershell
git status -sb
git log --oneline --decorate origin/main..HEAD
git diff --stat origin/main...HEAD
git diff --check origin/main...HEAD
```

Confirm that no root-level research file or legacy study changed accidentally.
Run:

```powershell
git diff --exit-code origin/main -- public/estudos public/watchlists.html
```

Expected: no output and exit 0, proving that the legacy public sources match
`origin/main`.

- [ ] **Step 2: Run the final fresh gate**

Run sequentially:

```powershell
npm.cmd ci
npx.cmd playwright install chromium
npm.cmd run format:check
npm.cmd run lint
npm.cmd run check
npm.cmd test
$env:SITE_URL='https://carecadas.test'; npm.cmd run build:production
npm.cmd run test:e2e
npm.cmd run test:lighthouse
Remove-Item Env:SITE_URL
```

Expected:

- install exits 0;
- format, lint, Astro check, unit/integration tests, and build exit 0;
- Playwright passes in one Chromium worker;
- Lighthouse satisfies all thresholds;
- legacy routes return HTTP 200;
- the worktree is clean.

- [ ] **Step 3: Stop on real failures**

If any gate fails, record the exact command and output, fix only an in-scope
defect through a new focused RED/GREEN commit, and rerun the entire Step 2.
Do not weaken assertions, thresholds, or schemas to obtain green.

- [ ] **Step 4: Push the verified branch**

Run:

```powershell
git push -u origin codex/astro-foundation
git ls-remote --heads origin codex/astro-foundation
git rev-parse HEAD
```

Expected: the remote hash from `git ls-remote` exactly equals local `HEAD`.
Do not merge or deploy from this step.

---

## Plan Completion Conditions

This plan is implemented only when all of the following are evidenced:

- Astro serves the site locally at `http://localhost:4321`.
- The production build is static and succeeds with an HTTPS `SITE_URL`.
- The new home and the seed MDX article use typed editorial architecture.
- Every pre-existing study URL and `watchlists.html` still returns HTTP 200.
- pt-PT routes, future English routes, metadata, JSON-LD, sitemap, RSS, and
  crawler policy are covered by automated tests.
- The complete local QA gate and CI definition are green.
- The worktree is clean.
- `codex/astro-foundation` exists remotely at the verified local commit.
- No merge, Cloudflare account mutation, production deployment, CMS, database,
  authentication, or paid service has been performed.
