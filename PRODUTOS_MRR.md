# Gestão de Produtos e MRR

## Visão Geral

Este módulo implementa a gestão completa de produtos e o cálculo de MRR (Monthly Recurring Revenue) para o sistema financeiro SisFin.

## Funcionalidades Implementadas

### 1. Página de Produtos (`/produtos`)

#### Tabela de Produtos
A tabela exibe todos os produtos cadastrados com as seguintes informações:

- **Nome**: Identificação do produto
- **Tipo**:
  - `UNICO`: Produto de venda única
  - `MRR`: Produto de receita recorrente mensal
- **Valor**: Preço do produto (com indicador "/mês" para produtos MRR)
- **Status**: Ativo ou Inativo
- **Quantidade de Vendas**: Total de transações vinculadas ao produto
- **Receita Total Gerada**: Soma de todas as transações pagas vinculadas

#### Filtros
- **Todos**: Exibe todos os produtos
- **MRR**: Filtra apenas produtos recorrentes
- **Único**: Filtra apenas produtos de venda única

### 2. Dashboard de MRR

#### Card Principal - MRR Atual
- Exibe o valor total do MRR atual
- Mostra comparação com mês anterior (valor e percentual)
- Indicador visual de crescimento (↑) ou queda (↓)

#### Card de ARR (Annual Recurring Revenue)
- Cálculo automático: ARR = MRR × 12
- Previsão de receita anual baseada no MRR atual

#### Card de Assinaturas Ativas
- Contagem de produtos MRR que possuem transações
- Indicador de produtos ativos com vendas

#### Evolução Mensal
- Histórico dos últimos 6 meses de MRR
- Para cada mês:
  - Valor do MRR
  - Variação em relação ao mês anterior (valor e percentual)
  - Indicador visual de crescimento/queda

### 3. Cards de Resumo

- **Total de Produtos**: Quantidade total e produtos ativos
- **Produtos Recorrentes (MRR)**: Quantidade de produtos MRR
- **Receita Total Gerada**: Soma de toda receita de transações pagas

## Lógica de Cálculo de MRR

### MRR Atual
```
MRR Atual = Soma(valor de todos os produtos MRR ativos)
```

### Crescimento (MoM - Month over Month)
```
Crescimento = MRR Atual - MRR Anterior
Percentual = (Crescimento / MRR Anterior) × 100
```

### ARR (Annual Recurring Revenue)
```
ARR = MRR Atual × 12
```

### Assinaturas Ativas
Produtos MRR que possuem pelo menos uma transação paga vinculada.

## Vinculação com Vendas

### Como Funciona
Quando uma transação de receita é criada, ela pode ser vinculada a um produto através do campo `produtoId` no modelo `Transacao`.

### Impacto nas Métricas
- A receita da transação é contabilizada no **Receita Total** do produto
- Para produtos MRR, cada transação representa uma renovação/assinatura
- Produtos com transações são contados como **Assinaturas Ativas**

### Atualização Automática
Todas as métricas são recalculadas em tempo real:
- Ao acessar a página `/produtos`
- Quando há mudanças nos produtos ou transações
- No carregamento do dashboard de MRR

## Estrutura de Arquivos

```
src/
├── app/
│   ├── api/
│   │   ├── produtos/
│   │   │   ├── route.ts          # CRUD de produtos
│   │   │   └── [id]/route.ts     # Operações por ID
│   │   └── mrr/
│   │       └── route.ts           # Cálculo de métricas MRR
│   ├── produtos/
│   │   └── page.tsx               # Página de produtos
│   ├── layout.tsx                 # Layout principal
│   ├── page.tsx                   # Página inicial
│   └── globals.css                # Estilos globais
├── components/
│   ├── ui/
│   │   ├── card.tsx               # Componente Card
│   │   ├── badge.tsx              # Componente Badge
│   │   ├── button.tsx             # Componente Button
│   │   └── table.tsx              # Componente Table
│   └── mrr-dashboard.tsx          # Dashboard de MRR
├── lib/
│   ├── prisma.ts                  # Cliente Prisma
│   └── utils.ts                   # Utilitários
└── types/
    └── index.ts                   # Tipos TypeScript
```

## API Endpoints

### GET `/api/produtos`
Lista todos os produtos com estatísticas.

**Query Parameters:**
- `tipo`: Filtrar por tipo (UNICO ou MRR)
- `ativo`: Filtrar por status (true ou false)

**Response:**
```json
[
  {
    "id": "string",
    "nome": "string",
    "tipo": "UNICO | MRR",
    "valor": number,
    "descricao": "string?",
    "ativo": boolean,
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "salesCount": number,
    "totalRevenue": number
  }
]
```

### POST `/api/produtos`
Cria um novo produto.

**Body:**
```json
{
  "nome": "string",
  "tipo": "UNICO | MRR",
  "valor": number,
  "descricao": "string?",
  "ativo": boolean
}
```

### GET `/api/produtos/[id]`
Obtém detalhes de um produto específico.

### PUT `/api/produtos/[id]`
Atualiza um produto existente.

### DELETE `/api/produtos/[id]`
Remove um produto.

### GET `/api/mrr`
Calcula e retorna métricas de MRR.

**Response:**
```json
{
  "currentMRR": number,
  "previousMRR": number,
  "growth": number,
  "growthPercentage": number,
  "arr": number,
  "activeSubscriptions": number,
  "monthlyEvolution": [
    {
      "month": "string",
      "mrr": number,
      "change": number,
      "changePercentage": number
    }
  ]
}
```

## Tipos de Dados

### Product
```typescript
type Product = {
  id: string
  nome: string
  tipo: 'UNICO' | 'MRR'
  valor: number
  descricao?: string | null
  ativo: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    transacoes: number
  }
  receitaTotal?: number
}
```

### MRRMetrics
```typescript
type MRRMetrics = {
  currentMRR: number
  previousMRR: number
  growth: number
  growthPercentage: number
  arr: number
  activeSubscriptions: number
  monthlyEvolution: {
    month: string
    mrr: number
    change: number
    changePercentage: number
  }[]
}
```

## Próximos Passos

### Melhorias Sugeridas

1. **Formulário de Produto**
   - Criar modal/página para adicionar/editar produtos
   - Validação de campos
   - Upload de imagens

2. **Integração com Transações**
   - Página de transações com seletor de produto
   - Histórico de transações por produto
   - Gráficos de vendas por produto

3. **Análises Avançadas**
   - Churn rate (taxa de cancelamento)
   - Customer Lifetime Value (CLV)
   - Cohort analysis
   - Previsão de receita

4. **Exportação**
   - Exportar relatórios em PDF/Excel
   - Dashboards customizáveis
   - Alertas por email

5. **Otimizações**
   - Cache de métricas MRR
   - Paginação na tabela de produtos
   - Filtros avançados (data, valor, etc.)

## Como Usar

1. Acesse a página inicial do sistema
2. Clique em "Acessar Produtos"
3. Visualize o dashboard de MRR no topo
4. Use os filtros para visualizar produtos por tipo
5. Analise as métricas de cada produto na tabela
6. Acompanhe a evolução mensal do MRR

## Observações

- Os valores monetários são formatados em BRL (R$)
- As datas seguem o formato brasileiro (dd/mm/yyyy)
- O MRR é calculado apenas para produtos ativos
- A receita total considera apenas transações com status "PAGO"
- A evolução mensal mostra os últimos 6 meses
