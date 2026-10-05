# CineMatch Web

Recomendação de séries em tempo real para a PlayNow.

O CineMatch JS rodava no terminal. Esta versão abre no navegador (também no celular): a pessoa preenche um perfil, o perfil fica salvo no próprio navegador e o motor de afinidade compara com um catálogo real da [TVMaze API](https://www.tvmaze.com/api).

**Autor:** Juan José Velasquez Cubero  
**Curso:** Desenvolvimento Mobile · React Native T1 · SCTEC  
**Projeto anterior:** [CineMatch JS](https://github.com/juanjosevelasquezcubero/CineMatch-JS-Onboarding-Interativo-de-Recomenda-o-de-Streaming)

## Abrir o site

O projeto já está publicado. Clique no link abaixo. Não precisa copiar o endereço.

**[Entrar no CineMatch](https://cinematch-web-iota.vercel.app)**

## Problema que resolve

Quem não abre um terminal não conseguia usar o protótipo. O CineMatch Web entrega o mesmo cálculo de compatibilidade numa página: formulário, cards e estados de carregando / vazio / erro.

## Como executar

Requisito: Node.js instalado.

```bash
git clone https://github.com/juanjosevelasquezcubero/CineMatch-Web.git
cd CineMatch-Web
npm install
npm start
```

O script `start` sobe o `live-server` (dependência de desenvolvimento, instalação **local** no projeto — não global). O navegador abre em `index.html`.

Não abra o arquivo pelo `file://`. Módulos ES (`import`/`export`) precisam de um servidor HTTP.

## Estrutura

```text
CineMatch-Web/
├── index.html    HTML semântico (RF01, RF02, RF13)
├── style.css     Flexbox e responsividade (RF09)
├── script.js     fluxo: form, localStorage, fetch, cálculo
├── ui.js         tela: cards, loading, erro, vazio
├── modelo.js     classes Conteudo e Serie + compatibilidade
├── package.json  npm + live-server (RF15)
├── KANBAN.md     quadro do projeto
└── README.md
```

```text
script.js  →  orquestra o fluxo
ui.js      →  só o que aparece na tela
modelo.js  →  regras e classes
```

## CommonJS vs ESM

No CineMatch JS (terminal) o código era **CommonJS**: `require('prompt-sync')` e, se houvesse exportação, `module.exports`. É o formato clássico do Node.

Aqui o projeto é **ESM** (ECMAScript Modules): `import { Serie } from './modelo.js'` e `export class Conteudo`. O HTML carrega com `<script type="module" src="script.js"></script>`. A extensão `.js` no import é obrigatória no navegador.

## `const` / `let` (e por que não `var`)

O código prioriza `const` para valores que não são reatribuídos (URL da API, chave do `localStorage`, funções exportadas) e `let` quando o valor muda (contador interno da closure, opção do menu de filtros, perfil atual).

`var` tem escopo de função e sofre hoisting. A closure `criarContadorDeRecomendacoes` depende de `let total = 0` preso no escopo do pai: cada clique em “Recalcular afinidade” incrementa esse `total` sem vazar para o restante do arquivo. Com `var` num laço de cards, o escopo vazaria e o comportamento ficaria difícil de prever.

Não há `!important` no layout. O único uso está em `prefers-reduced-motion`, para respeitar quem pediu menos animação — não para ganhar especificidade de cor ou Flexbox.

## Motor de afinidade (do projeto anterior)

```text
percentual = round((gêneros em comum / total de gêneros da série) × 100)
≥ 80  Alta afinidade
≥ 50  Média afinidade
< 50  Baixa afinidade
```

Os gêneros dos checkboxes usam o `value` em inglês da TVMaze (`Comedy`, `Science-Fiction`) e o rótulo em português, senão a comparação falha.

## Branches

| Branch | Papel |
| --- | --- |
| `main` | código estável da entrega |
| `develop` | integração |
| `feature/cinematch-web` | implementação da página (form, API, classes, cards, estilo) |

Fluxo: feature → `develop` → `main`.

## Kanban

Quadro do projeto: [KANBAN.md](./KANBAN.md)

Colunas: Backlog, A Fazer, Em Andamento, Concluído.

## Vídeo

Apresentação de até 7 minutos: objetivo e demonstração, como executar, Kanban, branches e o que melhoraria.

[Assistir no Google Drive](https://drive.google.com/file/d/1eL86BQkELS_hd5w17tN4tjSPCcPrCmzr/view?usp=drive_link)

## Melhorias possíveis

- Já publicado na Vercel. Clique em [Entrar no CineMatch](https://cinematch-web-iota.vercel.app).
- Buscar mais páginas da TVMaze (`?page=1`, `?page=2`)
- Combinar com uma API de filmes, como no mini-projeto original
- Geolocation para uma saudação contextual

## Licença

Uso educacional · SCTEC.
