import {
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import Handlebars from 'handlebars';
import type { TemplateAnswers, TemplateRenderer } from './types.js';

const textExtensions = new Set([
  '.cjs',
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.svg',
  '.ts',
  '.tsx',
  '.txt',
  '.yaml',
  '.yml',
]);

const templateSuffix = '.hbs';

function renderSimple(template: string, answers: TemplateAnswers): string {
  return template.replace(/{{\s*([\w]+)\s*}}/g, (match, key: string) => {
    const value = answers[key];
    if (value === undefined) {
      throw new Error(`Missing template value: ${key}`);
    }

    return String(value);
  });
}

function renderText(
  template: string,
  answers: TemplateAnswers,
  renderer: TemplateRenderer,
  escape = true,
): string {
  if (renderer === 'simple') {
    return renderSimple(template, answers);
  }

  try {
    const compiled = Handlebars.compile(template, { noEscape: !escape });
    return compiled(answers);
  } catch (error) {
    throw new Error(`Failed to render Handlebars template: ${String(error)}`, {
      cause: error,
    });
  }
}

function renderPath(
  templatePath: string,
  answers: TemplateAnswers,
  renderer: TemplateRenderer,
): string {
  return renderText(templatePath, answers, renderer, false).replace(
    /\.hbs$/,
    '',
  );
}

function isWithin(parent: string, candidate: string): boolean {
  const relative = path.relative(parent, candidate);
  return (
    relative === '' ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== '..' &&
      !path.isAbsolute(relative))
  );
}

async function renderDirectory(
  source: string,
  destination: string,
  answers: TemplateAnswers,
  templateRoot: string,
  renderer: TemplateRenderer,
): Promise<void> {
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (source === templateRoot && entry.name === 'template.json') {
      continue;
    }

    const sourcePath = path.join(source, entry.name);
    const renderedName = renderPath(entry.name, answers, renderer);
    const destinationPath = path.resolve(destination, renderedName);

    if (!isWithin(destination, destinationPath)) {
      throw new Error(`Template path escapes destination: ${entry.name}`);
    }

    if (entry.isSymbolicLink()) {
      throw new Error(
        `Symbolic links are not supported in templates: ${sourcePath}`,
      );
    }

    if (entry.isDirectory()) {
      await mkdir(destinationPath, { recursive: true });
      await renderDirectory(
        sourcePath,
        destinationPath,
        answers,
        templateRoot,
        renderer,
      );
      continue;
    }

    await mkdir(path.dirname(destinationPath), { recursive: true });

    if (entry.name.endsWith(templateSuffix)) {
      const content = await readFile(sourcePath, 'utf8');
      await writeFile(destinationPath, renderText(content, answers, renderer));
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (textExtensions.has(extension) && !entry.name.startsWith('.')) {
      const content = await readFile(sourcePath, 'utf8');
      await writeFile(destinationPath, renderText(content, answers, renderer));
      continue;
    }

    await cp(sourcePath, destinationPath);
  }
}

export async function renderTemplate(
  templateDirectory: string,
  destination: string,
  answers: TemplateAnswers,
  renderer: TemplateRenderer = 'simple',
): Promise<void> {
  const templateRoot = path.resolve(templateDirectory);
  const outputDirectory = path.resolve(destination);
  const templateStats = await stat(templateRoot);

  if (!templateStats.isDirectory()) {
    throw new Error(`Template source is not a directory: ${templateRoot}`);
  }

  await mkdir(outputDirectory, { recursive: true });
  await renderDirectory(
    templateRoot,
    outputDirectory,
    answers,
    templateRoot,
    renderer,
  );
}

export async function prepareDestination(destination: string): Promise<void> {
  const outputDirectory = path.resolve(destination);
  try {
    await stat(outputDirectory);
    const entries = await readdir(outputDirectory);
    if (entries.length > 0) {
      throw new Error(`Destination is not empty: ${outputDirectory}`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await mkdir(outputDirectory, { recursive: true });
      return;
    }
    throw error;
  }
}

export async function cleanDestination(destination: string): Promise<void> {
  await rm(destination, { recursive: true, force: true });
}
