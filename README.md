# 💰 Sistema Financeiro - SisFin

API REST completa para gerenciamento financeiro com Prisma ORM, Express.js e PostgreSQL. Suporta transações, produtos, clientes e metas financeiras.

**✨ Features:**
- 🔐 API REST completa com Express.js
- 📊 Gestão de transações (receitas e despesas)
- 👥 Gerenciamento de clientes
- 📦 Catálogo de produtos e serviços
- 🎯 Sistema de metas financeiras
- 📈 Centros de custo personalizáveis
- 🔄 Suporte a transações recorrentes (MRR)
- 🐳 Docker pronto para produção
- 🚀 Deploy fácil no Easypanel

---

## 🚀 Início Rápido

### Opção 1: Desenvolvimento Local (Recomendado)

```bash
# 1. Clonar repositório
git clone <seu-repositorio>
cd sisfin

# 2. Instalar dependências
npm install

# 3. Configurar banco de dados
cp .env.example .env
# Edite .env com suas credenciais PostgreSQL

# 4. Gerar Prisma Client e rodar migrations
npm run prisma:generate
npm run prisma:migrate

# 5. Iniciar servidor
npm run dev

# 🎉 API rodando em http://localhost:3000
```

### Opção 2: Docker (Produção-ready)

```bash
# Iniciar tudo com docker-compose
docker-compose up -d

# 🎉 API rodando em http://localhost:3000
# PostgreSQL em localhost:5432
```

### Opção 3: Deploy no Easypanel

Veja o guia completo: [📖 EASYPANEL-DEPLOY.md](./EASYPANEL-DEPLOY.md)

---

## 🔌 API Endpoints

A API está documentada abaixo. Todas as respostas seguem o formato JSON.

### 🏥 Health & Info

```bash
GET  /              # Informações da API
GET  /health        # Health check
```

### 👤 Usuários

```bash
GET    /api/usuarios           # Listar todos
GET    /api/usuarios/:id       # Buscar por ID
POST   /api/usuarios           # Criar novo
PUT    /api/usuarios/:id       # Atualizar
DELETE /api/usuarios/:id       # Deletar
```

### 💼 Centros de Custo

```bash
GET    /api/centros-custo           # Listar todos
GET    /api/centros-custo/:id       # Buscar por ID
POST   /api/centros-custo           # Criar novo
PUT    /api/centros-custo/:id       # Atualizar
DELETE /api/centros-custo/:id       # Deletar
```

### 👥 Clientes

```bash
GET    /api/clientes           # Listar todos
GET    /api/clientes/:id       # Buscar por ID
POST   /api/clientes           # Criar novo
PUT    /api/clientes/:id       # Atualizar
DELETE /api/clientes/:id       # Deletar
```

### 📦 Produtos

```bash
GET    /api/produtos           # Listar todos
GET    /api/produtos/:id       # Buscar por ID
POST   /api/produtos           # Criar novo
PUT    /api/produtos/:id       # Atualizar
DELETE /api/produtos/:id       # Deletar
```

### 💸 Transações

```bash
GET    /api/transacoes           # Listar todas (paginado)
GET    /api/transacoes/resumo    # Resumo financeiro
GET    /api/transacoes/:id       # Buscar por ID
POST   /api/transacoes           # Criar nova
PUT    /api/transacoes/:id       # Atualizar
DELETE /api/transacoes/:id       # Deletar
```

### 🎯 Metas

```bash
GET    /api/metas                # Listar todas
GET    /api/metas/:id            # Buscar por ID
GET    /api/metas/:id/progresso  # Ver progresso da meta
POST   /api/metas                # Criar nova
PUT    /api/metas/:id            # Atualizar
DELETE /api/metas/:id            # Deletar
```

### 📖 Exemplos de Uso

**Criar uma transação:**

```bash
curl -X POST http://localhost:3000/api/transacoes \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "RECEITA",
    "valor": 1500.00,
    "descricao": "Pagamento Cliente X",
    "centroCustoId": "clxxx...",
    "metodoPagamento": "PIX",
    "statusPagamento": "PAGO"
  }'
```

**Obter resumo financeiro:**

```bash
curl "http://localhost:3000/api/transacoes/resumo?dataInicio=2024-01-01&dataFim=2024-01-31"
```

**Verificar progresso de meta:**

```bash
curl http://localhost:3000/api/metas/clxxx.../progresso
```

---

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

---

## 📝 Scripts Disponíveis

### Servidor
- `npm start` - Inicia servidor em produção
- `npm run dev` - Inicia servidor em modo desenvolvimento (hot reload)

### Prisma/Database
- `npm run prisma:generate` - Gera o Prisma Client
- `npm run prisma:migrate` - Cria/aplica migrations (desenvolvimento)
- `npm run prisma:migrate:deploy` - Aplica migrations (produção)
- `npm run prisma:studio` - Abre interface visual para gerenciar dados
- `npm run prisma:push` - Sincroniza schema sem criar migration
- `npm run prisma:seed` - Popula banco com dados iniciais

### Docker
- `npm run docker:build` - Builda imagem Docker
- `npm run docker:run` - Roda container Docker

---

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

---

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

---

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

---

## 🔒 Políticas de Deleção

- **CentroCusto**: Restrict (não pode deletar se houver transações)
- **Cliente**: SetNull (transações mantidas, referência removida)
- **Produto**: SetNull (transações mantidas, referência removida)
- **Meta com CentroCusto**: Cascade (metas deletadas junto com centro de custo)

---

## 📦 Tecnologias

### Backend
- **Node.js** v18+ - Runtime JavaScript
- **Express.js** v4 - Framework web minimalista
- **Prisma ORM** v5.22.0 - ORM moderno para Node.js
- **PostgreSQL** - Banco de dados relacional

### Segurança & Performance
- **Helmet** - Segurança HTTP headers
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - HTTP request logger
- **Rate Limiting** - Proteção contra abuse

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração local
- **Multi-stage builds** - Otimização de imagens

---

## 🏗️ Estrutura do Projeto

```
sisfin/
├── prisma/
│   └── schema.prisma           # Schema do banco de dados
├── src/
│   ├── config/
│   │   └── database.js         # Configuração Prisma
│   ├── controllers/            # Lógica de negócio
│   │   ├── usuario.controller.js
│   │   ├── centroCusto.controller.js
│   │   ├── cliente.controller.js
│   │   ├── produto.controller.js
│   │   ├── transacao.controller.js
│   │   └── meta.controller.js
│   ├── middlewares/            # Middlewares Express
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── routes/                 # Definição de rotas
│   │   ├── usuario.routes.js
│   │   ├── centroCusto.routes.js
│   │   ├── cliente.routes.js
│   │   ├── produto.routes.js
│   │   ├── transacao.routes.js
│   │   └── meta.routes.js
│   ├── utils/                  # Utilitários
│   │   ├── ApiError.js
│   │   └── asyncHandler.js
│   └── server.js               # Servidor Express
├── .env.example                # Exemplo de variáveis de ambiente
├── .env.production             # Variáveis para produção
├── docker-compose.yml          # Orquestração Docker
├── Dockerfile                  # Build da aplicação
├── EASYPANEL-DEPLOY.md         # Guia de deploy no Easypanel
├── package.json
└── README.md
```

---

## 🚢 Deploy

### Easypanel (Recomendado)

Veja o guia completo em [EASYPANEL-DEPLOY.md](./EASYPANEL-DEPLOY.md)

**Resumo:**
1. Crie banco PostgreSQL no Easypanel
2. Configure variáveis de ambiente
3. Deploy via Git ou Docker
4. ✅ Pronto!

### Outras Plataformas

Este projeto é compatível com:
- **Railway** - https://railway.app
- **Render** - https://render.com
- **Fly.io** - https://fly.io
- **DigitalOcean App Platform**
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Apps**

---

## 🔐 Segurança

### Implementado
- ✅ Helmet.js para headers HTTP seguros
- ✅ CORS configurável
- ✅ Rate limiting (100 req/15min por IP)
- ✅ Validação de dados
- ✅ Tratamento de erros do Prisma
- ✅ Health checks

### Próximos Passos (TODO)
- [ ] Autenticação JWT
- [ ] Hashing de senhas com bcrypt
- [ ] Roles e permissões (RBAC)
- [ ] API Keys
- [ ] Logging avançado (Winston/Pino)

---

## 🧪 Testing (TODO)

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 📚 Documentação Adicional

- [Prisma Schema](./prisma/schema.prisma) - Schema completo do banco
- [Deploy no Easypanel](./EASYPANEL-DEPLOY.md) - Guia passo a passo
- [API Endpoints](#-api-endpoints) - Documentação dos endpoints

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

ISC

---

## 📞 Suporte

- 📧 Email: [seu-email]
- 🐛 Issues: [GitHub Issues]
- 💬 Discussões: [GitHub Discussions]

---

**Desenvolvido com ❤️ usando Prisma ORM, Express.js e Node.js**
