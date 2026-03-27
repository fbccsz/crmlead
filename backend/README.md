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

# Instalar dependencias
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

### Publicos
- `GET /health` - Health check
- `POST /login` - Autenticacao

### Protegidos (depois)
- `GET /dashboard/summary` - Resumo comercial
- `GET /leads` - Listar leads
- `GET /leads/{id}` - Lead especifico
- `GET /events` - Agenda
- `POST /events/{id}/complete` - Concluir evento
- `PUT /events/{id}/reschedule` - Reagendar

## Status

- MVP endpoints funcionando
- Autenticacao JWT (proximo)
- Banco de dados PostgreSQL (proximo)
- Validacoes e tratamento de erros (proximo)

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

## Integracao com Frontend

O frontend esta configurado para conectar neste backend:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000
```

## CORS no Render

No painel do Render (Environment), adicione a variavel:

- `ALLOW_ORIGINS=https://SEU_SITE.appwrite.global,http://localhost:5173`

Pode incluir multiplos dominios separados por virgula.

Exemplo real:

- `ALLOW_ORIGINS=https://crmlead.appwrite.global,https://www.crmlead.com`

## Python no Render

Para evitar erro de build do pydantic-core com Python 3.14, este backend fixa a versao no arquivo `runtime.txt`:

- `python-3.11.11`

