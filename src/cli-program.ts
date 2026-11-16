import { createRequire } from 'node:module';
import { Command } from 'commander';
import { createProject, listTemplates } from './commands.js';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json') as { version: string };

export interface CliActions {
  listTemplates: () => Promise<void>;
  createProject: (templateId: string, destinationName: string) => Promise<void>;
}

const defaultActions: CliActions = { listTemplates, createProject };

export function createCli(actions: CliActions = defaultActions): Command {
  const program = new Command();

  program
    .name('accendo')
    .description(
      'CLI and configurable template catalog for starting new projects.',
    )
    .version(packageJson.version);

  program
    .command('list')
    .description('List available templates')
    .action(actions.listTemplates);

  program
    .command('create <template> <directory>')
    .description('Create a project from a template')
    .action((template: string, directory: string) =>
      actions.createProject(template, directory),
    );

  return program;
}
