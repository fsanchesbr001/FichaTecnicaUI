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
| `Dockerfile` | Build com Node 22 Alpine, `npm ci` e `npm run build`; imagem final com `nginx:alpine` na porta 80. |
| `.dockerignore` | Exclui dependencias locais, builds, caches e metadados do contexto Docker. |
| `nginx.conf` | Serve `dist/ficha-tecnica-ui/browser`, aplica fallback SPA e encaminha `/api/` para o backend. |
| `docker-compose.yml` | Publica `80:80` e conecta o frontend a rede externa `ficha_tecnica_network`. |
| `src/environments/environment.ts` e `environment.prod.ts` | Definem `apiUrl: '/api'`, sem hostname publico do backend. |
| `angular.json` | Usa o environment de producao no build e o proxy local no servidor de desenvolvimento. |

O Node 22 e compativel com o Angular 19 deste projeto. O build padrao ja usa
a configuracao `production`, com saida estatica em
`dist/ficha-tecnica-ui/browser`.
O `ng2-charts` utiliza a linha 8, compativel com Angular/CDK 19, para permitir
instalacao reproduzivel com `npm ci` sem ignorar dependencias pares.

### Conectar o backend

O Compose deste repositorio nao cria um backend ficticio: utiliza uma rede
externa para conectar a API existente. Crie a rede uma unica vez:

```powershell
docker network create ficha_tecnica_network
```

No Compose da API Spring Boot, conecte o servico a mesma rede e atribua o
alias `backend`:

```yaml
services:
  backend:
    # Mantenha aqui a imagem/build e as configuracoes existentes da API.
    networks:
      ficha_tecnica_network:
        aliases:
          - backend

networks:
  ficha_tecnica_network:
    external: true
    name: ficha_tecnica_network
```

Se a API ja estiver em um container sem Compose, conecte esse container:

```powershell
docker network connect --alias backend ficha_tecnica_network <container-da-api>
```

A API deve escutar em `0.0.0.0:8080` dentro do container. Nao e necessario
publicar a porta 8080 no host para a comunicacao com o frontend. Inicie o
backend antes do frontend, pois o Nginx resolve `backend` ao iniciar.
Uma API executada apenas no host nao sera encontrada por esse nome.

### Construir e iniciar o frontend

Com o Docker Engine ativo, a porta 80 livre e a API conectada a rede:

```powershell
docker compose up -d --build
```

Acesse `http://localhost`. Para acompanhar falhas de comunicacao com a API:

```powershell
docker compose logs -f frontend
```

### Rotas e autenticacao

O navegador utiliza apenas a origem do frontend:

| Requisicao do navegador | Destino interno |
| --- | --- |
| `/api/auth/login` | `http://backend:8080/auth/login` |
| `/api/ficha-tecnica/usuarios` | `http://backend:8080/ficha-tecnica/usuarios` |
| `/api/api/imagens/arquivo.png` | `http://backend:8080/api/imagens/arquivo.png` |

A barra final em `proxy_pass http://backend:8080/` remove somente o primeiro
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
encaminha trafego para a porta 80 deste container.

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
