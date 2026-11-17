export type PromptDefinition = {
  name: string;
  type: 'input' | 'confirm';
  message: string;
  default?: string | boolean;
  required?: boolean;
  pattern?: string;
};

export type TemplateRenderer = 'simple' | 'handlebars';

export type TemplateManifest = {
  schemaVersion: 1;
  renderer?: TemplateRenderer;
  id: string;
  name: string;
  description: string;
  prompts: PromptDefinition[];
};

export type TemplateEntry = {
  id: string;
  source: string;
  aliases?: string[];
};

export type TemplateAnswers = Record<string, string | boolean>;
