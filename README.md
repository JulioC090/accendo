# Accendo

CLI e catálogo de templates configuráveis para iniciar novos projetos.

## Comandos

```bash
pnpm dev --help
pnpm dev list
pnpm dev create cli ./meu-cli
pnpm dev create handlebars-example ./meu-projeto
```

A CLI oferece `--help` e `--version`; os comandos e argumentos inválidos exibem uma mensagem de erro e encerram com código diferente de zero.

A CLI coleta os valores declarados no `template.json` do template e copia os arquivos para o destino. O campo opcional `renderer` escolhe o mecanismo de renderização: `simple` (padrão, compatível com manifests existentes) substitui `{{nomeDaVariavel}}`; `handlebars` oferece a sintaxe Handlebars, incluindo blocos como `{{#if ...}}`. Handlebars escapa valores HTML em conteúdo; nomes de arquivos não são escapados. Arquivos terminados em `.hbs` têm essa extensão removida na saída para ambos os renderers. O diretório de destino deve ainda não existir; dependências não são instaladas automaticamente.

## Templates

Os templates principais são mantidos no repositório GitHub [`JulioC090/accendo-templates`](https://github.com/JulioC090/accendo-templates), um por subdiretório no formato `accendo-<nome>-template`. Para `create`, use os aliases curtos `cli`, `electron` e `handlebars-example`; os IDs completos também continuam aceitos. A CLI baixa as fontes `gh:` usando `giget` e valida que o `id` do `template.json` corresponde ao ID canônico do catálogo. Este projeto também inclui um exemplo local em `examples/templates/accendo-handlebars-example-template`, disponível como `handlebars-example`; ele demonstra `{{#if}}` e gera `README.md` a partir de `README.md.hbs`. Os demais templates remotos dependem de seus diretórios estarem publicados no GitHub.

A configuração é declarativa e não executa código do template. Integração com Plop pode ser adicionada como backend explícito para templates que precisem executar lógica JavaScript; nesse caso, só use templates confiáveis.
