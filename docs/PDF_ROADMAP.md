# PDF Export & Reports - Roadmap

**Status**: Pendente (Fase 4 - Features Avançadas)  
**Prioridade**: 🟠 Média  
**Timeline Estimada**: 3-5 dias  
**Data de Atualização**: 29 de março de 2026

---

## 1. Visão Geral

O sistema CRMLead necessita de funcionalidades robustas de geração de PDF para suportar:

1. **Relatórios de Pipeline** - KPIs, funil de vendas, taxa de conversão
2. **Fichas de Imóvel** - Detalhes completos com fotos e especificações
3. **Propostas de Venda** - Documentos para assinatura digital
4. **Contatos de Clientes** - Dados de follow-up e histórico

---

## 2. Requisitos de Negócio

### Por que PDF?
- **Portabilidade**: Compartilhar com clientes via email/WhatsApp
- **Profissionalismo**: Marca CRMLead + logos + assinaturas
- **Auditoria**: Registro permanente de negociações
- **Offline**: Acesso sem internet

### Casos de Uso (MVP)

| Caso | Descrição | Prioridade | Esforço |
|------|-----------|-----------|---------|
| **Ficha Imóvel** | PDF com fotos, características, localização | ⭐⭐⭐ | 2 dias |
| **Propostas** | Resumo comercial + termos + assinatura | ⭐⭐⭐ | 3 dias |
| **Relatório Mensal** | Dashboard exportado em PDF | ⭐⭐ | 2 dias |
| **Contato Lead** | Dados do cliente + histórico de eventos | ⭐ | 1 dia |

---

## 3. Stack Tecnológico Recomendado

### Opção 1: ReportLab (Python Backend)
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# Implementar no backend FastAPI
@app.get("/export/property/{property_id}/pdf")
async def export_property_pdf(property_id: str):
    # Gerar PDF serverside
    # Retornar como attachment
```

**Vantagens:**
- ✅ Full control sobre layout
- ✅ Integração fácil com banco de dados
- ✅ Suporta gráficos e tabelas
- ✅ Performance (document gerado em memória)

**Desvantagens:**
- ❌ Curva de aprendizado média
- ❌ Design complexity aumenta código

### Opção 2: WeasyPrint (Python)
```python
from weasyprint import HTML, CSS

# Converter HTML + CSS em PDF
HTML(string=html_content).write_pdf(filename)
```

**Vantagens:**
- ✅ Usar HTML/CSS conhecidos
- ✅ Rápido prototipagem
- ✅ Design consistente com frontend

**Desvantagens:**
- ❌ Mais pesado (dependencies extras)
- ❌ Slower para volumes altos

### Opção 3: pdfkit + wkhtmltopdf (Windows-friendly)
```bash
apt-get install wkhtmltopdf  # Linux
brew install wkhtmltopdf     # macOS
# Windows: download .exe
```

**Vantagens:**
- ✅ Rendering semelhante ao navegador
- ✅ JavaScript suportado (limitado)

**Desvantagens:**
- ❌ Dependência externa pesada
- ❌ Instalação complexa em produção

---

## 4. Implementação Proposta (MVP)

### Fase 1: Backend (1-2 dias)

#### 1.1 Adicionar modelos Pydantic
```python
class PropertyExportRequest(BaseModel):
    property_id: str
    include_photos: bool = True
    format: str = "pdf"  # future: docx, xlsx

class ProposalExportRequest(BaseModel):
    lead_id: str
    proposal_id: str
    signature_required: bool = False
```

#### 1.2 Endpoints de exportação
```python
@app.post("/export/property/pdf")
async def export_property_pdf(req: PropertyExportRequest):
    # 1. Fetch dados do banco
    # 2. Gerar PDF com fotos
    # 3. Retornar como FileResponse

@app.post("/export/proposal/pdf")
async def export_proposal_pdf(req: ProposalExportRequest):
    # 1. Fetch lead + proposal details
    # 2. Gerar PDF com termos
    # 3. Retornar para assinatura
```

#### 1.3 Dependências a instalar
```bash
pip install reportlab>=4.0.0  # ou weasyprint
pip install Pillow            # Para manipulação de imagens
```

### Fase 2: Frontend (1-2 dias)

#### 2.1 Botões de exportação
```tsx
// Em Property.tsx / Proposal.tsx
<button onClick={() => exportPDF('property', propertyId)}>
  📄 Exportar como PDF
</button>
```

#### 2.2 Serviço HTTP
```typescript
// No runtimeGateway.ts
export async function exportPropertyPdf(
  propertyId: string,
  includePhotos: boolean = true
): Promise<Blob> {
  const response = await httpClient.post(
    `/export/property/pdf`,
    { property_id: propertyId, include_photos: includePhotos },
    { responseType: 'blob' }
  );
  // Trigger download
  const url = window.URL.createObjectURL(response);
  const a = document.createElement('a');
  a.href = url;
  a.download = `property_${propertyId}.pdf`;
  a.click();
}
```

#### 2.3 State management
```tsx
// usePDFExport.ts (custom hook)
export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportProperty = async (propertyId: string) => {
    setIsExporting(true);
    try {
      await exportPropertyPdf(propertyId);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportProperty, isExporting, error };
}
```

---

## 5. Timeline

```
╔════════════════════════════════════════════════════════════╗
║                      PDF IMPLEMENTATION                    ║
├────────────────────────────────────────────────────────────┤
║ Sem 1 (Abr 2-6)                                            ║
║   ├─ Design template fichas de imóvel                   ║
║   ├─ Setup ReportLab / WeasyPrint                       ║
║   ├─ Implementar endpoint /export/property/pdf          ║
║   └─ Testes unitários                                   ║
║                                                            ║
║ Sem 2 (Abr 9-13)                                           ║
║   ├─ Frontend: botão exportar em Property page          ║
║   ├─ Integração HTTP com backend                        ║
║   ├─ Testes E2E                                         ║
║   └─ Deploy staging                                     ║
║                                                            ║
║ Sem 3 (Abr 16-20)                                          ║
║   ├─ Template propostas (se needed)                     ║
║   ├─ Assinatura digital (e-signature)                   ║
║   └─ Relatórios avançados                               ║
╚════════════════════════════════════════════════════════════╝
```

---

## 6. Dependências & Bloqueadores

### Dependências Críticas
- [x] Backend API funcional ✅
- [x] Banco de dados com dados reais ⏳ (PG migration next)
- [ ] Upload de fotos de imóvel
- [ ] Autenticação JWT real

### Bloqueadores Conhecidos
1. **Sem banco de dados persistente** → Dados mock não podem ser exportados
   - Bloqueador: Implementar PostgreSQL primeiro
   - Timeline: Fase 3 (1-2 semanas)

2. **Sem uploads de imagem** → Fichas sem fotos
   - Bloqueador: Storage (AWS S3 ou similar)
   - Timeline: Fase 3

3. **Versão do Python** → Algumas libs precisam Python 3.9+
   - Status: ✅ Temos Python 3.11

---

## 7. Riscos & Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| PDF grande demais (com fotos) | Performance | Compressão de imagens, paginate |
| Font rendering inconsistente | UX ruim | Usar fonts do sistema |
| Memória alta em volume | Crash | Stream PDFs direto (não em memória) |
| Falta assinatura digital | Compliance | Integrar DocuSign/Adobe Sign depois |

---

## 8. Definição de "Pronto" (DoD)

- [ ] Usuarios conseguem exportar ficha imóvel em PDF
- [ ] PDF contém: fotos, características, localização, preço
- [ ] Arquivo é compartilhável (email, WhatsApp)
- [ ] Performance < 2s para gerar (com 5 fotos)
- [ ] Testes unitários para templates
- [ ] Documentação em README
- [ ] Deploy em produção + monitoramento

---

## 9. Próximos Passos

1. **Imediato** (Esta semana)
   - [ ] Decidir entre ReportLab vs WeasyPrint
   - [ ] Prototipar template de ficha
   - [ ] Criar design mockup em Figma (opcional)

2. **Curto prazo** (Próximas 2 semanas)
   - [ ] Implementar PostgreSQL (bloqueador)
   - [ ] Setup estrutura de armazenamento

3. **Médio prazo** (Abril)
   - [ ] Implementar endpoints PDF
   - [ ] Integrar frontend

---

## Referências

- ReportLab Docs: https://www.reportlab.com/
- WeasyPrint Docs: https://weasyprint.org/
- PDF/A Compliance: https://en.wikipedia.org/wiki/PDF/A
- e-Signature services: DocuSign, Adobe Sign, HelloSign

---

**Autor**: CRMLead Dev Team  
**Última Atualização**: 2026-03-29
