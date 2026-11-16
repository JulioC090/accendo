# Accendo

CLI e catálogo de templates configuráveis para iniciar novos projetos.

## Comandos

```bash
pnpm dev list
pnpm dev create typescript-cli ./meu-cli
```

A CLI coleta os valores declarados no `template.json` do template, copia os arquivos para o destino e renderiza as expressões `{{nomeDaVariavel}}` em arquivos de texto. Arquivos terminados em `.hbs` também têm a extensão removida na saída. O diretório de destino deve ainda não existir; dependências não são instaladas automaticamente.

## Adicionar um template

1. Crie um diretório em `templates/` com um `template.json`.
2. Declare `schemaVersion`, `id`, `name`, `description` e `prompts` (`input` ou `confirm`).
3. Use os nomes declarados em `prompts` como variáveis nos arquivos de texto.
4. Adicione `{ id, source }` ao catálogo em `src/catalog.ts`.

A configuração é declarativa e não executa código do template. `giget` está incluído para baixar templates remotos: adicione uma origem `gh:owner/repo/path` em `src/catalog.ts` e disponibilize um `template.json` na raiz desse subdiretório. Integração com Plop pode ser adicionada como backend explícito para templates que precisem executar lógica JavaScript; nesse caso, só use templates confiáveis.
