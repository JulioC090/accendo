import { expect, test } from 'vitest';
import { templates } from '../src/catalog.js';

test('catalog entries point to the Accendo templates repository', () => {
  expect(templates).toEqual([
    {
      id: 'accendo-typescript-cli-template',
      source: 'gh:JulioC090/accendo-templates/accendo-typescript-cli-template',
    },
    {
      id: 'accendo-electron-react-app-template',
      source:
        'gh:JulioC090/accendo-templates/accendo-electron-react-app-template',
    },
  ]);
});
