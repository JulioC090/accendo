import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, test } from 'vitest';
import { renderTemplate } from '../src/template/render.js';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

test('renders text files and names while preserving binary files', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'accendo-render-'));
  temporaryDirectories.push(root);
  const source = path.join(root, 'template');
  const destination = path.join(root, 'output');
  await mkdir(source);
  await writeFile(
    path.join(source, 'package.json'),
    '{"name":"{{projectName}}"}',
  );
  await writeFile(
    path.join(source, '{{projectName}}.txt.hbs'),
    'Hello {{projectName}}',
  );
  await writeFile(path.join(source, 'asset.bin'), Buffer.from([0, 255, 1]));

  await renderTemplate(source, destination, { projectName: 'sample-app' });

  expect(await readFile(path.join(destination, 'package.json'), 'utf8')).toBe(
    '{"name":"sample-app"}',
  );
  expect(await readFile(path.join(destination, 'sample-app.txt'), 'utf8')).toBe(
    'Hello sample-app',
  );
  expect(await readFile(path.join(destination, 'asset.bin'))).toEqual(
    Buffer.from([0, 255, 1]),
  );
});

test('rejects rendered paths that escape the output directory', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'accendo-path-'));
  temporaryDirectories.push(root);
  const source = path.join(root, 'template');
  const destination = path.join(root, 'output');
  await mkdir(source);
  await writeFile(path.join(source, '{{path}}.txt'), 'no');

  await expect(
    renderTemplate(source, destination, { path: '../outside' }),
  ).rejects.toThrow('Template path escapes destination');
});
