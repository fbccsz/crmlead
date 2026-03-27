# CRMLead Workspace

Projeto organizado para evolucao gradual do CRM antes da etapa de backend.

## Estrutura principal

- `frontend/`: nova base web em TypeScript (React + Vite).
- `legacy/standalone/`: versao anterior em HTML unico, preservada para consulta/migracao.
- `docs/business/`: plano de negocio, roadmap e diretrizes funcionais.
- `venv/`: ambiente local existente.

## Motivo da escolha de linguagem

A camada web foi padronizada em **TypeScript**, que oferece:
- Tipagem estatica (menos bugs em producao)
- Melhor manutencao em times
- Integração natural com frontend moderno e APIs tipadas

## Proxima etapa sugerida

Iniciar backend separado (FastAPI ou NestJS) com contratos OpenAPI para conectar ao frontend TypeScript.

## Estado atual pre-backend

- Frontend com camada de contratos e gateway de API pronta para alternar entre mock e backend real.
- Hook de readiness exibindo saude da integracao e KPIs iniciais na interface.
