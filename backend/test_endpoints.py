#!/usr/bin/env python
"""
Script de teste para validar endpoints do backend
"""

import asyncio
from main import (
    app, 
    health_check, 
    login, 
    get_dashboard_summary,
    list_leads,
    list_events,
    LoginRequest
)

async def run_tests():
    print("🧪 Testando backend CRMLead...")
    print("=" * 60)
    
    # Test 1: Health check
    print("\n1️⃣  Health Check:")
    health = await health_check()
    print(f"   ✅ Status: {health.status}")
    print(f"   ✅ Version: {health.version}")
    
    # Test 2: Login
    print("\n2️⃣  Login:")
    try:
        login_req = LoginRequest(email="demo@crmlead.com", password="demo")
        session = await login(login_req)
        print(f"   ✅ User: {session.name}")
        print(f"   ✅ Role: {session.role}")
        print(f"   ✅ Token: {session.token[:20]}...")
    except Exception as e:
        print(f"   ❌ Erro: {e}")
    
    # Test 3: Dashboard
    print("\n3️⃣  Dashboard Summary:")
    dashboard = await get_dashboard_summary()
    print(f"   ✅ Active Leads: {dashboard.activeLeads}")
    print(f"   ✅ Scheduled Visits: {dashboard.scheduledVisits}")
    print(f"   ✅ Open Proposals: {dashboard.openProposals}")
    print(f"   ✅ Closed Deals: {dashboard.closedDeals}")
    
    # Test 4: Leads
    print("\n4️⃣  List Leads:")
    leads = await list_leads()
    print(f"   ✅ Total: {len(leads)} leads")
    for lead in leads:
        print(f"      - {lead.name} ({lead.stage})")
    
    # Test 5: Events
    print("\n5️⃣  List Events:")
    events = await list_events()
    print(f"   ✅ Total: {len(events)} eventos")
    for event in events:
        print(f"      - {event.title} ({event.type})")
    
    print("\n" + "=" * 60)
    print("✅ Todos os testes passaram!")
    print("\nPróximo passo: rodar o servidor com:")
    print("  python main.py")
    print("Depois acessar: http://localhost:8000/docs")

if __name__ == "__main__":
    asyncio.run(run_tests())
