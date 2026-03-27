# CRMLead Frontend

Base web reorganizada em TypeScript para preparar a evolucao para backend.

## Stack escolhida

- TypeScript (seguranca de tipos e menor risco de regressao)
- React + Vite (desenvolvimento rapido e build performatico)
- ESLint + tsconfig estrito (qualidade de codigo)

## Estrutura

```
src/
  app/         # bootstrap e estilos globais da aplicacao
  features/    # hooks e fluxos por contexto funcional
  pages/       # paginas de alto nivel
  shared/      # configuracoes, contratos e utilitarios compartilhados
```

## Camada de API (pre-backend)

Foi criada uma camada de integracao pronta para troca de fonte de dados:

- `shared/api/contracts.ts`: caminhos dos contratos de API
- `shared/api/httpClient.ts`: cliente HTTP tipado
- `shared/api/httpCrmGateway.ts`: implementacao para backend real
- `shared/api/mockCrmGateway.ts`: implementacao mock para desenvolvimento local
- `shared/api/runtimeGateway.ts`: seletor mock/real por variavel de ambiente

## Estado atual da interface

- Navegacao por rotas com layout lateral (`/`, `/agenda`, `/leads`, `/pipeline`, `/setup`).
- Dashboard com status de saude, resumo comercial e funil visual com taxa de conversao.
- Agenda com timeline de eventos (visita, ligacao, follow-up, reuniao), acoes rapidas (concluir/adiar) e persistencia local dessas acoes.
- Acoes da Agenda preparadas para escrita via gateway (mock/HTTP), com fallback local.
- Tabela de leads consumindo gateway tipado (mock ou backend real).
- Pipeline em colunas (estilo kanban de leitura) com total por etapa.
- Busca textual, filtro por etapa e resumo por estagio na tela de leads.
- Setup com painel de progresso percentual do MVP e percentual restante.
- Setup com seletor de fonte de dados (Mock local x Backend real) com persistencia local.
- Setup com teste rapido de conectividade da API (base URL e endpoint health configuravel).
- Diagnostico de API no Setup com status, latencia estimada e horario da ultima checagem.
- Validacao em tempo real do endpoint de health-check no Setup (com feedback visual).
- Ultimo diagnostico de API fica persistido localmente e reaparece ao reabrir o Setup.
- Setup exibe historico recente (ultimas 5) de checagens de API com status e URL testada.
- Historico do Setup possui filtro por status e ordenacao por recencia/latencia.
- Cada item do historico pode ser carregado no resumo atual para copiar/baixar aquele diagnostico.
- Itens do historico recente podem ser removidos individualmente sem apagar todo o historico.
- Setup permite limpar manualmente o historico local do diagnostico de API.
- Setup permite copiar o diagnostico atual da API em JSON para suporte/depuracao.
- Setup permite baixar o diagnostico atual da API em arquivo JSON.
- Autenticacao inicial com login demo, sessao e protecao de rotas.
- Sessao centralizada via provider e controle de acesso por perfil (RBAC) na rota Setup.
- Estrutura pronta para substituir dados mock sem alterar componentes de tela.

Variaveis opcionais (`.env`):

- `VITE_USE_MOCK_API=true` (padrao)
- `VITE_API_BASE_URL=http://localhost:8000/api`
- `VITE_API_HEALTH_PATH=/health`
- `VITE_HTTP_TIMEOUT_MS=8000` (timeout padrao em ms para requisicoes HTTP)
- `VITE_HTTP_RETRY_COUNT=1` (numero de tentativas apos timeout/erro de rede)
- `VITE_SESSION_TTL_MINUTES=480` (tempo de vida da sessao em minutos, 480 = 8 horas)

## Scripts

- npm run dev
- npm run build
- npm run lint
- npm run preview

## Observacao

O sistema legado em HTML unico foi preservado fora desta pasta em `../legacy/standalone/` para referencia durante a migracao gradual.
