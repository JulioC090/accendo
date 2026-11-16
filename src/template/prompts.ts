import { createInterface } from 'node:readline/promises';
import type { PromptDefinition, TemplateAnswers } from './types.js';

export async function collectAnswers(
  prompts: PromptDefinition[],
): Promise<TemplateAnswers> {
  const answers: TemplateAnswers = {};
  const terminal = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const lines = terminal[Symbol.asyncIterator]();

  try {
    for (const prompt of prompts) {
      const suffix = prompt.default === undefined ? '' : ` (${prompt.default})`;
      process.stdout.write(`${prompt.message}${suffix}: `);
      const { value = '' } = await lines.next();
      const answer = value.trim() || prompt.default;

      if (prompt.type === 'confirm') {
        answers[prompt.name] =
          typeof answer === 'boolean'
            ? answer
            : typeof answer === 'string' && /^(y|yes|true)$/i.test(answer);
        continue;
      }

      if (typeof answer !== 'string' || (prompt.required && !answer.trim())) {
        throw new Error(`${prompt.name} is required.`);
      }

      if (prompt.pattern && !new RegExp(prompt.pattern).test(answer)) {
        throw new Error(`Invalid value for ${prompt.name}: ${answer}`);
      }

      answers[prompt.name] = answer;
    }
  } finally {
    terminal.close();
  }

  return answers;
}
