# Accendo

CLI e catálogo de templates configuráveis para iniciar novos projetos.

## Comandos

```bash
pnpm dev --help
pnpm dev list
pnpm dev create accendo-typescript-cli-template ./meu-cli
pnpm dev create accendo-handlebars-example-template ./meu-projeto
```

A CLI oferece `--help` e `--version`; os comandos e argumentos inválidos exibem uma mensagem de erro e encerram com código diferente de zero.

A CLI coleta os valores declarados no `template.json` do template e copia os arquivos para o destino. O campo opcional `renderer` escolhe o mecanismo de renderização: `simple` (padrão, compatível com manifests existentes) substitui `{{nomeDaVariavel}}`; `handlebars` oferece a sintaxe Handlebars, incluindo blocos como `{{#if ...}}`. Handlebars escapa valores HTML em conteúdo; nomes de arquivos não são escapados. Arquivos terminados em `.hbs` têm essa extensão removida na saída para ambos os renderers. O diretório de destino deve ainda não existir; dependências não são instaladas automaticamente.

## Templates

Os templates são mantidos exclusivamente no repositório GitHub [`JulioC090/accendo-templates`](https://github.com/JulioC090/accendo-templates), um por subdiretório no formato `accendo-<nome>-template`. Cada subdiretório deve conter um `template.json` na raiz, e o `id` do manifest deve coincidir com o ID do catálogo, por exemplo `accendo-typescript-cli-template`. A CLI baixa as fontes `gh:` usando `giget` e valida essa correspondência. Os templates não são incluídos localmente neste repositório; `list` e `create` dependem de os diretórios remotos estarem publicados.

A configuração é declarativa e não executa código do template. Integração com Plop pode ser adicionada como backend explícito para templates que precisem executar lógica JavaScript; nesse caso, só use templates confiáveis.
