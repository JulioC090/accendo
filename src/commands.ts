import { access, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { downloadTemplate } from 'giget';
import { findTemplateEntry, templates } from './catalog.js';
import { loadManifest } from './template/config.js';
import { collectAnswers } from './template/prompts.js';
import {
  cleanDestination,
  prepareDestination,
  renderTemplate,
} from './template/render.js';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

async function resolveTemplate(id: string, workDirectory: string) {
  const entry = findTemplateEntry(id);
  if (!entry) {
    throw new Error(
      `Unknown template "${id}". Run "accendo list" to see available templates.`,
    );
  }

  let directory: string;
  if (entry.source.startsWith('gh:') || entry.source.startsWith('https://')) {
    const result = await downloadTemplate(entry.source, {
      dir: path.join(workDirectory, 'template'),
      preferOffline: true,
      silent: true,
    });
    directory = result.dir;
  } else {
    directory = path.resolve(repositoryRoot, entry.source);
  }

  const manifest = await loadManifest(path.join(directory, 'template.json'));
  if (manifest.id !== entry.id) {
    throw new Error(
      `Template manifest id "${manifest.id}" does not match catalog id "${entry.id}".`,
    );
  }

  return { directory, manifest };
}

export async function listTemplates(): Promise<void> {
  for (const entry of templates) {
    const temporaryDirectory = await mkdtemp(
      path.join(os.tmpdir(), 'accendo-list-'),
    );
    try {
      const { manifest } = await resolveTemplate(entry.id, temporaryDirectory);
      console.log(`${manifest.id}\t${manifest.name}\t${manifest.description}`);
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  }
}

export async function createProject(
  templateId: string,
  destinationName: string,
): Promise<void> {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), 'accendo-create-'),
  );
  const destination = path.resolve(process.cwd(), destinationName);

  try {
    let exists = true;
    try {
      await access(destination);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        exists = false;
      } else {
        throw error;
      }
    }

    if (exists) {
      throw new Error(`Destination already exists: ${destination}`);
    }

    const { directory, manifest } = await resolveTemplate(
      templateId,
      temporaryDirectory,
    );
    const answers = await collectAnswers(manifest.prompts);
    await prepareDestination(destination);

    try {
      await renderTemplate(directory, destination, answers, manifest.renderer);
    } catch (error) {
      await cleanDestination(destination);
      throw error;
    }

    console.log(`Created ${manifest.name} at ${destination}`);
    console.log(
      'Install dependencies in the generated project when you are ready.',
    );
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}
