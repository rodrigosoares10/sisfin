# SisFin - Sistema Financeiro RT Company

Sistema financeiro completo desenvolvido para a RT Company / WebChat CRM usando Node.js + Express no backend e React + TypeScript no frontend.

## Tecnologias Utilizadas

### Backend
- Node.js
- Express
- PostgreSQL
- Prisma ORM
- JWT (Autenticação)
- bcryptjs (Criptografia de senhas)

### Frontend
- React
- TypeScript
- TailwindCSS
- Recharts (Gráficos)
- Zustand (Gerenciamento de estado)
- React Router DOM
- Axios
- React Hot Toast

## Estrutura do Projeto

```
/sisfin
  /backend
    /prisma
      - schema.prisma
      - seed.js
    /src
      /config
        - database.js
      /controllers
        - authController.js
        - transactionController.js
        - accountController.js
        - categoryController.js
        - dashboardController.js
      /middleware
        - auth.js
        - errorHandler.js
      /routes
        - index.js
        - authRoutes.js
        - transactionRoutes.js
        - accountRoutes.js
        - categoryRoutes.js
        - dashboardRoutes.js
      - server.js
    - package.json
    - .env.example

  /frontend
    /src
      /components
        - Layout.tsx
        - Sidebar.tsx
        - Header.tsx
        - StatCard.tsx
        - Modal.tsx
        - Loading.tsx
      /pages
        - Login.tsx
        - Register.tsx
        - Dashboard.tsx
        - Transactions.tsx
        - Accounts.tsx
        - Categories.tsx
        - Goals.tsx
        - Settings.tsx
      /services
        - api.ts
        - authService.ts
        - transactionService.ts
        - accountService.ts
        - categoryService.ts
        - dashboardService.ts
      /stores
        - authStore.ts
      /types
        - index.ts
      - App.tsx
      - main.tsx
      - index.css
    - package.json
    - .env.example
```

## Instalação

### Pré-requisitos
- Node.js (v18 ou superior)
- PostgreSQL (v14 ou superior)
- npm ou yarn

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd sisfin
```

### 2. Configurar o Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar o arquivo .env com suas configurações
# DATABASE_URL="postgresql://usuario:senha@localhost:5432/sisfin?schema=public"
# JWT_SECRET="sua_chave_secreta_aqui"
# PORT=3000

# Gerar o Prisma Client
npm run prisma:generate

# Executar as migrations
npm run prisma:migrate

# Popular o banco de dados (opcional)
npm run prisma:seed
```

### 3. Configurar o Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar o arquivo .env
# VITE_API_URL=http://localhost:3000/api
```

## Executar o Projeto

### Backend (Terminal 1)

```bash
cd backend
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## Funcionalidades

### Autenticação
- ✅ Login de usuários
- ✅ Registro de novos usuários
- ✅ Autenticação JWT
- ✅ Proteção de rotas

### Dashboard
- ✅ Visão geral das finanças
- ✅ Estatísticas de receitas e despesas
- ✅ Gráfico de tendências mensais
- ✅ Transações recentes
- ✅ Top categorias de despesas

### Transações
- ✅ Listagem de transações
- ✅ Filtros por data, tipo, categoria
- ✅ Criação de novas transações
- ✅ Edição de transações
- ✅ Exclusão de transações
- ✅ Suporte para receitas, despesas e transferências

### Contas
- ✅ Listagem de contas
- ✅ Criação de novas contas
- ✅ Edição de contas
- ✅ Visualização de saldo total
- ✅ Tipos: Conta Corrente, Poupança, Investimento, Dinheiro, Cartão de Crédito

### Categorias
- ✅ Listagem de categorias
- ✅ Categorias de receita e despesa
- ✅ Criação de novas categorias
- ✅ Personalização com cores e ícones
- ✅ Estatísticas por categoria

### Metas Financeiras
- 🚧 Em desenvolvimento

### Configurações
- ✅ Edição de perfil
- ✅ Alteração de senha
- ✅ Gerenciamento de conta

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Obter perfil (autenticado)
- `PUT /api/auth/profile` - Atualizar perfil (autenticado)
- `PUT /api/auth/change-password` - Alterar senha (autenticado)

### Transações
- `GET /api/transactions` - Listar transações (autenticado)
- `GET /api/transactions/:id` - Obter transação (autenticado)
- `POST /api/transactions` - Criar transação (autenticado)
- `PUT /api/transactions/:id` - Atualizar transação (autenticado)
- `DELETE /api/transactions/:id` - Excluir transação (autenticado)
- `GET /api/transactions/stats` - Estatísticas (autenticado)

### Contas
- `GET /api/accounts` - Listar contas (autenticado)
- `GET /api/accounts/:id` - Obter conta (autenticado)
- `POST /api/accounts` - Criar conta (autenticado)
- `PUT /api/accounts/:id` - Atualizar conta (autenticado)
- `DELETE /api/accounts/:id` - Excluir conta (autenticado)

### Categorias
- `GET /api/categories` - Listar categorias (autenticado)
- `GET /api/categories/:id` - Obter categoria (autenticado)
- `POST /api/categories` - Criar categoria (autenticado)
- `PUT /api/categories/:id` - Atualizar categoria (autenticado)
- `DELETE /api/categories/:id` - Excluir categoria (autenticado)
- `GET /api/categories/stats` - Estatísticas (autenticado)

### Dashboard
- `GET /api/dashboard/overview` - Visão geral (autenticado)
- `GET /api/dashboard/monthly-trend` - Tendência mensal (autenticado)

## Credenciais Padrão (após seed)

```
Email: admin@rtcompany.com
Senha: admin123
```

## Scripts Disponíveis

### Backend
- `npm start` - Executar servidor em produção
- `npm run dev` - Executar servidor em desenvolvimento
- `npm run prisma:generate` - Gerar Prisma Client
- `npm run prisma:migrate` - Executar migrations
- `npm run prisma:studio` - Abrir Prisma Studio
- `npm run prisma:seed` - Popular banco de dados

### Frontend
- `npm run dev` - Executar em desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build

## Licença

MIT

## Autor

RT Company - WebChat CRM

---

**SisFin** - Sistema Financeiro Completo
