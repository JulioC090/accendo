#!/usr/bin/env node

import { createCli } from './cli-program.js';

createCli()
  .parseAsync(process.argv)
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
