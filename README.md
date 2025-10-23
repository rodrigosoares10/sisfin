# SISFIN - Sistema Financeiro API REST

API REST completa para gerenciamento financeiro desenvolvida com Node.js, TypeScript, Express e PostgreSQL.

## Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset JavaScript tipado
- **Express** - Framework web minimalista
- **TypeORM** - ORM para TypeScript/JavaScript
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização
- **Joi** - Validação de schemas
- **Bcrypt** - Hash de senhas
- **Helmet** - Segurança HTTP headers
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Proteção contra abuse

## Estrutura do Projeto

```
sisfin/
├── src/
│   ├── config/          # Configurações (DB, env, etc)
│   ├── entities/        # Entidades do TypeORM
│   ├── routes/          # Definição das rotas
│   ├── controllers/     # Controladores da aplicação
│   ├── services/        # Lógica de negócio
│   ├── middleware/      # Middlewares (auth, error, etc)
│   ├── utils/           # Utilitários (JWT, validators)
│   ├── types/           # Definições de tipos TypeScript
│   ├── app.ts           # Configuração do Express
│   └── main.ts          # Entry point da aplicação
├── .env.example         # Exemplo de variáveis de ambiente
├── docker-compose.yml   # Configuração Docker para PostgreSQL
├── package.json         # Dependências e scripts
└── tsconfig.json        # Configuração TypeScript
```

## Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd sisfin
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

### 4. Inicie o banco de dados (Docker)

```bash
docker-compose up -d
```

### 5. Execute a aplicação

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm run build
npm start
```

## Documentação da API

### Base URL

```
http://localhost:3000/api
```

---

## Autenticação

### POST /api/auth/register

Registra um novo usuário.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nome": "Nome do Usuário"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nome": "Nome do Usuário"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Usuário registrado com sucesso"
}
```

### POST /api/auth/login

Realiza login de usuário.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nome": "Nome do Usuário"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login realizado com sucesso"
}
```

### POST /api/auth/refresh

Atualiza o access token usando o refresh token.

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token atualizado com sucesso"
}
```

---

## Centros de Custo

**Todas as rotas requerem autenticação (Bearer Token)**

### GET /api/centros-custo

Lista todos os centros de custo.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Marketing",
      "descricao": "Despesas com marketing e publicidade",
      "ativo": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/centros-custo/:id

Obtém um centro de custo por ID.

### POST /api/centros-custo

Cria novo centro de custo.

**Body:**
```json
{
  "nome": "Marketing",
  "descricao": "Despesas com marketing e publicidade",
  "ativo": true
}
```

### PUT /api/centros-custo/:id

Atualiza um centro de custo.

**Body:**
```json
{
  "nome": "Marketing Digital",
  "descricao": "Marketing digital e redes sociais"
}
```

### DELETE /api/centros-custo/:id

Desativa um centro de custo (soft delete).

---

## Transações

**Todas as rotas requerem autenticação (Bearer Token)**

### GET /api/transacoes

Lista transações com filtros opcionais.

**Query Parameters:**
- `dataInicio` (opcional): Data início (YYYY-MM-DD)
- `dataFim` (opcional): Data fim (YYYY-MM-DD)
- `tipo` (opcional): receita | despesa
- `centroCustoId` (opcional): ID do centro de custo

**Exemplo:**
```
GET /api/transacoes?dataInicio=2024-01-01&dataFim=2024-01-31&tipo=receita
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tipo": "receita",
      "valor": "1500.00",
      "descricao": "Venda de produto",
      "data": "2024-01-15",
      "centroCustoId": 1,
      "centroCusto": {
        "id": 1,
        "nome": "Vendas"
      },
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

### GET /api/transacoes/resumo

Obtém resumo de receitas, despesas e lucro.

**Query Parameters:**
- `dataInicio` (opcional): Data início (YYYY-MM-DD)
- `dataFim` (opcional): Data fim (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "receitas": 15000.00,
    "despesas": 8000.00,
    "lucro": 7000.00,
    "periodo": {
      "inicio": "2024-01-01",
      "fim": "2024-01-31"
    }
  }
}
```

### GET /api/transacoes/:id

Obtém uma transação por ID.

### POST /api/transacoes

Cria nova transação.

**Body:**
```json
{
  "tipo": "receita",
  "valor": 1500.00,
  "descricao": "Venda de produto",
  "data": "2024-01-15",
  "centroCustoId": 1
}
```

### PUT /api/transacoes/:id

Atualiza uma transação.

### DELETE /api/transacoes/:id

Exclui uma transação.

---

## Produtos

**Todas as rotas requerem autenticação (Bearer Token)**

### GET /api/produtos

Lista todos os produtos.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Produto Premium",
      "descricao": "Assinatura mensal premium",
      "preco": 99.90,
      "precoRecorrente": 99.90,
      "ativo": true,
      "quantidadeEstoque": 100,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/produtos/mrr

Calcula o MRR (Monthly Recurring Revenue) total.

**Response:**
```json
{
  "success": true,
  "data": {
    "mrr": 4995.00,
    "totalProdutosRecorrentes": 50,
    "detalhes": [
      {
        "id": 1,
        "nome": "Produto Premium",
        "precoRecorrente": 99.90
      }
    ]
  }
}
```

### GET /api/produtos/:id

Obtém um produto por ID.

### POST /api/produtos

Cria novo produto.

**Body:**
```json
{
  "nome": "Produto Premium",
  "descricao": "Assinatura mensal premium",
  "preco": 99.90,
  "precoRecorrente": 99.90,
  "ativo": true,
  "quantidadeEstoque": 100
}
```

### PUT /api/produtos/:id

Atualiza um produto.

### DELETE /api/produtos/:id

Exclui um produto.

---

## Clientes

**Todas as rotas requerem autenticação (Bearer Token)**

### GET /api/clientes

Lista todos os clientes.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Cliente Exemplo",
      "email": "cliente@example.com",
      "telefone": "(11) 99999-9999",
      "cpfCnpj": "123.456.789-00",
      "endereco": "Rua Exemplo, 123",
      "ativo": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/clientes/:id

Obtém um cliente por ID.

### POST /api/clientes

Cria novo cliente.

**Body:**
```json
{
  "nome": "Cliente Exemplo",
  "email": "cliente@example.com",
  "telefone": "(11) 99999-9999",
  "cpfCnpj": "123.456.789-00",
  "endereco": "Rua Exemplo, 123",
  "ativo": true
}
```

### PUT /api/clientes/:id

Atualiza um cliente.

### DELETE /api/clientes/:id

Exclui um cliente.

---

## Dashboard

**Todas as rotas requerem autenticação (Bearer Token)**

### GET /api/dashboard/resumo

Obtém resumo do dashboard para um mês/ano específico.

**Query Parameters:**
- `mes` (opcional): Mês (1-12)
- `ano` (opcional): Ano (YYYY)

**Response:**
```json
{
  "success": true,
  "data": {
    "periodo": {
      "mes": 1,
      "ano": 2024
    },
    "financeiro": {
      "receitas": 50000.00,
      "despesas": 30000.00,
      "lucro": 20000.00,
      "totalTransacoes": 150
    },
    "estatisticas": {
      "totalClientes": 45,
      "totalProdutos": 12,
      "totalCentrosCusto": 8
    }
  }
}
```

### GET /api/dashboard/graficos

Obtém dados para gráficos.

**Query Parameters:**
- `periodo` (opcional): 7d | 30d | 90d | 1y (padrão: 30d)

**Response:**
```json
{
  "success": true,
  "data": {
    "periodo": {
      "inicio": "2023-12-01T00:00:00.000Z",
      "fim": "2024-01-01T00:00:00.000Z"
    },
    "transacoesPorDia": {
      "2024-01-01": {
        "receitas": 1500.00,
        "despesas": 800.00
      }
    },
    "porCentroCusto": {
      "Marketing": 5000.00,
      "Vendas": 15000.00
    },
    "totalReceitas": 50000.00,
    "totalDespesas": 30000.00
  }
}
```

---

## Relatórios

**Todas as rotas requerem autenticação (Bearer Token)**

### GET /api/relatorios/fluxo-caixa

Obtém relatório de fluxo de caixa detalhado.

**Query Parameters:**
- `dataInicio` (obrigatório): Data início (YYYY-MM-DD)
- `dataFim` (obrigatório): Data fim (YYYY-MM-DD)

**Exemplo:**
```
GET /api/relatorios/fluxo-caixa?dataInicio=2024-01-01&dataFim=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "periodo": {
      "inicio": "2024-01-01",
      "fim": "2024-01-31"
    },
    "fluxoDiario": [
      {
        "data": "2024-01-15",
        "tipo": "receita",
        "valor": 1500.00,
        "descricao": "Venda de produto",
        "centroCusto": "Vendas",
        "saldoAcumulado": 1500.00
      }
    ],
    "resumo": {
      "totalReceitas": 50000.00,
      "totalDespesas": 30000.00,
      "saldoFinal": 20000.00
    }
  }
}
```

---

## Tratamento de Erros

Todas as respostas de erro seguem o formato:

```json
{
  "success": false,
  "error": "Mensagem de erro",
  "details": ["Detalhes adicionais (se houver)"]
}
```

**Códigos de Status HTTP:**

- `200` - OK
- `201` - Created
- `400` - Bad Request (validação)
- `401` - Unauthorized (autenticação)
- `404` - Not Found
- `500` - Internal Server Error

---

## Segurança

- **JWT Authentication**: Todas as rotas (exceto auth) requerem token
- **Helmet**: Proteção de headers HTTP
- **Rate Limiting**: Limite de requisições por IP
- **CORS**: Configurado para origens permitidas
- **Bcrypt**: Hash de senhas com salt
- **Validação**: Joi schemas para validação de entrada

---

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# TypeORM
npm run typeorm

# Migrations
npm run migration:generate -- -n MigrationName
npm run migration:run
npm run migration:revert
```

---

## Variáveis de Ambiente

Veja o arquivo `.env.example` para todas as variáveis disponíveis.

---

## Licença

ISC

---

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## Contato

Desenvolvido por [Seu Nome]

Email: seu-email@example.com
