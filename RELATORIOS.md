# Sistema de Relatórios Financeiros

## Visão Geral

O SisFin agora inclui um sistema completo de relatórios financeiros com 5 tipos diferentes de análises, visualizações interativas e capacidade de exportação para PDF e Excel.

## Tipos de Relatórios

### 1. DRE (Demonstração do Resultado do Exercício)
**Endpoint:** `/api/relatorios/dre`

Demonstra o resultado financeiro através da análise de receitas e despesas.

**Métricas incluídas:**
- Receita Operacional
- Receitas por Categoria (com percentuais)
- Despesas por Categoria (com percentuais)
- Lucro Bruto e Margem Bruta
- Lucro Operacional e Margem Operacional
- Lucro Líquido e Margem Líquida

**Visualizações:**
- Gráficos de pizza para receitas e despesas por categoria
- Tabela de indicadores financeiros com margens

### 2. Fluxo de Caixa
**Endpoint:** `/api/relatorios/fluxo-caixa`

Analisa o movimento de entradas e saídas de caixa no período.

**Métricas incluídas:**
- Saldo Inicial
- Total de Entradas
- Total de Saídas
- Saldo Final
- Fluxo Mensal (entradas, saídas e saldo por mês)
- Detalhamento de entradas e saídas

**Visualizações:**
- Gráfico de barras com fluxo mensal comparativo
- Tabelas com últimas entradas e saídas

### 3. Análise por Centro de Custo
**Endpoint:** `/api/relatorios/centro-custo`

Analisa receitas, despesas e resultado por centro de custo.

**Métricas incluídas:**
- Total de Centros de Custo ativos
- Receitas e Despesas por Centro
- Resultado por Centro
- Percentual de participação
- Número de transações

**Visualizações:**
- Gráfico de barras comparativo por centro de custo
- Tabela detalhada com todas as métricas

### 4. Relatório de Produtos/Vendas
**Endpoint:** `/api/relatorios/produtos`

Analisa o desempenho de vendas por produto.

**Métricas incluídas:**
- Total de Produtos
- Quantidade de Vendas por Produto
- Valor Total de Vendas
- Ticket Médio
- Percentual de Vendas
- Vendas Mensais (quantidade e valor)

**Visualizações:**
- Gráfico de linha com evolução mensal
- Tabela detalhada por produto com badges de tipo (MRR/ÚNICO)

### 5. Relatório de Clientes
**Endpoint:** `/api/relatorios/clientes`

Analisa o comportamento de compra dos clientes.

**Métricas incluídas:**
- Total de Clientes Ativos
- Quantidade de Compras por Cliente
- Valor Total e Ticket Médio
- Novos Clientes no período
- Receitas Mensais com número de clientes
- Data da última compra

**Visualizações:**
- Gráfico de barras com receitas mensais
- Tabela detalhada por cliente com badges de tipo (PF/PJ)

## Funcionalidades

### Seleção de Período
- Date picker com seleção de intervalo
- Visualização em português (pt-BR)
- Período padrão: último mês

### Filtros
Cada relatório aceita parâmetros opcionais:
- `from`: Data inicial (obrigatório)
- `to`: Data final (obrigatório)
- `centroCustoId`: Filtrar por centro de custo específico
- `produtoId`: Filtrar por produto específico
- `clienteId`: Filtrar por cliente específico

### Exportação

#### PDF
Usando **jsPDF** e **jspdf-autotable**:
- Cabeçalho com logo e informações
- Resumo executivo destacado
- Tabelas formatadas com cores
- Paginação automática
- Data de geração no rodapé

**Funções:**
- `exportDREtoPDF(data)`
- `exportCashFlowtoPDF(data)`
- `exportCostCentertoPDF(data)`
- `exportProductSalestoPDF(data)`
- `exportCustomertoPDF(data)`

#### Excel
Usando **xlsx**:
- Múltiplas abas por relatório
- Formatação de valores monetários
- Aba de resumo executivo
- Abas de detalhamento

**Funções:**
- `exportDREtoExcel(data)`
- `exportCashFlowtoExcel(data)`
- `exportCostCentertoExcel(data)`
- `exportProductSalestoExcel(data)`
- `exportCustomertoExcel(data)`

### Gráficos Interativos
Usando **Recharts**:
- Gráficos de Pizza (Pie Charts)
- Gráficos de Barras (Bar Charts)
- Gráficos de Linha (Line Charts)
- Tooltips formatados
- Legendas descritivas
- Responsivos

## Estrutura de Arquivos

```
src/
├── app/
│   ├── api/relatorios/
│   │   ├── dre/route.ts
│   │   ├── fluxo-caixa/route.ts
│   │   ├── centro-custo/route.ts
│   │   ├── produtos/route.ts
│   │   └── clientes/route.ts
│   ├── relatorios/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── reports/
│   │   ├── date-range-picker.tsx
│   │   ├── report-header.tsx
│   │   └── report-summary.tsx
│   └── ui/
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── label.tsx
│       ├── popover.tsx
│       ├── table.tsx
│       └── tabs.tsx
├── lib/
│   ├── export-pdf.ts
│   ├── export-excel.ts
│   ├── prisma.ts
│   └── utils.ts
└── types/
    └── index.ts
```

## Uso

### Acessar Relatórios

1. **Página Inicial:** `http://localhost:3000`
   - Cards com acesso rápido a cada tipo de relatório

2. **Página de Relatórios:** `http://localhost:3000/relatorios`
   - Tabs para alternar entre relatórios
   - Filtro de período
   - Botões de exportação

### API Direta

```typescript
// Exemplo: Buscar DRE
const response = await fetch('/api/relatorios/dre?from=2025-01-01&to=2025-01-31')
const data: DREData = await response.json()

// Exemplo: Buscar Fluxo de Caixa
const response = await fetch('/api/relatorios/fluxo-caixa?from=2025-01-01&to=2025-01-31')
const data: CashFlowData = await response.json()
```

### Exportar Programaticamente

```typescript
import { exportDREtoPDF, exportDREtoExcel } from '@/lib/export-pdf'
import { exportDREtoExcel } from '@/lib/export-excel'

// Exportar para PDF
exportDREtoPDF(dreData)

// Exportar para Excel
exportDREtoExcel(dreData)
```

## Configuração

### Variáveis de Ambiente
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sisfin"
```

### Instalação

```bash
# Instalar dependências
npm install

# Gerar Prisma Client
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Seed do banco (dados de exemplo)
npm run prisma:seed

# Iniciar servidor de desenvolvimento
npm run dev
```

### Acessar a aplicação
```
http://localhost:3000
```

## Tecnologias Utilizadas

- **Next.js 14:** Framework React com App Router
- **TypeScript:** Type safety
- **Prisma ORM:** Database abstraction
- **Tailwind CSS:** Utility-first CSS
- **Radix UI:** Accessible components
- **Recharts:** Data visualization
- **jsPDF:** PDF generation
- **jspdf-autotable:** PDF tables
- **xlsx:** Excel generation
- **date-fns:** Date manipulation
- **Lucide React:** Icons

## Considerações de Performance

### API Routes
- Queries otimizadas com Prisma
- Índices no banco de dados
- Filtros eficientes

### Frontend
- Lazy loading de componentes
- Memoização de cálculos pesados
- Virtualização de listas longas (futuro)

### Exportação
- Processamento client-side
- Geração assíncrona
- Feedback visual de progresso

## Próximos Passos (Opcional)

### Funcionalidades Futuras
- [ ] Envio de relatórios por email
- [ ] Agendamento de relatórios
- [ ] Comparação entre períodos
- [ ] Filtros avançados
- [ ] Relatórios customizados
- [ ] Dashboards interativos
- [ ] Métricas de churn e LTV
- [ ] Análise de cohort

### Melhorias
- [ ] Testes unitários e integração
- [ ] Otimização de queries
- [ ] Cache de relatórios
- [ ] Internacionalização (i18n)
- [ ] Dark mode

## Suporte

Para questões ou sugestões sobre o sistema de relatórios, consulte a documentação do projeto ou abra uma issue no repositório.
