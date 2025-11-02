# 📊 Dashboards Completos - Documentação

Sistema completo de dashboards para análise financeira!

---

## ✅ DASHBOARDS DISPONÍVEIS

### **1. 📈 Resumo Geral**
**Endpoint:** `GET /api/dashboard/resumo?mes=1&ano=2024`

Visão geral das finanças.

**Parâmetros:**
- `mes` (opcional): Mês (1-12)
- `ano` (opcional): Ano (ex: 2024)
- Se não informados, retorna dados de todos os períodos

**Resposta:**
```json
{
  "periodo": "1/2024",
  "receitas": 15000.00,
  "despesas": 8000.00,
  "lucro": 7000.00,
  "totalTransacoes": 45
}
```

**Use para:**
- ✅ Visão geral rápida
- ✅ Card de resumo no dashboard
- ✅ Comparação mensal

---

### **2. 💰 MRR (Receita Recorrente Mensal)**
**Endpoint:** `GET /api/dashboard/mrr?mes=1&ano=2024`

Análise de receita recorrente mensal.

**Parâmetros:**
- `mes` (opcional): Mês (1-12) - padrão: mês atual
- `ano` (opcional): Ano - padrão: ano atual

**Resposta:**
```json
{
  "periodo": "11/2024",
  "totalMRR": 25000.00,
  "mrrProdutos": 20000.00,
  "mrrRecorrente": 5000.00,
  "clientesAtivos": 15,
  "ticketMedio": 1666.67
}
```

**Métricas:**
- `totalMRR`: Total de receita recorrente
- `mrrProdutos`: MRR de produtos tipo MRR
- `mrrRecorrente`: MRR de transações recorrentes mensais
- `clientesAtivos`: Clientes com MRR ativo
- `ticketMedio`: MRR / clientes ativos

**Use para:**
- ✅ Saúde do negócio SaaS
- ✅ Previsibilidade de receita
- ✅ Análise de churn
- ✅ Crescimento sustentável

---

### **3. 👥 Dashboard por Cliente**
**Endpoint:** `GET /api/dashboard/por-cliente?mes=1&ano=2024&limit=10`

Análise de receita por cliente.

**Parâmetros:**
- `mes` (opcional): Mês
- `ano` (opcional): Ano
- `limit` (opcional): Limite de clientes (padrão: todos)

**Resposta:**
```json
{
  "periodo": "1/2024",
  "clientes": [
    {
      "cliente": {
        "id": "...",
        "nome": "Empresa ABC",
        "email": "contato@abc.com",
        "tipo": "PESSOA_JURIDICA"
      },
      "receita": 12000.00,
      "totalTransacoes": 8
    }
  ]
}
```

**Use para:**
- ✅ Identificar clientes mais lucrativos
- ✅ Análise de relacionamento
- ✅ Segmentação de clientes
- ✅ Account management

---

### **4. 🏢 Dashboard por Centro de Custo**
**Endpoint:** `GET /api/dashboard/por-centro-custo?mes=1&ano=2024`

Análise por departamento/projeto.

**Parâmetros:**
- `mes` (opcional): Mês
- `ano` (opcional): Ano

**Resposta:**
```json
{
  "periodo": "1/2024",
  "centrosCusto": [
    {
      "centroCusto": {
        "id": "...",
        "nome": "Marketing",
        "cor": "#3B82F6"
      },
      "receitas": 50000.00,
      "despesas": 15000.00,
      "lucro": 35000.00,
      "totalTransacoes": 25
    }
  ]
}
```

**Use para:**
- ✅ Performance por departamento
- ✅ Alocação de recursos
- ✅ ROI por projeto
- ✅ Controle de custos

---

### **5. 📅 Evolução Temporal**
**Endpoint:** `GET /api/dashboard/evolucao?meses=6`

Evolução mês a mês.

**Parâmetros:**
- `meses` (opcional): Número de meses para retornar (padrão: 6)

**Resposta:**
```json
{
  "evolucao": [
    {
      "mes": 6,
      "ano": 2024,
      "periodo": "6/2024",
      "receitas": 10000.00,
      "despesas": 5000.00,
      "lucro": 5000.00
    },
    {
      "mes": 7,
      "ano": 2024,
      "periodo": "7/2024",
      "receitas": 12000.00,
      "despesas": 5500.00,
      "lucro": 6500.00
    }
  ]
}
```

**Use para:**
- ✅ Gráfico de linha temporal
- ✅ Identificar tendências
- ✅ Sazonalidade
- ✅ Crescimento mês a mês

---

### **6. 🏆 Top Clientes**
**Endpoint:** `GET /api/dashboard/top-clientes?limit=10&mes=1&ano=2024`

Ranking dos melhores clientes.

**Parâmetros:**
- `limit` (opcional): Top N clientes (padrão: 10)
- `mes` (opcional): Mês
- `ano` (opcional): Ano

**Resposta:**
```json
{
  "periodo": "1/2024",
  "topClientes": [
    {
      "cliente": {
        "id": "...",
        "nome": "Cliente VIP",
        "email": "vip@email.com",
        "tipo": "PESSOA_JURIDICA"
      },
      "receita": 50000.00,
      "transacoes": 15
    }
  ]
}
```

**Use para:**
- ✅ Identificar clientes VIP
- ✅ Programa de fidelidade
- ✅ Priorização de atendimento
- ✅ Upsell/Cross-sell

---

### **7. 💳 Status de Pagamento**
**Endpoint:** `GET /api/dashboard/status-pagamento?mes=1&ano=2024`

Análise por status de pagamento.

**Parâmetros:**
- `mes` (opcional): Mês
- `ano` (opcional): Ano

**Resposta:**
```json
{
  "periodo": "1/2024",
  "porStatus": {
    "PAGO": {
      "total": 50000.00,
      "receitas": 45000.00,
      "despesas": 5000.00,
      "transacoes": 30
    },
    "PENDENTE": {
      "total": 10000.00,
      "receitas": 8000.00,
      "despesas": 2000.00,
      "transacoes": 5
    },
    "ATRASADO": {
      "total": 5000.00,
      "receitas": 5000.00,
      "despesas": 0,
      "transacoes": 3
    }
  }
}
```

**Use para:**
- ✅ Controle de inadimplência
- ✅ Fluxo de caixa projetado
- ✅ Cobrança
- ✅ Saúde financeira

---

## 🎯 CASOS DE USO

### **Dashboard Executivo**
Combine vários endpoints:

```javascript
const [resumo, mrr, evolucao, topClientes] = await Promise.all([
  fetch('/api/dashboard/resumo'),
  fetch('/api/dashboard/mrr'),
  fetch('/api/dashboard/evolucao?meses=12'),
  fetch('/api/dashboard/top-clientes?limit=5')
]);
```

**Mostre:**
- Cards com métricas principais (resumo)
- MRR atual e ticket médio (mrr)
- Gráfico de evolução anual (evolucao)
- Lista dos 5 melhores clientes (topClientes)

---

### **Análise por Cliente**
Para análise detalhada de um cliente específico:

```javascript
// 1. Ver receita do cliente
const porCliente = await fetch('/api/dashboard/por-cliente');

// 2. Filtrar transações do cliente
const transacoes = await fetch(`/api/transacoes?clienteId=${clienteId}`);

// 3. Ver se tem MRR
const mrr = await fetch('/api/dashboard/mrr');
```

---

### **Relatório Mensal**
Para criar relatório mensal completo:

```javascript
const mes = 11;
const ano = 2024;

const [resumo, porCentro, statusPag, evolucao] = await Promise.all([
  fetch(`/api/dashboard/resumo?mes=${mes}&ano=${ano}`),
  fetch(`/api/dashboard/por-centro-custo?mes=${mes}&ano=${ano}`),
  fetch(`/api/dashboard/status-pagamento?mes=${mes}&ano=${ano}`),
  fetch(`/api/dashboard/evolucao?meses=3`)
]);
```

---

## 📊 EXEMPLOS DE GRÁFICOS

### **Gráfico de Linha - Evolução**
```javascript
const data = await fetch('/api/dashboard/evolucao?meses=12');

// Use Chart.js, Recharts, ou outro
const chartData = data.evolucao.map(item => ({
  mes: item.periodo,
  receitas: item.receitas,
  despesas: item.despesas,
  lucro: item.lucro
}));
```

### **Gráfico de Pizza - Centros de Custo**
```javascript
const data = await fetch('/api/dashboard/por-centro-custo');

const chartData = data.centrosCusto.map(item => ({
  name: item.centroCusto.nome,
  value: item.receitas,
  color: item.centroCusto.cor
}));
```

### **Gráfico de Barras - Top Clientes**
```javascript
const data = await fetch('/api/dashboard/top-clientes?limit=10');

const chartData = data.topClientes.map(item => ({
  cliente: item.cliente.nome,
  receita: item.receita
}));
```

---

## 🔧 FILTROS DISPONÍVEIS

Todos os endpoints suportam filtros por período:

```bash
# Mês específico
GET /api/dashboard/resumo?mes=11&ano=2024

# Ano inteiro (sem mes)
GET /api/dashboard/resumo?ano=2024

# Todos os períodos (sem parâmetros)
GET /api/dashboard/resumo
```

---

## 💡 DICAS DE IMPLEMENTAÇÃO

### **1. Cache**
Implemente cache para dashboards:

```javascript
// Cache por 5 minutos
const cacheTime = 5 * 60 * 1000;
let cachedData = null;
let cacheTimestamp = null;

async function getDashboard() {
  const now = Date.now();

  if (cachedData && (now - cacheTimestamp) < cacheTime) {
    return cachedData;
  }

  cachedData = await fetch('/api/dashboard/resumo');
  cacheTimestamp = now;
  return cachedData;
}
```

### **2. Loading States**
Sempre mostre loading enquanto carrega:

```javascript
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadDashboard() {
    setLoading(true);
    try {
      const data = await fetch('/api/dashboard/resumo');
      setDashboard(data);
    } finally {
      setLoading(false);
    }
  }
  loadDashboard();
}, []);
```

### **3. Error Handling**
Trate erros gracefully:

```javascript
try {
  const data = await fetch('/api/dashboard/resumo');
  setDashboard(data);
} catch (error) {
  console.error('Erro ao carregar dashboard:', error);
  setError('Não foi possível carregar os dados');
}
```

---

## 📈 MÉTRICAS IMPORTANTES

### **MRR (Monthly Recurring Revenue)**
- Receita previsível mensal
- Base para SaaS e assinaturas
- Crescimento sustentável

### **Ticket Médio**
- MRR / Clientes Ativos
- Indica valor por cliente
- Meta: aumentar ao longo do tempo

### **Lucro**
- Receitas - Despesas
- Saúde financeira
- Meta: sempre positivo

### **Taxa de Crescimento**
- (MRR atual - MRR anterior) / MRR anterior
- Mostra aceleração/desaceleração
- Meta: > 5-10% ao mês

---

## 🚀 PRÓXIMOS PASSOS

Para criar interface visual:

1. **Use Chart.js ou Recharts** para gráficos
2. **Implemente filtros** por período
3. **Adicione exportação** para PDF/Excel
4. **Crie alertas** para metas não atingidas
5. **Dashboards personalizados** por usuário

---

## 📝 EXEMPLO COMPLETO

```javascript
// Dashboard.jsx (React exemplo)
import { useState, useEffect } from 'react';

function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [mrr, setMRR] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboards() {
      try {
        const [resumoData, mrrData] = await Promise.all([
          fetch('/api/dashboard/resumo').then(r => r.json()),
          fetch('/api/dashboard/mrr').then(r => r.json())
        ]);

        setResumo(resumoData);
        setMRR(mrrData);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboards();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Dashboard Financeiro</h1>

      <div className="cards">
        <Card title="Receitas" value={resumo.receitas} />
        <Card title="Despesas" value={resumo.despesas} />
        <Card title="Lucro" value={resumo.lucro} />
        <Card title="MRR" value={mrr.totalMRR} />
      </div>

      <div className="charts">
        <EvolutionChart />
        <ClientsChart />
      </div>
    </div>
  );
}
```

---

## ✅ RESUMO

**7 Dashboards Completos:**
1. ✅ Resumo Geral
2. ✅ MRR (Receita Recorrente)
3. ✅ Por Cliente
4. ✅ Por Centro de Custo
5. ✅ Evolução Temporal
6. ✅ Top Clientes
7. ✅ Status de Pagamento

**Todos suportam:**
- ✅ Filtros por período
- ✅ Retorno em JSON
- ✅ Fácil integração com gráficos
- ✅ Performance otimizada

**Pronto para criar interfaces incríveis! 🎨**
