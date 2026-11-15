# FichaTecnicaUI

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.10.

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

O `proxy.conf.json` encaminha `/api/**` para `http://localhost:8080`,
removendo o prefixo `/api`. Inicie a API Spring Boot na porta 8080 antes de
usar as funcionalidades que dependem dela.

## Deploy com Docker

| Arquivo | Responsabilidade |
| --- | --- |
| `Dockerfile` | Build com Node 22 Alpine, `npm ci` e build de producao; imagem final com `nginx:alpine` na porta 80. |
| `.dockerignore` | Exclui dependencias locais, builds, caches e metadados do contexto Docker. |
| `nginx.conf.template` | Configura fallback SPA e proxy `/api/` para `${BACKEND_API_URL}/`. |
| `docker-compose.yml` | Usa a imagem do Docker Hub, publica `${FRONTEND_PORT:-8081}:80` e reinicia o container `ficha-tecnica-ui` automaticamente. |
| `src/environments/environment.ts` e `environment.prod.ts` | Definem `apiUrl: '/api'`, sem hostname publico do backend. |
| `angular.json` | Usa o environment de producao no build e o proxy local no servidor de desenvolvimento. |

O Node 22 e compativel com o Angular 19 deste projeto. O build padrao ja usa
a configuracao `production`, com saida estatica em
`dist/ficha-tecnica-ui/browser`.
O `ng2-charts` utiliza a linha 8, compativel com Angular/CDK 19, para permitir
instalacao reproduzivel com `npm ci` sem ignorar dependencias pares.

O Dockerfile copia `nginx.conf.template` para
`/etc/nginx/templates/default.conf.template`. Na inicializacao, a imagem
oficial do Nginx executa `envsubst` para substituir somente
`${BACKEND_API_URL}` e gera `/etc/nginx/conf.d/default.conf`, preservando
variaveis Nginx como `$uri` e `$host`. O valor padrao e
`http://159.203.68.36:8080`. Nao copie o template diretamente para `conf.d`.

### Conectar o backend

O backend Spring Boot e remoto; nenhuma rede Docker externa e necessaria.
A API deve escutar em `0.0.0.0:8080`, e o firewall deve permitir acesso a
porta 8080 a partir do Droplet do frontend. Defina `BACKEND_API_URL` como
a origem HTTP(S) da API, sem caminho, credenciais ou barra final.
Essa variavel configura somente o proxy; a UI continua usando `/api`.

### Iniciar o frontend com a imagem publicada

Crie um `.env` ao lado do `docker-compose.yml` (arquivo ignorado pelo Git):

```dotenv
DOCKERHUB_USERNAME=seu-usuario
BACKEND_API_URL=http://159.203.68.36:8080
FRONTEND_PORT=8081
```

Com Docker Engine e Compose v2 instalados e a porta escolhida livre:

```powershell
docker login
docker compose pull
docker compose up -d --force-recreate
docker compose logs -f frontend
```

Acesse `http://localhost:8081` (ou a porta configurada). O Compose nao compila fontes locais. Para
construir uma imagem localmente, use `docker build -t ficha-tecnica-ui:local .`.
Se houver um container `ficha-tecnica-ui` criado anteriormente por
`docker run`, remova-o explicitamente antes da primeira execucao do Compose,
apos confirmar que ele e a instancia antiga que sera substituida.

### Rotas e autenticacao

O navegador utiliza apenas a origem do frontend:

| Requisicao do navegador | Destino interno |
| --- | --- |
| `/api/auth/login` | `http://159.203.68.36:8080/auth/login` |
| `/api/ficha-tecnica/usuarios` | `http://159.203.68.36:8080/ficha-tecnica/usuarios` |
| `/api/api/imagens/arquivo.png` | `http://159.203.68.36:8080/api/imagens/arquivo.png` |

A barra final em `proxy_pass ${BACKEND_API_URL}/;` remove somente o primeiro
prefixo `/api/`. O segundo `/api` na rota de imagens pertence ao endpoint
existente do backend. A regra `location ^~ /api/` impede que imagens e PDFs
da API sejam capturados pela regra de arquivos estaticos.

Os servicos e componentes HTTP usam `environment.apiUrl`. O interceptor
mantem o envio do JWT nas chamadas autenticadas e as excecoes de login e
recuperacao de senha. Os headers `Access-Control-Allow-*` foram removidos
do login: sao headers de resposta do servidor, nao de requisicao do cliente.
O proxy evita CORS ao manter a mesma origem para UI e API; nao substitui a
autenticacao/autorizacao do Spring Security.

Em producao publica, configure HTTPS no proxy de entrada ou balanceador que
encaminha trafego para a porta configurada no host (8081 por padrao). Configure
o proxy de entrada para encaminhar a essa porta; mudar a porta publicada nao
configura o proxy nem libera a porta 80 ocupada automaticamente.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


## CI/CD (GitHub Actions)

O workflow `.github/workflows/ci-cd-frontend.yml` executa em push na `main`
ou manualmente via `workflow_dispatch`. Configure os secrets do repositorio
ou do environment `production` (secrets usados no build precisam estar no
repositorio):

| Secret | Valor |
| --- | --- |
| `DOCKERHUB_USERNAME` | Usuario do Docker Hub. |
| `DOCKERHUB_TOKEN` | Token com permissao de leitura e escrita no repositorio da imagem. |
| `DROPLET_HOST` | `104.131.162.136` ou hostname do Droplet. |
| `DROPLET_USER` | Usuario SSH com permissao para Docker e escrita em `/opt/ficha-tecnica-ui`. |
| `DROPLET_SSH_KEY` | Chave privada SSH desse usuario. |
| `DROPLET_PORT` | Porta SSH, normalmente `22`. |
| `BACKEND_API_URL` | `http://159.203.68.36:8080` (obrigatorio no workflow). |

O job `build-and-push` instala com `npm ci`, compila a UI e publica
`<usuario>/ficha-tecnica-ui:latest` e `<usuario>/ficha-tecnica-ui:<SHA completo>`.
O job `deploy` aguarda o build, conecta via SSH, atualiza o Compose a partir
do mesmo commit e cria `.env` com permissao `600` em `/opt/ficha-tecnica-ui`.
Depois autentica no Docker Hub via stdin, executa `docker compose pull`,
`docker compose up -d --force-recreate`, verifica o Nginx e a resposta HTTP
do frontend e remove imagens sem tag com `docker image prune -f`.

O deploy usa a porta 8081 no host por padrao para nao disputar a porta 80.
Opcionalmente, defina a variavel de Actions `FRONTEND_PORT` no repositorio ou
no environment `production` para outra porta livre (1 a 65535). Ajuste o
proxy de entrada e o firewall para a porta escolhida antes de disponibilizar
o frontend; a verificacao HTTP do deploy usa essa mesma porta.

O servidor precisa de Docker Engine, Compose v2, `base64`, `grep` e `curl`.
O token nao e gravado no `.env`; o Docker pode armazenar credenciais no
perfil do usuario SSH, conforme seu credential helper. Nenhum secret e
interpolado diretamente no script remoto.

## Versioning History
- 1.0.0 - Versão Inicial - Página de ‘Login’.
- 1.0.1 - Página de Recuperar Senha.
- 1.0.2 - Página de Solicitar ‘Token’ e validações.
- 1.0.3 - Usando apenas endereço eletrónico na solicitação de senha.
- 1.0.4 - Não passando o endereço eletrónico para a página de troca de senha.
- 1.0.5 - Adicionado menu principal responsivo.
- 1.0.6 - Adicionado exibir e esconder submenus.
- 1.0.7 - Adicionado formulário de usuário.
- 1.0.8 - Adicionado @for e @if.
- 1.0.9 - Adicionado lista de Usuários.
- 1.0.10 - Ligando links e abrir formularios na seção principal.
- 1.0.11 - Adicionado componentes de Unidade de Medida.
- 1.0.12 - Adicionado componentes de Conversão.
- 1.0.13 - Chamando o Login no backend.
- 1.0.14 - Melhorias de layout e paginação e lista de itens.
- 1.0.15 - Adicionado informações de Usuário na tela.
- 1.0.16 - Melhorias de experiência do usuário no menu lateral.
- 1.0.17 - Tratamento de erros de login e mensagens de erro.
- 1.0.18 - Melhorando o tratamento de erros de Login.
- 1.0.19 - Adicionado chamada a lista de Usuarios.
- 1.0.20 - Fluxo de Usuário para criar, editar e excluir usuários.
- 1.0.21 - Submenu Sair funcionando e melhorias de layout.
- 1.0.22 - Adicionado componente de Relatórios e finalizando Usuário.
- 1.0.23 - Adicionado toast de sucesso e erro para as ações de usuário.
- 1.0.24 - Melhorias de cadastro de Usuarios e Primeiro Acesso.
- 1.0.25 - Adicionado fluxo completo de Usuario.
- 1.0.26 - Corrigindo validações de senha e codificando email na URL.
- 1.0.27 - Unidade de Medida e Conversao funcionando.
- 1.0.28 - Melhorias de layout e usabilidade no componente de Itens.
- 1.0.29 - Adicionado fluxo completo de HistoricoItens com gráfico.
- 1.0.30 - Melhorias no layout do gráfico e geração de PDF de detalhes de Itens no servidor.
- 1.0.31 - Adicionado Produto e Itens de Produto.
- 1.0.32 - Correção de layout e melhorias de usabilidade no componente de Itens Produto.
- 1.0.33 - Adicionado Grafico de Valores dos Itens.
- 1.0.34 - Melhorias no layout do gráfico e correção de erros de Itens.
- 1.0.35 - Adicionado Imagem em Produto.
- 1.0.36 - Melhorias no layout do formulário de Produto e exibição de imagem.
- 1.0.37 - Adicionado Guards e melhoria de formatação numérica.
- 1.0.38 - Corrigindo chamadas de relatorios de unidade de medida.
- 1.0.39 - Melhorias de layout e chamadas backend.
- 1.0.40 - Testes de Usuario e correção de rotas.
- 1.0.41 - Bloqueio de criação de usuário para Users.
- 1.0.42 - Corrigindo seleção de toogles.
- 1.0.43 - Correções da carga e exibição de imagens.
- 1.1.0 - Adicionado container e preparando para produção.
- 1.1.1 - Configurando para subida em container.
- 1.1.2 - Secrets do GitHub Actions.
