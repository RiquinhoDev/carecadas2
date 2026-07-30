import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['.astro/**', 'dist/**', 'node_modules/**', 'playwright-report/**'] },
  js.configs.recommended,
  tseslint.configs.recommended,
);
