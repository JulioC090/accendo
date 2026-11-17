import { expect, test } from 'vitest';
import { findTemplateEntry, templates } from '../src/catalog.js';

test('catalog entries point to the Accendo templates repository', () => {
  expect(templates).toEqual([
    {
      id: 'accendo-typescript-cli-template',
      aliases: ['cli'],
      source: 'gh:JulioC090/accendo-templates/accendo-typescript-cli-template',
    },
    {
      id: 'accendo-electron-react-app-template',
      aliases: ['electron'],
      source:
        'gh:JulioC090/accendo-templates/accendo-electron-react-app-template',
    },
    {
      id: 'accendo-handlebars-example-template',
      aliases: ['handlebars-example'],
      source: 'examples/templates/accendo-handlebars-example-template',
    },
  ]);
});

test.each([
  ['cli', 'accendo-typescript-cli-template'],
  ['electron', 'accendo-electron-react-app-template'],
  ['handlebars-example', 'accendo-handlebars-example-template'],
  ['accendo-typescript-cli-template', 'accendo-typescript-cli-template'],
])('resolves %s to the canonical template entry', (name, id) => {
  expect(findTemplateEntry(name)?.id).toBe(id);
});

test('returns undefined for unknown template names', () => {
  expect(findTemplateEntry('unknown')).toBeUndefined();
});
