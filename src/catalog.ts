import type { TemplateEntry } from './template/types.js';

export const templates: TemplateEntry[] = [
  { id: 'typescript-cli', source: 'templates/typescript-cli' },
  { id: 'electron-react-app', source: 'templates/electron-react-app' },
  // Example remote catalog entry: { id: 'external-starter', source: 'gh:org/repository/path' },
];
