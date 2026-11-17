import type { TemplateEntry } from './template/types.js';

export const templates: TemplateEntry[] = [
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
];

export function findTemplateEntry(
  idOrAlias: string,
): TemplateEntry | undefined {
  return templates.find(
    (template) =>
      template.id === idOrAlias || template.aliases?.includes(idOrAlias),
  );
}
