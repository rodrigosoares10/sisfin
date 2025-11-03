# 📊 Sistema de Métricas SaaS/Agência

Sistema completo de métricas para análise financeira profissional de negócios SaaS e Agências.

## 📑 Índice

- [Visão Geral](#visão-geral)
- [Camada 1: Métricas Executivas](#camada-1-métricas-executivas)
- [Camada 2: Métricas de Receita](#camada-2-métricas-de-receita)
- [Camada 3: Unit Economics](#camada-3-unit-economics)
- [Camada 5: Customer Success](#camada-5-customer-success)
- [Camada 6: Operações de Agência](#camada-6-operações-de-agência)
- [Camada 7: Tesouraria](#camada-7-tesouraria)
- [Como Usar](#como-usar)
- [Entrada Manual de Dados](#entrada-manual-de-dados)

---

## Visão Geral

Este sistema implementa as métricas mais importantes para gestão de negócios SaaS e Agências, organizadas em camadas:

### Camadas Implementadas

1. **Executivo**: ARR, MRR, NRR, GRR, Churn, LTV, CAC, Rule of 40, Runway
2. **Receita**: MRR Bridge, ARPA por Produto
3. **Unit Economics**: Margens (Bruta, Operacional, Líquida), COGS, Magic Number
4. **Customer Success**: Health Scores, NPS, SLA, FCR
5. **Agência**: Utilização, Blended Rate, WIP, Margens de Projetos
6. **Tesouraria**: DSO, AR Aging, Cash Balance

---

## Camada 1: Métricas Executivas

### Endpoint: `GET /api/metrics/executive`

**North Star Metrics** - Visão executiva completa do negócio.

#### Parâmetros
- `mes` (opcional): 1-12 (padrão: mês atual)
- `ano` (opcional): ano (padrão: ano atual)

#### Métricas Retornadas

##### ARR (Annual Recurring Revenue)
```
ARR = MRR × 12
```
Receita recorrente anualizada.

##### MRR (Monthly Recurring Revenue)
```
MRR = Soma de todas as transações recorrentes mensais pagas
```
Receita recorrente mensal.

##### Crescimento MRR
```
Crescimento MoM % = ((MRR Atual - MRR Anterior) / MRR Anterior) × 100
```

##### Churn Rate
```
Churn Rate % = (MRR Churn / MRR Anterior) × 100
```

**Benchmarks:**
- **SaaS B2B**: < 5% ao mês (< 2% é excelente)
- **SaaS B2C**: < 7% ao mês

##### Margem Bruta
```
Margem Bruta % = ((Receitas - COGS) / Receitas) × 100
```

**Benchmarks:**
- **SaaS**: > 70% (80%+ é excelente)
- **Agência**: > 50%

##### Rule of 40
```
Rule of 40 = Taxa de Crescimento % + Margem Bruta %
```

**Benchmark:** ≥ 40% (indica negócio saudável e sustentável)

##### Runway
```
Runway (meses) = Saldo de Caixa / Burn Rate Mensal
```

Número de meses até o caixa zerar se não houver novas entradas.

#### Exemplo de Requisição

```bash
curl http://localhost:3000/api/metrics/executive?mes=11&ano=2025
```

#### Exemplo de Resposta

```json
{
  "periodo": "11/2025",
  "arr": "1200000.00",
  "mrr": "100000.00",
  "mrrAnterior": "95000.00",
  "crescimentoMRR": {
    "absoluto": "5000.00",
    "percentual": "5.26"
  },
  "churn": {
    "valor": "2000.00",
    "taxa": "2.11"
  },
  "margemBruta": "75.50",
  "ruleOf40": "80.76",
  "runway": 18,
  "burnRate": "15000.00",
  "benchmarks": {
    "ruleOf40": "Ideal: ≥ 40%",
    "churnRate": "SaaS B2B: < 5% | B2C: < 7%",
    "margemBruta": "SaaS: > 70%"
  }
}
```

---

### Endpoint: `GET /api/metrics/nrr-grr`

**NRR (Net Revenue Retention)** e **GRR (Gross Revenue Retention)**

#### Fórmulas

##### GRR (Gross Revenue Retention)
```
GRR % = ((MRR Base - Churn - Contraction) / MRR Base) × 100
```

**Benchmarks:**
- **Excelente**: ≥ 95%
- **Bom**: 90-95%
- **Atenção**: < 90%

##### NRR (Net Revenue Retention)
```
NRR % = ((MRR Base - Churn - Contraction + Expansion) / MRR Base) × 100
```

**Benchmarks:**
- **Excelente**: ≥ 110% (crescimento orgânico)
- **Bom**: 100-110%
- **Atenção**: < 100%

#### Exemplo de Resposta

```json
{
  "periodo": "11/2025",
  "mrrBase": "95000.00",
  "movimentos": {
    "expansion": "8000.00",
    "contraction": "1500.00",
    "churn": "2000.00"
  },
  "grr": "96.84",
  "nrr": "105.26",
  "benchmarks": {
    "nrr": "Excelente: ≥ 110% | Bom: 100-110% | Atenção: < 100%",
    "grr": "Excelente: ≥ 95% | Bom: 90-95% | Atenção: < 90%"
  }
}
```

---

### Endpoint: `GET /api/metrics/ltv-cac`

**LTV (Lifetime Value)** e **CAC (Customer Acquisition Cost)**

#### Fórmulas

##### ARPA (Average Revenue Per Account)
```
ARPA = MRR Total / Número de Clientes Ativos
```

##### LTV (Lifetime Value)
```
LTV = ARPA / Churn Rate
```

Valor total que um cliente gera durante seu lifetime.

##### CAC (Customer Acquisition Cost)
```
CAC = Total de Custos de Marketing e Vendas / Número de Novos Clientes
```

##### LTV:CAC Ratio
```
LTV:CAC = LTV / CAC
```

**Benchmarks:**
- **Excelente**: > 5x
- **Bom**: 3-5x
- **Atenção**: < 3x

##### Payback Period
```
Payback (meses) = CAC / ARPA
```

**Benchmarks:**
- **Excelente**: < 12 meses
- **Bom**: 12-18 meses
- **Atenção**: > 18 meses

#### Exemplo de Resposta

```json
{
  "periodo": "11/2025",
  "arpa": "1250.00",
  "churnRate": "2.11%",
  "ltv": "59242.65",
  "cac": "12500.00",
  "ltvCacRatio": "4.74",
  "paybackMonths": "10.0",
  "novosClientes": 8,
  "totalCAC": "100000.00",
  "benchmarks": {
    "ltvCacRatio": "Excelente: > 5x | Bom: 3-5x | Atenção: < 3x",
    "payback": "Excelente: < 12 meses | Bom: 12-18 meses"
  }
}
```

---

## Camada 2: Métricas de Receita

### Endpoint: `GET /api/metrics/mrr-bridge`

**MRR Bridge** - Análise detalhada dos movimentos de MRR.

#### Componentes

```
MRR Final = MRR Inicial + Novo + Expansion + Reativação - Contraction - Churn
```

- **Novo**: MRR de novos clientes
- **Expansion**: Upgrade/upsell de clientes existentes
- **Contraction**: Downgrade de planos
- **Churn**: Cancelamentos
- **Reativação**: Clientes que voltaram

#### Exemplo de Resposta

```json
{
  "periodo": "11/2025",
  "mrrInicial": "95000.00",
  "movimentos": {
    "novo": "10000.00",
    "expansion": "8000.00",
    "contraction": "1500.00",
    "churn": "2000.00",
    "reativacao": "500.00"
  },
  "netNewMRR": "15000.00",
  "mrrFinal": "110000.00",
  "crescimento": {
    "absoluto": "15000.00",
    "percentual": "15.79"
  }
}
```

---

### Endpoint: `GET /api/metrics/arpa-by-product`

**ARPA por Produto/Plano**

Receita média por cliente segmentada por produto.

#### Exemplo de Resposta

```json
{
  "periodo": "11/2025",
  "produtos": [
    {
      "produto": {
        "id": "prod1",
        "nome": "Plano Básico",
        "tipo": "MRR",
        "valor": "99.00"
      },
      "receita": "19800.00",
      "clientes": 200,
      "arpa": "99.00"
    },
    {
      "produto": {
        "id": "prod2",
        "nome": "Plano Pro",
        "tipo": "MRR",
        "valor": "299.00"
      },
      "receita": "29900.00",
      "clientes": 100,
      "arpa": "299.00"
    }
  ]
}
```

---

## Camada 3: Unit Economics

### Endpoint: `GET /api/metrics/unit-economics`

**Unit Economics** - Economia unitária do negócio.

#### Métricas

##### Margem Bruta
```
Margem Bruta % = ((Receitas - COGS) / Receitas) × 100
```

##### Margem Operacional
```
Margem Operacional % = ((Receitas - COGS - OPEX) / Receitas) × 100
```

##### Margem Líquida
```
Margem Líquida % = ((Receitas - COGS - OPEX - CAC) / Receitas) × 100
```

##### COGS per Customer
```
COGS per Customer = Total COGS / Número de Clientes Ativos
```

##### Magic Number
```
Magic Number = Net New MRR / Sales & Marketing Spend
```

Eficiência de vendas e marketing. Indica quanto de MRR é gerado para cada real gasto.

**Benchmarks:**
- **Excelente**: > 1.0
- **Bom**: 0.75-1.0
- **Atenção**: < 0.75

#### Exemplo de Resposta

```json
{
  "periodo": "11/2025",
  "receitas": "150000.00",
  "custos": {
    "cogs": "35000.00",
    "opex": "45000.00",
    "cac": "25000.00",
    "total": "105000.00"
  },
  "margens": {
    "bruta": "76.67%",
    "operacional": "46.67%",
    "liquida": "30.00%"
  },
  "cogsPerCustomer": "175.00",
  "magicNumber": "0.85",
  "clientesAtivos": 200,
  "benchmarks": {
    "margemBruta": "SaaS: > 70% | Agência: > 50%",
    "magicNumber": "Excelente: > 1.0 | Bom: 0.75-1.0 | Atenção: < 0.75"
  }
}
```

---

## Camada 5: Customer Success

### Endpoint: `GET /api/metrics/customer-health`

**Health Scores e NPS** - Saúde da base de clientes.

#### Health Score

Pontuação de 0-100 baseada em:
- Uso do produto
- NPS (Net Promoter Score)
- Tickets abertos
- Dias sem uso
- Risco de pagamento

**Categorias:**
- **EXCELENTE**: 80-100
- **BOM**: 60-79
- **MEDIO**: 40-59
- **RISCO**: 20-39
- **CRITICO**: 0-19

#### NPS (Net Promoter Score)

```
NPS = % Promotores (9-10) - % Detratores (0-6)
```

**Benchmarks:**
- **Excelente**: > 50
- **Bom**: 30-50
- **Atenção**: < 30

#### Exemplo de Resposta

```json
{
  "distribuicao": [
    { "healthScore": "EXCELENTE", "quantidade": 45 },
    { "healthScore": "BOM", "quantidade": 78 },
    { "healthScore": "MEDIO", "quantidade": 32 },
    { "healthScore": "RISCO", "quantidade": 15 },
    { "healthScore": "CRITICO", "quantidade": 5 }
  ],
  "nps": {
    "media": "62.5",
    "respostas": 120
  },
  "retentionRate": "70.29%",
  "clientesEmRisco": {
    "total": 20,
    "clientes": [...]
  },
  "totalClientes": 175
}
```

---

### Endpoint: `GET /api/metrics/support-sla`

**SLA e FCR** - Métricas de suporte ao cliente.

#### Métricas

##### Tempo Médio de Resposta
Tempo médio até a primeira resposta.

**Benchmarks:**
- **Excelente**: < 1 hora
- **Bom**: 1-4 horas

##### Tempo Médio de Resolução
Tempo médio até resolução completa.

**Benchmarks:**
- **Excelente**: < 24 horas
- **Bom**: 24-48 horas

##### FCR (First Contact Resolution)
```
FCR % = (Tickets Resolvidos no Primeiro Contato / Total de Tickets) × 100
```

**Benchmarks:**
- **Excelente**: > 70%
- **Bom**: 50-70%

#### Exemplo de Resposta

```json
{
  "periodo": "11/2025",
  "totalTickets": 156,
  "sla": {
    "tempoMedioResposta": "2.3 horas",
    "tempoMedioResolucao": "18.5 horas",
    "fcrRate": "68.50%"
  },
  "distribuicao": {
    "porStatus": [...],
    "porPrioridade": [...]
  }
}
```

---

## Camada 6: Operações de Agência

### Endpoint: `GET /api/metrics/agency-operations`

**Métricas de Projetos e Utilização** - Para agências e serviços profissionais.

#### Métricas

##### Utilização
```
Utilização % = (Horas Faturáveis / Horas Realizadas) × 100
```

**Benchmarks:**
- **Excelente**: > 80%
- **Bom**: 70-80%

##### Blended Rate
```
Blended Rate = Valor Faturado / Horas Faturáveis
```

Taxa média por hora cobrada.

##### Margem Bruta de Projetos
```
Margem % = ((Valor Faturado - Custo Real) / Valor Faturado) × 100
```

**Benchmarks:**
- **Excelente**: > 40%
- **Bom**: 30-40%

##### WIP (Work in Progress)
```
WIP = Valor Contratado - Valor Faturado (projetos em andamento)
```

#### Exemplo de Resposta

```json
{
  "periodo": "11/2025",
  "totalProjetos": 45,
  "horas": {
    "estimadas": "2400.00",
    "realizadas": "2100.00",
    "faturaveis": "1800.00",
    "utilizacao": "85.71%"
  },
  "financeiro": {
    "valorContratado": "450000.00",
    "valorFaturado": "360000.00",
    "custoReal": "210000.00",
    "margemBruta": "41.67%",
    "blendedRate": "200.00"
  },
  "wip": {
    "projetos": 12,
    "valor": "90000.00"
  }
}
```

---

## Camada 7: Tesouraria

### Endpoint: `GET /api/metrics/treasury`

**DSO e AR Aging** - Gestão de recebíveis.

#### Métricas

##### DSO (Days Sales Outstanding)
```
DSO = (Contas a Receber / Receitas Totais) × Dias no Período
```

Número médio de dias para receber pagamentos.

**Benchmarks:**
- **Excelente**: < 30 dias
- **Bom**: 30-45 dias
- **Atenção**: > 45 dias

##### AR Aging
Contas a receber por tempo de atraso:
- **Atual**: 0-30 dias
- **30 dias**: 31-60 dias
- **60 dias**: 61-90 dias
- **90+ dias**: > 90 dias

#### Exemplo de Resposta

```json
{
  "periodo": "11/2025",
  "dso": "35.5 dias",
  "contasReceber": {
    "total": "125000.00",
    "quantidade": 45
  },
  "arAging": {
    "atual": "85000.00",
    "dias30": "25000.00",
    "dias60": "10000.00",
    "dias90": "5000.00"
  },
  "metodosPagamento": [...],
  "cashBalance": {
    "saldoInicial": "500000.00",
    "entradas": "180000.00",
    "saidas": "150000.00",
    "saldoFinal": "530000.00",
    "burnRate": "15000.00",
    "runway": 35
  }
}
```

---

## Como Usar

### 1. Autenticação

Todas as métricas requerem autenticação JWT:

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com","senha":"senha123"}'

# Resposta:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {...}
}

# 2. Usar o token nas requisições
curl http://localhost:3000/api/metrics/executive?mes=11&ano=2025 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### 2. Consultando Métricas

Todas as métricas aceitam parâmetros `mes` e `ano`:

```bash
# Métricas do mês atual
curl http://localhost:3000/api/metrics/executive

# Métricas de um período específico
curl http://localhost:3000/api/metrics/executive?mes=10&ano=2025

# Múltiplas métricas em um dashboard
curl http://localhost:3000/api/metrics/executive?mes=11&ano=2025
curl http://localhost:3000/api/metrics/nrr-grr?mes=11&ano=2025
curl http://localhost:3000/api/metrics/ltv-cac?mes=11&ano=2025
```

---

## Entrada Manual de Dados

Para que as métricas funcionem corretamente, você precisa alimentar o sistema com dados. Aqui está como fazer:

### 1. Custos de Marketing (CAC)

**Endpoint:** `POST /api/marketing-costs` (você precisa criar este endpoint)

```json
{
  "canal": "GOOGLE_ADS",
  "campanha": "Black Friday 2025",
  "valor": 15000.00,
  "data": "2025-11-01",
  "descricao": "Campanha de aquisição Q4",
  "leads": 500,
  "conversoes": 25
}
```

**Canais disponíveis:**
- `ORGANICO`
- `GOOGLE_ADS`
- `META_ADS`
- `LINKEDIN_ADS`
- `EMAIL`
- `INDICACAO`
- `PARCERIA`
- `OUTRO`

### 2. Custos Operacionais (COGS e OPEX)

**Endpoint:** `POST /api/operational-costs` (você precisa criar este endpoint)

```json
{
  "tipo": "COGS",
  "categoria": "Cloud Infrastructure",
  "descricao": "AWS - Novembro 2025",
  "valor": 8500.00,
  "data": "2025-11-01",
  "centroCustoId": "centro-id-opcional",
  "usuariosAtivos": 1500,
  "transacoes": 45000
}
```

**Tipos de custo:**
- `COGS`: Cost of Goods Sold (custos variáveis de entrega)
- `OPEX`: Operational Expenses (custos fixos operacionais)
- `CAC`: Customer Acquisition Cost (geralmente via marketing_costs)

**Exemplos de COGS:**
- Infraestrutura cloud (AWS, Google Cloud)
- APIs de terceiros (Stripe, SendGrid)
- CDN e storage
- Custos de processamento

**Exemplos de OPEX:**
- Salários
- Aluguel de escritório
- Software e licenças
- Serviços profissionais

### 3. Movimentos de MRR

**Endpoint:** `POST /api/mrr-movements` (você precisa criar este endpoint)

```json
{
  "tipo": "NOVO",
  "clienteId": "cliente-xyz",
  "valor": 299.00,
  "data": "2025-11-15",
  "mes": 11,
  "ano": 2025,
  "produtoId": "produto-pro",
  "mrrAnterior": 0,
  "mrrNovo": 299.00,
  "observacoes": "Novo cliente - Plano Pro"
}
```

**Tipos de movimento:**
- `NOVO`: Novo cliente
- `EXPANSION`: Upgrade/upsell
- `CONTRACTION`: Downgrade
- `CHURN`: Cancelamento
- `REATIVACAO`: Cliente que voltou

### 4. Health Score de Clientes

**Endpoint:** `POST /api/customer-health` (você precisa criar este endpoint)

```json
{
  "clienteId": "cliente-abc",
  "healthScore": "BOM",
  "scoreNumerico": 75,
  "usoProduto": 80,
  "nps": 8,
  "ticketsAbertos": 1,
  "diasSemUso": 2,
  "riscoPagamento": false,
  "observacoes": "Cliente engajado, uso consistente"
}
```

### 5. Projetos de Agência

**Endpoint:** `POST /api/agency-projects` (você precisa criar este endpoint)

```json
{
  "nome": "Redesign Website Cliente XYZ",
  "clienteId": "cliente-xyz",
  "status": "EM_ANDAMENTO",
  "dataInicio": "2025-11-01",
  "dataPrevisao": "2025-12-15",
  "valorContratado": 45000.00,
  "horasEstimadas": 200,
  "horasRealizadas": 80,
  "horasFaturaveis": 75,
  "custoReal": 18000.00,
  "descricao": "Redesign completo do website"
}
```

### 6. Tickets de Suporte

**Endpoint:** `POST /api/support-tickets` (você precisa criar este endpoint)

```json
{
  "clienteId": "cliente-abc",
  "titulo": "Erro ao processar pagamento",
  "descricao": "Cliente reporta erro 500 ao tentar adicionar cartão",
  "prioridade": "ALTA",
  "status": "ABERTO",
  "dataAbertura": "2025-11-20T14:30:00Z",
  "responsavelId": "usuario-suporte-1"
}
```

### 7. Saldo de Caixa (Cash Balance)

**Endpoint:** `POST /api/cash-balances` (você precisa criar este endpoint)

```json
{
  "data": "2025-11-01",
  "mes": 11,
  "ano": 2025,
  "saldoInicial": 500000.00,
  "entradas": 180000.00,
  "saidas": 150000.00,
  "saldoFinal": 530000.00,
  "burnRate": 15000.00,
  "runwayMeses": 35,
  "observacoes": "Mês com entrada de investimento"
}
```

---

## Endpoints de Input a Criar

Para entrada manual de dados, você precisa criar os seguintes endpoints (similar aos endpoints de transações, clientes, etc.):

```javascript
// Marketing Costs
app.post('/api/marketing-costs', async (req, res) => { ... });
app.get('/api/marketing-costs', async (req, res) => { ... });

// Operational Costs
app.post('/api/operational-costs', async (req, res) => { ... });
app.get('/api/operational-costs', async (req, res) => { ... });

// MRR Movements
app.post('/api/mrr-movements', async (req, res) => { ... });
app.get('/api/mrr-movements', async (req, res) => { ... });

// Customer Health
app.post('/api/customer-health', async (req, res) => { ... });
app.get('/api/customer-health', async (req, res) => { ... });
app.put('/api/customer-health/:id', async (req, res) => { ... });

// Agency Projects
app.post('/api/agency-projects', async (req, res) => { ... });
app.get('/api/agency-projects', async (req, res) => { ... });
app.put('/api/agency-projects/:id', async (req, res) => { ... });

// Support Tickets
app.post('/api/support-tickets', async (req, res) => { ... });
app.get('/api/support-tickets', async (req, res) => { ... });
app.put('/api/support-tickets/:id', async (req, res) => { ... });

// Cash Balances
app.post('/api/cash-balances', async (req, res) => { ... });
app.get('/api/cash-balances', async (req, res) => { ... });
```

---

## Glossário de Métricas

| Métrica | Fórmula | Benchmark |
|---------|---------|-----------|
| **ARR** | MRR × 12 | - |
| **MRR** | Soma receitas recorrentes mensais | Crescimento > 10% MoM |
| **NRR** | (MRR Base - Churn - Contraction + Expansion) / MRR Base | ≥ 110% |
| **GRR** | (MRR Base - Churn - Contraction) / MRR Base | ≥ 95% |
| **Churn Rate** | MRR Churn / MRR Anterior | B2B < 5%, B2C < 7% |
| **ARPA** | MRR / Clientes Ativos | Depende do segmento |
| **LTV** | ARPA / Churn Rate | - |
| **CAC** | Custos Marketing / Novos Clientes | - |
| **LTV:CAC** | LTV / CAC | 3-5x (5x+ excelente) |
| **Payback** | CAC / ARPA | < 12 meses |
| **Magic Number** | Net New MRR / S&M Spend | > 1.0 |
| **Rule of 40** | Growth % + Margin % | ≥ 40% |
| **Margem Bruta** | (Receita - COGS) / Receita | SaaS > 70% |
| **DSO** | (AR / Receitas) × Dias | < 30 dias |
| **Utilização** | Horas Faturáveis / Horas Trabalhadas | > 80% |

---

## Suporte

Para dúvidas sobre as métricas ou implementação, consulte:
- [Documentação de Autenticação](AUTENTICACAO.md)
- [Documentação de Dashboards](DASHBOARDS.md)
- [Guia de Instalação](INSTALACAO_EASYPANEL.md)
