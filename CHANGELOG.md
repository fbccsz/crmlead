# Changelog - 29 de março de 2026

## [Unreleased]

### Added (Melhorias Rápidas)
- ✅ **Validações Pydantic robustas** no backend
  - EmailStr validation para login
  - Min/max length em strings
  - Enums para stage (Lead, Visita, Proposta, Fechado, Recusado)
  - Enum para tipos de eventos (visita, ligacao, reuniao, email, whatsapp)
  - Validação de data ISO8601 em UpdateEventDateInput
  - Mensagens de erro claros e específicos

- ✅ **PDF Roadmap documentation** (docs/PDF_ROADMAP.md)
  - Estratégia de implementação de exportação em PDF
  - Timeline estimada (3-5 dias)
  - Stack recomendado (ReportLab vs WeasyPrint)
  - Casos de uso prioritizados
  - Definição de "pronto" (DoD)

### Fixed
- 🔧 Remover DeprecationWarning de `datetime.utcnow()`
  - Atualizar para `datetime.now()` em _build_session()
  - Atualizar para `datetime.now()` em health_check()

### Validation
- ✅ Backend: Validação funcional testada
  - Email inválido → 422 com mensagem clara
  - Email válido → 200 com sucesso
  - Sintaxe Python validada

- ✅ Frontend: Build sem erros
  - 51 módulos transformados
  - CSS 4.78KB gzip
  - JS 76.37KB gzip
  - Build time 458ms

---

## Próximas Prioridades

| Ordem | Tarefa | Bloqueador | Timeline |
|-------|--------|-----------|----------|
| 1 | PostgreSQL (dados persistentes) | 🔴 Crítico | Fase 3 (1-2 sem) |
| 2 | Autenticação JWT real | 🔴 Crítico | Fase 2 (3-4 dias) |
| 3 | Upload de imagens | 🟠 Alto | Fase 3 (2-3 dias) |
| 4 | PDF exports | 🟠 Médio | Fase 4 (3-5 dias) |
| 5 | WebSocket real-time | 🟡 Médio | Fase 4 (4-5 dias) |

---

## Status Atual do MVP

- Frontend: ✅ **100%** - React + TypeScript, acessibilidade, responsivo
- Backend: ✅ **95%** - FastAPI, validações, testes passando. Faltam: JWT real, persist
- Documentação: ✅ **90%** - README, plano negócio, roadmap técnico
- Dados: ⏳ **Em mock** - Necessário PostgreSQL para produção

---

**Data**: 29 de março de 2026  
**Commitado por**: Agent CRM  
**Hash esperado**: (após push)
