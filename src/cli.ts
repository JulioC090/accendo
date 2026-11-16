#!/usr/bin/env node

import { createProject, listTemplates } from './commands.js';

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  if (command === 'list') {
    await listTemplates();
    return;
  }

  if (command === 'create') {
    const [templateId, destinationName] = args;
    if (!templateId || !destinationName) {
      throw new Error('Usage: accendo create <template> <directory>');
    }

    await createProject(templateId, destinationName);
    return;
  }

  console.log('Usage: accendo <list | create <template> <directory>>');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
