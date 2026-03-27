"""
CRMLead Backend - FastAPI
MVP com endpoints para Dashboard, Leads, Agenda e Autenticacao
"""

from datetime import datetime
from typing import Optional
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Simulado em memoria (sera PostgreSQL depois)
app = FastAPI(title="CRMLead API", version="1.0.0")


def _allowed_origins() -> list[str]:
    raw = os.getenv("ALLOW_ORIGINS", "")
    env_items = [o.strip() for o in raw.split(",") if o.strip()] if raw.strip() else []
    defaults = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://crmlead.appwrite.network",
        "https://crmlead.appwrite.global",
    ]
    # Mantem defaults mesmo quando ALLOW_ORIGINS esta setado para evitar lock acidental.
    return list(dict.fromkeys(env_items + defaults))

# CORS configuravel por variavel de ambiente (Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_origin_regex=os.getenv(
        "ALLOW_ORIGIN_REGEX",
        r"https://.*\.appwrite\.(network|global)",
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# TIPOS
# ============================================================================

class LoginRequest(BaseModel):
    email: str
    password: str


class UserSession(BaseModel):
    id: str
    name: str
    email: str
    role: str
    token: str


class Lead(BaseModel):
    id: str
    name: str
    stage: str
    phone: str
    email: str
    neighborhood: str
    budget: float
    createdAt: str


class Event(BaseModel):
    id: str
    title: str
    type: str
    date: str
    clientName: str


class DashboardSummary(BaseModel):
    activeLeads: int
    scheduledVisits: int
    openProposals: int
    closedDeals: int


class HealthStatus(BaseModel):
    status: str
    version: str
    timestamp: str


class UpdateEventDateInput(BaseModel):
    date: str


# ============================================================================
# DADOS MOCK
# ============================================================================

mock_leads = [
    Lead(
        id="ld-01",
        name="Maria Santos",
        stage="Proposta Feita",
        phone="(71) 99999-1234",
        email="maria@email.com",
        neighborhood="Pituba",
        budget=500000.0,
        createdAt="2026-03-20T10:00:00Z",
    ),
    Lead(
        id="ld-02",
        name="Carlos Lima",
        stage="Visita Agendada",
        phone="(71) 98888-5678",
        email="carlos@email.com",
        neighborhood="Barra",
        budget=900000.0,
        createdAt="2026-03-22T14:30:00Z",
    ),
    Lead(
        id="ld-03",
        name="Ana Beatriz",
        stage="Lead",
        phone="(71) 97777-9012",
        email="ana@email.com",
        neighborhood="Graca",
        budget=450000.0,
        createdAt="2026-03-25T09:15:00Z",
    ),
]

mock_events = [
    Event(
        id="ev-01",
        title="Visita no apartamento da Pituba",
        type="visita",
        date="2026-03-28T14:00:00Z",
        clientName="Maria Santos",
    ),
    Event(
        id="ev-02",
        title="Ligacao de alinhamento da proposta",
        type="ligacao",
        date="2026-03-28T16:30:00Z",
        clientName="Carlos Lima",
    ),
]


def _build_session(email: str) -> UserSession:
    return UserSession(
        id="usr-01",
        name="Gestor CRM" if "gestor" in email else "Corretor Demo",
        email=email,
        role="gestor" if "gestor" in email else "corretor",
        token=f"jwt-token-{datetime.utcnow().timestamp()}",
    )


# ============================================================================
# ROTAS PUBLICAS
# ============================================================================

@app.get("/health", response_model=HealthStatus)
async def health_check():
    return HealthStatus(
        status="ok",
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat() + "Z",
    )


@app.post("/login", response_model=UserSession)
async def login(credentials: LoginRequest):
    if not credentials.email or not credentials.password:
        raise HTTPException(status_code=400, detail="Email e password obrigatorios")

    # Modo demo: aceita qualquer senha nao vazia.
    return _build_session(credentials.email)


# ============================================================================
# ROTAS NOVAS (CONTRATO FRONTEND)
# ============================================================================

@app.get("/auth/session", response_model=UserSession | None)
async def auth_session():
    # MVP sem sessao persistida no backend
    return None


@app.post("/auth/login", response_model=UserSession)
async def auth_login(credentials: LoginRequest):
    return await login(credentials)


@app.post("/auth/logout")
async def auth_logout():
    return {"ok": True}


@app.get("/crm/dashboard/summary")
async def crm_dashboard_summary():
    summary = DashboardSummary(
        activeLeads=len(mock_leads),
        scheduledVisits=2,
        openProposals=1,
        closedDeals=9,
    )
    return {"summary": summary.model_dump()}


@app.get("/crm/leads")
async def crm_leads(stage: Optional[str] = None):
    items = [l for l in mock_leads if l.stage == stage] if stage else mock_leads
    return {"items": [lead.model_dump() for lead in items]}


@app.get("/crm/events")
async def crm_events():
    return {"items": [event.model_dump() for event in mock_events]}


@app.patch("/crm/events/{event_id}")
async def crm_update_event_date(event_id: str, payload: UpdateEventDateInput):
    for event in mock_events:
        if event.id == event_id:
            event.date = payload.date
            return event.model_dump()
    raise HTTPException(status_code=404, detail="Evento nao encontrado")


# ============================================================================
# ROTAS LEGADAS (compatibilidade)
# ============================================================================

@app.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary():
    return DashboardSummary(
        activeLeads=len(mock_leads),
        scheduledVisits=2,
        openProposals=1,
        closedDeals=9,
    )


@app.get("/leads", response_model=list[Lead])
async def list_leads(stage: Optional[str] = None):
    if stage:
        return [l for l in mock_leads if l.stage == stage]
    return mock_leads


@app.get("/leads/{lead_id}", response_model=Lead)
async def get_lead(lead_id: str):
    for lead in mock_leads:
        if lead.id == lead_id:
            return lead
    raise HTTPException(status_code=404, detail="Lead nao encontrado")


@app.get("/events", response_model=list[Event])
async def list_events():
    return mock_events


@app.post("/events/{event_id}/complete")
async def complete_event(event_id: str):
    for event in mock_events:
        if event.id == event_id:
            return {"status": "completed", "eventId": event_id}
    raise HTTPException(status_code=404, detail="Evento nao encontrado")


@app.put("/events/{event_id}/reschedule")
async def reschedule_event(event_id: str, date: str):
    for event in mock_events:
        if event.id == event_id:
            event.date = date
            return event
    raise HTTPException(status_code=404, detail="Evento nao encontrado")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)




