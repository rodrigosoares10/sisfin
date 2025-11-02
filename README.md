# 💰 Sistema Financeiro - SisFin

Sistema de gerenciamento financeiro com Prisma ORM, suportando transações, produtos, clientes e metas financeiras.

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

### Desenvolvimento Local

#### 1. Instalar Dependências
```bash
npm install
```

#### 2. Configurar Banco de Dados
Copie o arquivo `.env.example` para `.env` e configure sua connection string do PostgreSQL:
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/sisfin"
PORT=3000
```

#### 3. Gerar Cliente Prisma
```bash
npm run prisma:generate
```

#### 4. Criar Banco de Dados
```bash
npm run prisma:migrate
```

#### 5. Iniciar Servidor
```bash
npm start          # Produção
npm run dev        # Desenvolvimento (com hot reload)
```

#### 6. Visualizar Dados (Prisma Studio)
```bash
npm run prisma:studio
```

### 🌐 Deploy no EasyPanel

#### Passo 1: Criar Banco PostgreSQL
1. No EasyPanel, crie um novo serviço **PostgreSQL**
2. Anote a connection string fornecida

#### Passo 2: Criar Aplicação
1. Crie um novo **App** no EasyPanel
2. Conecte ao seu repositório GitHub
3. Configure as variáveis de ambiente:
   ```
   DATABASE_URL=postgresql://user:password@postgres:5432/sisfin
   PORT=3000
   ```

#### Passo 3: Configurar Deploy
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Port**: `3000`

O EasyPanel detectará automaticamente o `Dockerfile` e fará o build da aplicação.

#### Passo 4: Deploy
Faça push para o repositório e o EasyPanel fará o deploy automaticamente!

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

## 🔌 API REST

A aplicação expõe uma API REST completa para gerenciar o sistema financeiro.

### Endpoints Disponíveis

#### Informações Gerais
- `GET /` - Informações da API
- `GET /health` - Health check

#### Transações
- `GET /api/transacoes` - Listar todas as transações
- `POST /api/transacoes` - Criar nova transação

#### Clientes
- `GET /api/clientes` - Listar clientes ativos
- `POST /api/clientes` - Criar novo cliente

#### Produtos
- `GET /api/produtos` - Listar produtos ativos
- `POST /api/produtos` - Criar novo produto

#### Centros de Custo
- `GET /api/centros-custo` - Listar centros de custo ativos
- `POST /api/centros-custo` - Criar novo centro de custo

#### Metas
- `GET /api/metas` - Listar metas
- `POST /api/metas` - Criar nova meta

#### Dashboard
- `GET /api/dashboard/resumo?mes=1&ano=2024` - Resumo financeiro

### Exemplo de Uso

```bash
# Health check
curl http://localhost:3000/health

# Criar centro de custo
curl -X POST http://localhost:3000/api/centros-custo \
  -H "Content-Type: application/json" \
  -d '{"nome": "Marketing", "descricao": "Despesas de marketing"}'

# Criar transação
curl -X POST http://localhost:3000/api/transacoes \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "RECEITA",
    "valor": 1000.50,
    "descricao": "Venda de produto",
    "centroCustoId": "centro-id",
    "statusPagamento": "PAGO",
    "metodoPagamento": "PIX"
  }'
```

## 📝 Scripts Disponíveis

- `npm start` - Inicia servidor em produção
- `npm run dev` - Inicia servidor em modo desenvolvimento
- `npm run build` - Gera o Prisma Client
- `npm run prisma:generate` - Gera o Prisma Client
- `npm run prisma:migrate` - Cria/aplica migrations (dev)
- `npm run prisma:migrate:deploy` - Aplica migrations (produção)
- `npm run prisma:studio` - Abre interface visual para gerenciar dados
- `npm run prisma:push` - Sincroniza schema sem criar migration
- `npm run prisma:seed` - Popula banco com dados iniciais (quando implementado)

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

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web para API REST
- **Prisma ORM** - v5.22.0 - ORM moderno para Node.js
- **PostgreSQL** - Banco de dados relacional
- **Docker** - Containerização para deploy
- **EasyPanel** - Plataforma de deploy recomendada

## 📄 Licença

ISC

---

**Desenvolvido com Prisma ORM 💙**
