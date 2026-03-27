# CRMLead Backend - FastAPI

MVP backend para CRMLead com endpoints para Dashboard, Leads, Agenda e Auth.

## Setup

```bash
# Criar venv
python -m venv .venv

# Ativar (Windows)
.\.venv\Scripts\Activate

# Ativar (Mac/Linux)
source .venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

## Rodar

```bash
python main.py
# ou
uvicorn main:app --reload
```

Acessar: http://localhost:8000/docs (Swagger UI interativo)

## Endpoints

### Públicos
- `GET /health` - Health check
- `POST /login` - Autenticação

### Protegidos (depois)
- `GET /dashboard/summary` - Resumo comercial
- `GET /leads` - Listar leads
- `GET /leads/{id}` - Lead específico
- `GET /events` - Agenda
- `POST /events/{id}/complete` - Concluir evento
- `PUT /events/{id}/reschedule` - Reagendar

## Status

✅ MVP endpoints funcionando
⏳ Autenticação JWT (próximo)
⏳ Banco de dados PostgreSQL (próximo)
⏳ Validações e tratamento de erros (próximo)

## Teste com curl

```bash
# Health check
curl http://localhost:8000/health

# Login
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo"}'

# Leads
curl http://localhost:8000/leads
```

## Integração com Frontend

O frontend já está configurado em `frontend/src/shared/config/env.ts` para conectar a este backend:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000/api
```

Mudá para `/api` depois ou ajuste os endpoints.
