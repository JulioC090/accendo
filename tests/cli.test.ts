import { expect, test, vi } from 'vitest';
import { createCli } from '../src/cli-program.js';

function makeCli() {
  const actions = {
    listTemplates: vi.fn(async () => undefined),
    createProject: vi.fn(async () => undefined),
  };
  const program = createCli(actions);
  const captureExit = (command: typeof program) => {
    command.exitOverride((error) => {
      throw error;
    });
    command.configureOutput({ writeOut: vi.fn(), writeErr: vi.fn() });
    command.commands.forEach(captureExit);
  };
  captureExit(program);
  return { actions, program };
}

test('shows built-in help for the CLI and its commands', async () => {
  const { program } = makeCli();

  await expect(
    program.parseAsync(['--help'], { from: 'user' }),
  ).rejects.toMatchObject({
    code: 'commander.helpDisplayed',
    exitCode: 0,
  });
  expect(program.helpInformation()).toContain('list');
  expect(program.helpInformation()).toContain('create <template> <directory>');
});

test('shows the package version', async () => {
  const { program } = makeCli();

  await expect(
    program.parseAsync(['--version'], { from: 'user' }),
  ).rejects.toMatchObject({
    code: 'commander.version',
    exitCode: 0,
  });
});

test('dispatches list and create to their actions', async () => {
  const { actions, program } = makeCli();

  await program.parseAsync(['list'], { from: 'user' });
  await program.parseAsync(['create', 'typescript-cli', './my-cli'], {
    from: 'user',
  });

  expect(actions.listTemplates).toHaveBeenCalledOnce();
  expect(actions.createProject).toHaveBeenCalledWith(
    'typescript-cli',
    './my-cli',
  );
});

test('rejects missing and extra command arguments', async () => {
  const missing = makeCli().program;
  await expect(
    missing.parseAsync(['create', 'typescript-cli'], { from: 'user' }),
  ).rejects.toMatchObject({
    code: 'commander.missingArgument',
  });

  const extra = makeCli().program;
  await expect(
    extra.parseAsync(['create', 'typescript-cli', './my-cli', 'extra'], {
      from: 'user',
    }),
  ).rejects.toMatchObject({
    code: 'commander.excessArguments',
  });
});

test('rejects unknown commands', async () => {
  const { program } = makeCli();

  await expect(
    program.parseAsync(['unknown'], { from: 'user' }),
  ).rejects.toMatchObject({
    code: 'commander.unknownCommand',
  });
});
