"""
CRMLead Backend - FastAPI
MVP com endpoints para Dashboard, Leads, Agenda e Autenticação
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from typing import Optional
import json

# Simulado em-memória (será PostgreSQL depois)
app = FastAPI(title="CRMLead API", version="1.0.0")

# CORS para frontend em http://localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# TIPOS
# ============================================================================

from pydantic import BaseModel

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
        neighborhood="Graça",
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

# ============================================================================
# ROTAS PÚBLICAS
# ============================================================================

@app.get("/health", response_model=HealthStatus)
async def health_check():
    """Health check do backend"""
    return HealthStatus(
        status="ok",
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat() + "Z",
    )

@app.post("/login", response_model=UserSession)
async def login(credentials: LoginRequest):
    """Login do usuário"""
    if not credentials.email or not credentials.password:
        raise HTTPException(status_code=400, detail="Email e password obrigatórios")
    
    # Validar credenciais (simplificado)
    if credentials.password != "demo":
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    return UserSession(
        id="usr-01",
        name="Gestor CRM" if "gestor" in credentials.email else "Corretor Demo",
        email=credentials.email,
        role="gestor" if "gestor" in credentials.email else "corretor",
        token=f"jwt-token-{datetime.utcnow().timestamp()}",
    )

# ============================================================================
# ROTAS PROTEGIDAS (requer token depois)
# ============================================================================

@app.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary():
    """Resumo comercial para dashboard"""
    return DashboardSummary(
        activeLeads=len(mock_leads),
        scheduledVisits=2,
        openProposals=1,
        closedDeals=9,
    )

@app.get("/leads", response_model=list[Lead])
async def list_leads(stage: Optional[str] = None):
    """Listar leads com filtro opcional por estágio"""
    if stage:
        return [l for l in mock_leads if l.stage == stage]
    return mock_leads

@app.get("/leads/{lead_id}", response_model=Lead)
async def get_lead(lead_id: str):
    """Buscar lead específico"""
    for lead in mock_leads:
        if lead.id == lead_id:
            return lead
    raise HTTPException(status_code=404, detail="Lead não encontrado")

@app.get("/events", response_model=list[Event])
async def list_events():
    """Listar todos os eventos da agenda"""
    return mock_events

@app.post("/events/{event_id}/complete")
async def complete_event(event_id: str):
    """Marcar evento como concluído"""
    for event in mock_events:
        if event.id == event_id:
            return {"status": "completed", "eventId": event_id}
    raise HTTPException(status_code=404, detail="Evento não encontrado")

@app.put("/events/{event_id}/reschedule")
async def reschedule_event(event_id: str, date: str):
    """Reagendar evento para nova data"""
    for event in mock_events:
        if event.id == event_id:
            event.date = date
            return event
    raise HTTPException(status_code=404, detail="Evento não encontrado")

# ============================================================================
# STARTUP
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
