import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, test } from 'vitest';
import { loadManifest } from '../src/template/config.js';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

async function writeManifest(renderer?: string): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'accendo-config-'));
  temporaryDirectories.push(directory);
  const manifestPath = path.join(directory, 'template.json');
  await writeFile(
    manifestPath,
    JSON.stringify({
      schemaVersion: 1,
      id: 'test',
      name: 'Test',
      description: 'Test template',
      ...(renderer === undefined ? {} : { renderer }),
      prompts: [],
    }),
  );
  return manifestPath;
}

const templatePath = new URL(
  '../templates/typescript-cli/template.json',
  import.meta.url,
);
const handlebarsTemplatePath = new URL(
  '../templates/handlebars-example/template.json',
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
  expect(manifest.renderer).toBeUndefined();
});

test('loads the Handlebars example manifest', async () => {
  const manifest = await loadManifest(handlebarsTemplatePath.pathname);

  expect(manifest.id).toBe('handlebars-example');
  expect(manifest.renderer).toBe('handlebars');
  expect(manifest.prompts.map((prompt) => prompt.name)).toEqual([
    'projectName',
    'includeGreeting',
  ]);
});

test.each(['simple', 'handlebars'] as const)(
  'loads the %s renderer',
  async (renderer) => {
    const manifest = await loadManifest(await writeManifest(renderer));
    expect(manifest.renderer).toBe(renderer);
  },
);

test('rejects an unsupported renderer', async () => {
  const manifestPath = await writeManifest('unknown');
  await expect(loadManifest(manifestPath)).rejects.toThrow(
    'Invalid template renderer "unknown"',
  );
});
