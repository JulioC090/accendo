# Accendo

CLI e catálogo de templates configuráveis para iniciar novos projetos.

## Comandos

```bash
pnpm dev --help
pnpm dev list
pnpm dev create typescript-cli ./meu-cli
pnpm dev create handlebars-example ./meu-projeto
```

A CLI oferece `--help` e `--version`; os comandos e argumentos inválidos exibem uma mensagem de erro e encerram com código diferente de zero.

A CLI coleta os valores declarados no `template.json` do template e copia os arquivos para o destino. O campo opcional `renderer` escolhe o mecanismo de renderização: `simple` (padrão, compatível com manifests existentes) substitui `{{nomeDaVariavel}}`; `handlebars` oferece a sintaxe Handlebars, incluindo blocos como `{{#if ...}}`. Handlebars escapa valores HTML em conteúdo; nomes de arquivos não são escapados. Arquivos terminados em `.hbs` têm essa extensão removida na saída para ambos os renderers. O diretório de destino deve ainda não existir; dependências não são instaladas automaticamente.

## Adicionar um template

1. Crie um diretório em `templates/` com um `template.json`.
2. Declare `schemaVersion`, `id`, `name`, `description` e `prompts` (`input` ou `confirm`); opcionalmente, escolha `renderer: "simple"` ou `renderer: "handlebars"`.

O template `handlebars-example` é um exemplo executável: usa um prompt de confirmação para demonstrar `{{#if}}` e gera `README.md` a partir de `README.md.hbs`.
3. Use os nomes declarados em `prompts` como variáveis nos arquivos de texto.
4. Adicione `{ id, source }` ao catálogo em `src/catalog.ts`.

A configuração é declarativa e não executa código do template. `giget` está incluído para baixar templates remotos: adicione uma origem `gh:owner/repo/path` em `src/catalog.ts` e disponibilize um `template.json` na raiz desse subdiretório. Integração com Plop pode ser adicionada como backend explícito para templates que precisem executar lógica JavaScript; nesse caso, só use templates confiáveis.
