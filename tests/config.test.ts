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
      id: 'accendo-test-template',
      name: 'Test',
      description: 'Test template',
      ...(renderer === undefined ? {} : { renderer }),
      prompts: [
        {
          name: 'projectName',
          type: 'input',
          message: 'Project name',
          required: true,
        },
      ],
    }),
  );
  return manifestPath;
}

test('loads a template manifest with its prompts and default renderer', async () => {
  const manifest = await loadManifest(await writeManifest());

  expect(manifest.id).toBe('accendo-test-template');
  expect(manifest.prompts.map((prompt) => prompt.name)).toEqual([
    'projectName',
  ]);
  expect(manifest.renderer).toBeUndefined();
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
