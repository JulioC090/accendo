import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, test } from 'vitest';
import { renderTemplate } from '../src/template/render.js';
import { loadManifest } from '../src/template/config.js';

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

test.each([
  [true, 'Hello from the Handlebars example!'],
  [false, 'The greeting was disabled for this project.'],
])(
  'renders the Handlebars example when includeGreeting is %s',
  async (includeGreeting, expected) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'accendo-hbs-example-'));
    temporaryDirectories.push(root);
    const source = new URL(
      '../examples/templates/accendo-handlebars-example-template/',
      import.meta.url,
    ).pathname;
    const destination = path.join(root, 'output');
    const manifest = await loadManifest(path.join(source, 'template.json'));
    await renderTemplate(
      source,
      destination,
      { projectName: 'example-project', includeGreeting },
      manifest.renderer,
    );

    const output = await readFile(path.join(destination, 'README.md'), 'utf8');
    expect(output).toContain('# example-project');
    expect(output).toContain(expected);
    expect(output).not.toContain('{{#if');
  },
);

test('renders Handlebars templates, blocks, and unescaped file names', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'accendo-handlebars-'));
  temporaryDirectories.push(root);
  const source = path.join(root, 'template');
  const destination = path.join(root, 'output');
  await mkdir(source);
  await writeFile(
    path.join(source, '{{projectName}}.txt.hbs'),
    '{{#if enabled}}Hello {{projectName}}{{/if}}',
  );

  await renderTemplate(
    source,
    destination,
    {
      projectName: 'sample-app',
      enabled: true,
    },
    'handlebars',
  );

  expect(await readFile(path.join(destination, 'sample-app.txt'), 'utf8')).toBe(
    'Hello sample-app',
  );
});

test('rejects Handlebars paths that escape the output directory', async () => {
  const root = await mkdtemp(
    path.join(os.tmpdir(), 'accendo-handlebars-path-'),
  );
  temporaryDirectories.push(root);
  const source = path.join(root, 'template');
  const destination = path.join(root, 'output');
  await mkdir(source);
  await writeFile(path.join(source, '{{path}}.txt'), 'no');

  await expect(
    renderTemplate(source, destination, { path: '../outside' }, 'handlebars'),
  ).rejects.toThrow('Template path escapes destination');
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
