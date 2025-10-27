# 💰 Sistema Financeiro Avançado - SisFin

Sistema completo de gestão financeira com recursos avançados: transações recorrentes, multi-moeda, notificações, anexos e controle de acesso granular.

## 🎉 Versão 2.0 - Recursos Avançados

Esta versão inclui recursos enterprise para um sistema financeiro robusto e completo.

## ✨ Recursos Avançados

### 1. 🔄 Transações Recorrentes
- Geração automática de transações em intervalos regulares
- Frequências: diária, semanal, mensal, anual e muito mais
- Agendamento via cron jobs
- Vínculo entre transação gerada e template

### 2. 🔔 Sistema de Notificações
- Alertas de contas a pagar/receber
- Notificações quando ultrapassar meta de centro de custo
- Resumo semanal/mensal por email
- Notificações in-app e por email
- Preferências configuráveis por usuário

### 3. 💱 Multi-Moeda
- Suporte para diferentes moedas (BRL, USD, EUR, etc.)
- Conversão automática com histórico de taxas
- Relatórios em moeda base
- Integração com API externa de câmbio

### 4. 📎 Anexos
- Upload de notas fiscais/comprovantes
- Armazenamento local ou cloud (S3)
- Múltiplos anexos por transação
- URLs assinadas para download seguro

### 5. 🔐 Controle de Acesso
- Perfis: Admin, Financeiro, Visualizador
- Permissões granulares por funcionalidade
- Override de permissões por usuário
- Middleware para proteção de rotas

### 6. 📋 Auditoria
- Registro automático de todas as ações
- Histórico de alterações (antes/depois)
- Rastreamento de IP e User-Agent

## 📋 Entidades do Sistema

### 1. **CentroCusto** (Centros de Custo Personalizáveis)
Organize suas finanças por departamentos, projetos ou categorias customizadas.
- Campos: id, nome, descrição, cor (para UI), status ativo
- Suporta múltiplas transações e metas

### 2. **Transacao** (Transações Financeiras)
Registro completo de receitas e despesas.
- Tipos: RECEITA ou DESPESA
- Suporte a transações recorrentes (diária, semanal, mensal, etc.)
- Status de pagamento: PENDENTE, PAGO, ATRASADO, CANCELADO
- Métodos de pagamento: PIX, Cartão, Boleto, Transferência, etc.
- Relacionamentos opcionais com Cliente e Produto
- Suporte a anexos (comprovantes)

### 3. **Produto** (Produtos e Serviços)
Catálogo de produtos e serviços oferecidos.
- Tipos: UNICO (pagamento único) ou MRR (receita recorrente mensal)
- Controle de valor e status ativo

### 4. **Cliente** (Gestão de Clientes)
Cadastro completo de clientes.
- Tipos: Pessoa Física ou Jurídica
- Campos: nome, email, telefone, empresa
- Histórico de transações

### 5. **Usuario** (Usuários do Sistema)
Controle de acesso e autenticação.
- Roles: ADMIN, USUARIO, VISUALIZADOR
- Email único e senha criptografada

### 6. **Meta** (Metas Financeiras)
Defina metas mensais de receita, despesa ou lucro.
- Por centro de custo ou metas gerais
- Controle mensal/anual
- Tipos: RECEITA, DESPESA, LUCRO

## 🚀 Configuração Inicial

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados
Copie o arquivo `.env.example` para `.env` e configure sua connection string do PostgreSQL:
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/sisfin"
```

### 3. Gerar Cliente Prisma
```bash
npm run prisma:generate
```

### 4. Criar Banco de Dados
```bash
npm run prisma:migrate
```

### 5. Visualizar Dados (Prisma Studio)
```bash
npm run prisma:studio
```

## 📊 Índices e Otimizações

O schema inclui índices estratégicos para otimizar queries comuns:

### Transações
- `data` - Busca por período
- `tipo` - Filtro por RECEITA/DESPESA
- `statusPagamento` - Filtro por status
- `centroCustoId` - Busca por centro de custo
- `[data, tipo]` - Índice composto para relatórios
- `[centroCustoId, data]` - Relatórios por centro de custo e período

### Outros Modelos
- Índices em campos de busca frequente (email, nome, ativo)
- Índices únicos para prevenir duplicatas
- Índices compostos para queries complexas

## 🔗 Relacionamentos

```
Usuario (standalone)

CentroCusto
  ├── Transacao (many)
  └── Meta (many)

Cliente
  └── Transacao (many)

Produto
  └── Transacao (many)

Transacao
  ├── CentroCusto (required)
  ├── Cliente (optional)
  └── Produto (optional)

Meta
  └── CentroCusto (optional)
```

## 📝 Scripts Disponíveis

### Prisma
- `npm run prisma:generate` - Gera o Prisma Client
- `npm run prisma:migrate` - Cria/aplica migrations
- `npm run prisma:studio` - Abre interface visual para gerenciar dados
- `npm run prisma:push` - Sincroniza schema sem criar migration
- `npm run prisma:seed` - Popula banco com dados iniciais (quando implementado)

### Sistema
- `npm run init:system` - Inicializa permissões e moedas padrão
- `npm run jobs:start` - Inicia agendador de tarefas (cron jobs)
- `npm run examples` - Executa exemplos de uso dos recursos

## ⏰ Tarefas Agendadas (Cron Jobs)

Quando você executa `npm run jobs:start`, as seguintes tarefas são agendadas:

| Tarefa | Horário | Frequência |
|--------|---------|------------|
| Gerar transações recorrentes | 00:05 | Diária |
| Atualizar taxas de câmbio | 08:00 | Diária |
| Notificar transações vencendo | 09:00 | Diária |
| Notificar transações vencidas | 10:00 | Diária |
| Verificar metas | 11:00 | Diária |
| Resumo semanal | 09:00 | Segunda-feira |
| Resumo mensal | 09:00 | Dia 1 do mês |

## 💡 Guia Rápido

### Criar Transação Recorrente

```javascript
const recorrenteService = require('./src/services/recorrenteService');

const recorrente = await recorrenteService.criar({
  tipo: 'DESPESA',
  valor: 1500.00,
  descricao: 'Aluguel do escritório',
  frequencia: 'MENSAL',
  dataInicio: new Date('2024-01-05'),
  diaVencimento: 5,
  metodoPagamento: 'BOLETO',
  centroCustoId: 'centro-custo-id'
});
```

### Converter Moedas

```javascript
const moedaService = require('./src/services/moedaService');

const valorBRL = await moedaService.converter(100, 'USD', 'BRL');
```

### Upload de Anexo

```javascript
const anexoService = require('./src/services/anexoService');

const anexo = await anexoService.upload({
  transacaoId: 'transacao-id',
  tipo: 'NOTA_FISCAL',
  arquivo: fileObject,
  descricao: 'Nota fiscal do fornecedor'
});
```

### Verificar Permissão

```javascript
const permissaoMiddleware = require('./src/middleware/permissaoMiddleware');

const temPermissao = await permissaoMiddleware.verificarPermissao(
  'usuario-id',
  'TRANSACAO_CRIAR'
);
```

## 📚 Documentação Completa

Para documentação detalhada de todos os recursos avançados, consulte:

**[📖 Documentação Completa de Recursos Avançados](docs/RECURSOS_AVANCADOS.md)**

Incluindo:
- Guias detalhados de cada recurso
- Exemplos de código
- Modelos de dados
- Configurações avançadas
- Integrações com serviços externos (S3, APIs de câmbio, SMTP)

## 🎯 Casos de Uso

### 1. Gestão de Fluxo de Caixa
- Registre receitas e despesas
- Organize por centros de custo
- Acompanhe status de pagamento

### 2. Receita Recorrente (MRR)
- Produtos tipo MRR
- Transações recorrentes automáticas
- Previsibilidade de receita

### 3. Gestão de Clientes
- Histórico financeiro por cliente
- Análise de receita por cliente
- Controle de inadimplência

### 4. Metas e KPIs
- Defina metas mensais
- Compare realizado vs meta
- Análise por centro de custo

## 🔒 Políticas de Deleção

- **CentroCusto**: Restrict (não pode deletar se houver transações)
- **Cliente**: SetNull (transações mantidas, referência removida)
- **Produto**: SetNull (transações mantidas, referência removida)
- **Meta com CentroCusto**: Cascade (metas deletadas junto com centro de custo)

## 📦 Tecnologias

- **Prisma ORM** - v5.22.0
- **PostgreSQL** - Banco de dados relacional
- **Node.js** - Runtime JavaScript

## 📄 Licença

ISC

---

**Desenvolvido com Prisma ORM 💙**
