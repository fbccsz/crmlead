#!/usr/bin/env python
# -*- coding: utf-8 -*-
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
    print("TEST: Testing backend CRMLead...")
    print("=" * 60)
    
    # Test 1: Health check
    print("\n1. Health Check:")
    health = await health_check()
    print(f"   OK Status: {health.status}")
    print(f"   OK Version: {health.version}")
    
    # Test 2: Login
    print("\n2. Login:")
    try:
        login_req = LoginRequest(email="demo@crmlead.com", password="demo")
        session = await login(login_req)
        print(f"   OK User: {session.name}")
        print(f"   OK Role: {session.role}")
        print(f"   OK Token: {session.token[:20]}...")
    except Exception as e:
        print(f"   ERROR: {e}")
    
    # Test 3: Dashboard
    print("\n3. Dashboard Summary:")
    dashboard = await get_dashboard_summary()
    print(f"   OK Active Leads: {dashboard.activeLeads}")
    print(f"   OK Scheduled Visits: {dashboard.scheduledVisits}")
    print(f"   OK Open Proposals: {dashboard.openProposals}")
    print(f"   OK Closed Deals: {dashboard.closedDeals}")
    
    # Test 4: Leads
    print("\n4. List Leads:")
    leads = await list_leads()
    print(f"   OK Total: {len(leads)} leads")
    for lead in leads:
        print(f"      - {lead.name} ({lead.stage})")
    
    # Test 5: Events
    print("\n5. List Events:")
    events = await list_events()
    print(f"   OK Total: {len(events)} eventos")
    for event in events:
        print(f"      - {event.title} ({event.type})")
    
    print("\n" + "=" * 60)
    print("SUCCESS: All tests passed!")
    print("\nNext step: run server with: python main.py")
    print("Then access: http://localhost:8000/docs")

if __name__ == "__main__":
    asyncio.run(run_tests())
