import { readFile } from 'node:fs/promises';
import type { PromptDefinition, TemplateManifest } from './types.js';

function isPromptDefinition(value: unknown): value is PromptDefinition {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const prompt = value as Partial<PromptDefinition>;
  return (
    typeof prompt.name === 'string' &&
    typeof prompt.message === 'string' &&
    (prompt.type === 'input' || prompt.type === 'confirm')
  );
}

export async function loadManifest(path: string): Promise<TemplateManifest> {
  const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid template manifest: ${path}`);
  }

  const manifest = parsed as Partial<TemplateManifest>;
  if (
    manifest.renderer !== undefined &&
    manifest.renderer !== 'simple' &&
    manifest.renderer !== 'handlebars'
  ) {
    throw new Error(
      `Invalid template renderer "${String(manifest.renderer)}": ${path}`,
    );
  }

  if (
    manifest.schemaVersion !== 1 ||
    typeof manifest.id !== 'string' ||
    typeof manifest.name !== 'string' ||
    typeof manifest.description !== 'string' ||
    !Array.isArray(manifest.prompts) ||
    !manifest.prompts.every(isPromptDefinition)
  ) {
    throw new Error(`Invalid template manifest: ${path}`);
  }

  return manifest as TemplateManifest;
}
