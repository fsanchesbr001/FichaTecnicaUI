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
| `Dockerfile` | Build com Node 22 Alpine, `npm ci` e build de producao; imagem final com `nginx:alpine`, `ca-certificates` e porta 80. |
| `.dockerignore` | Exclui dependencias locais, builds, caches e metadados do contexto Docker. |
| `nginx.conf.template` | Configura fallback SPA e proxy `/api/` para `${BACKEND_API_URL}/`. |
| `docker-compose.yml` | Usa a imagem do Docker Hub com `${FRONTEND_IMAGE_TAG:-latest}`, publica `${FRONTEND_PORT:-8081}:80` e reinicia o container `ficha-tecnica-ui` automaticamente. |
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
`https://ollivander.backend.fabriciosanches.com`. Nao copie o template diretamente para `conf.d`.

### Conectar o backend

O backend Spring Boot e remoto; nenhuma rede Docker externa e necessaria.
A API permanece publicada somente em `127.0.0.1:8080` no Droplet do backend.
O Nginx desse Droplet termina o HTTPS do dominio
`ollivander.backend.fabriciosanches.com` e encaminha para essa porta local.
Nao exponha a porta 8080 na Internet. Defina `BACKEND_API_URL` como
a origem HTTPS da API, sem caminho, credenciais ou barra final.
Essa variavel configura somente o proxy; a UI continua usando `/api`.

O proxy envia `Host $proxy_host`, e nao o hostname do frontend, para selecionar
o virtual host correto no backend. SNI e verificacao do certificado TLS estao
habilitados; o certificado precisa cobrir o dominio da API e ter uma cadeia
confiavel. Nao desabilite a verificacao para contornar erros de certificado.
`proxy_ssl_name $proxy_host` seleciona explicitamente o nome TLS; a profundidade
de verificacao e 2, usando `/etc/ssl/certs/ca-certificates.crt`. O proxy
preserva `Origin`, `Authorization`, `X-Real-IP`, `X-Forwarded-For` e
`X-Forwarded-Proto`.

### Iniciar o frontend com a imagem publicada

Crie um `.env` ao lado do `docker-compose.yml` (arquivo ignorado pelo Git):

```dotenv
DOCKERHUB_USERNAME=seu-usuario
BACKEND_API_URL=https://ollivander.backend.fabriciosanches.com
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
| `/api/auth/login` | `https://ollivander.backend.fabriciosanches.com/auth/login` |
| `/api/ficha-tecnica/usuarios` | `https://ollivander.backend.fabriciosanches.com/ficha-tecnica/usuarios` |
| `/api/api/imagens/arquivo.png` | `https://ollivander.backend.fabriciosanches.com/api/imagens/arquivo.png` |

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

O workflow `.github/workflows/ci-cd-frontend.yml` executa em push na `master` ou `main`
ou manualmente via `workflow_dispatch`. Crie o environment `production` e
configure nele os secrets de deploy abaixo. `DOCKERHUB_USERNAME` e
`DOCKERHUB_TOKEN` precisam estar no repositorio para o job de build, que nao
usa esse environment; se tambem definidos em `production`, devem apontar
para a mesma conta/imagem. Os valores do environment prevalecem no deploy.

| Secret | Escopo | Valor |
| --- | --- | --- |
| `DOCKERHUB_USERNAME` | Repositorio; override opcional em `production` | Usuario do Docker Hub. |
| `DOCKERHUB_TOKEN` | Repositorio; override opcional em `production` | Token com permissao de leitura e escrita no repositorio da imagem. |
| `DROPLET_HOST` | `production` | `104.131.162.136` ou hostname do Droplet do frontend. |
| `DROPLET_USER` | `production` | Usuario SSH com permissao para Docker e escrita em `/opt/ficha-tecnica-ui`. |
| `DROPLET_SSH_KEY` | `production` | Chave privada SSH desse usuario. |
| `DROPLET_PORT` | `production` | Porta SSH, normalmente `22`. |
| `BACKEND_API_URL` | `production` | `https://ollivander.backend.fabriciosanches.com`, sem barra final. |

O job `build-and-push` instala com `npm ci`, compila a UI e publica
`<usuario>/ficha-tecnica-ui:latest` e `<usuario>/ficha-tecnica-ui:<SHA completo>`.
O job `deploy` aguarda o build, conecta via SSH, atualiza o Compose a partir
do mesmo commit e cria `.env` com permissao `600` em `/opt/ficha-tecnica-ui`.
O `FRONTEND_IMAGE_TAG` fica fixado no SHA completo desse commit, evitando
deploy de outra imagem que tenha sobrescrito `latest`.
Depois autentica no Docker Hub via stdin, executa `docker compose pull`,
`docker compose up -d --force-recreate`, verifica o Nginx e a resposta HTTP
200 do frontend, exige HTTP 200 com `"status":"UP"` em `/api/actuator/health` e remove imagens
sem tag com `docker image prune -f`. Um 200 somente na pagina inicial nao
comprova conectividade com a API. Respostas 502/503/504, outros codigos HTTP,
falha do curl ou ausencia de status UP fazem o job falhar.

### Ordem de implantacao e rollback

Antes do merge, cumpra esta ordem:

1. Prepare o backend conforme [FichaTecnica#86](https://github.com/fsanchesbr001/FichaTecnica/pull/86):
   API saudavel somente em `127.0.0.1:8080`, dados preservados e
   `SITE_ORIGIN_ALLOWED=https://ollivander.fabriciosanches.com` no ambiente efetivo.
2. Conclua DNS, certificados e migracao do Nginx compartilhado de
   [ContatosSite#31](https://github.com/fsanchesbr001/ContatosSite/pull/31),
   seguindo `deploy/README.shared-proxy.md`. A partir do Droplet do frontend,
   confirme HTTP 200 e status UP em
   `https://ollivander.backend.fabriciosanches.com/actuator/health`, sem `curl -k`.
3. Configure os secrets e a porta efetivos de `production` e registre a imagem
   atualmente executada com
   `docker inspect -f '{{.Config.Image}}' ficha-tecnica-ui`.
   Se ela ainda usar `latest`, identifique a tag SHA pelo ultimo deploy
   bem-sucedido nas Actions; nao use `latest` como referencia de rollback.
   Preserve uma copia do Compose e do `.env` antes de o workflow sobrescreve-los.
4. Somente entao faca o merge deste PR e valide o health pelo dominio do
   frontend e o login com usuario de teste.

O merge na `master` inicia deploy automaticamente; nao faca o merge antes
desses requisitos.

Depois, valide `https://ollivander.fabriciosanches.com/api/actuator/health`
e o login com um usuario de teste. Nenhuma URL absoluta precisa ser
introduzida no Angular.

Para rollback, suspenda novos deploys e use uma tag SHA anterior conhecida
como saudavel e compativel com o upstream HTTPS. Uma imagem que reproduza
o 502 nao e candidata a rollback.
No Droplet do frontend, como usuario autorizado (substitua o placeholder):

```bash
cd /opt/ficha-tecnica-ui || exit 1
export FRONTEND_IMAGE_TAG="<SHA completo do deploy anterior>"
docker compose pull frontend
```

Somente se o pull concluir com sucesso, persista a escolha e recrie a UI:

```bash
sed -i '/^FRONTEND_IMAGE_TAG=/d' .env
printf 'FRONTEND_IMAGE_TAG=%s\n' "$FRONTEND_IMAGE_TAG" >> .env
docker compose config --quiet
docker compose up -d --no-deps --force-recreate --pull never frontend
docker compose exec -T frontend nginx -t
curl -fsS http://127.0.0.1:8081/
curl -fsS http://127.0.0.1:8081/api/actuator/health
```

Interrompa se algum comando falhar, aguarde a UI estabilizar e confirme
HTTP 200/status UP tambem pelo dominio publico. Substitua 8081 se
`FRONTEND_PORT` tiver outro valor. Se o Compose ou o `.env` forem a causa,
restaure as copias revisadas, mantendo a tag SHA escolhida.
Se restaurar um Compose legado sem `FRONTEND_IMAGE_TAG`, ajuste seu campo
`image` explicitamente para `<usuario>/ficha-tecnica-ui:<SHA escolhido>`.
O proximo deploy sobrescreve o `.env`; corrija os secrets antes de retoma-lo.
Preserve o dominio HTTPS funcional da API; voltar ao IP publico na porta 8080 nao e
um rollback funcional quando essa porta esta restrita ao loopback.
O health-check detecta falhas, mas nao executa rollback automatico.

O deploy usa a porta 8081 no host por padrao para nao disputar a porta 80.
Opcionalmente, defina a variavel de Actions `FRONTEND_PORT` no repositorio ou
no environment `production` para outra porta livre (1 a 65535). Ajuste o
proxy de entrada e o firewall para a porta escolhida antes de disponibilizar
o frontend; a verificacao HTTP do deploy usa essa mesma porta.

O servidor precisa de Docker Engine, Compose v2, `base64`, `grep`, `curl`,
`mktemp` e `sed`.
O token nao e gravado no `.env`; o Docker pode armazenar credenciais no
perfil do usuario SSH, conforme seu credential helper. Nenhum secret e
interpolado diretamente no script remoto.

### Validacao local antes do merge

```bash
docker build -t ficha-tecnica-ui:pr48-local .
docker compose config
git diff --check
git status --short --branch
```

Com o checkout coordenado de `ContatosSite` ao lado deste repositorio,
execute tambem o teste isolado com certificados de fixture (nao usa
credenciais nem servidores reais):

```bash
python ../ContatosSite/deploy/tests/test_shared_proxy.py --frontend-template nginx.conf.template
```

Ele verifica Host/SNI, health, POST de login com query string, preservacao
de Origin/JWT, a rota de imagens com segundo `/api` e rejeicao de certificado
para hostname diferente. Nao substitui a validacao operacional nos Droplets.

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
