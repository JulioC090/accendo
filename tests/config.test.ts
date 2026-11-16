import { expect, test } from 'vitest';
import { loadManifest } from '../src/template/config.js';

const templatePath = new URL(
  '../templates/typescript-cli/template.json',
  import.meta.url,
);

test('loads the TypeScript CLI template manifest', async () => {
  const manifest = await loadManifest(templatePath.pathname);

  expect(manifest.id).toBe('typescript-cli');
  expect(manifest.prompts.map((prompt) => prompt.name)).toEqual([
    'projectName',
    'description',
    'binName',
  ]);
});
