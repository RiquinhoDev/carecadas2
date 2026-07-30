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
