# 🔐 Sistema de Autenticação - Guia Completo

Este documento explica como funciona o sistema de login e como criar usuários.

---

## 🎯 O que foi Implementado

- ✅ Sistema de autenticação JWT (JSON Web Token)
- ✅ Registro de novos usuários
- ✅ Login com email e senha
- ✅ Senha criptografada com bcrypt
- ✅ Token com validade de 7 dias
- ✅ Middleware de autenticação
- ✅ Proteção de rotas
- ✅ Tela de login/registro
- ✅ Sistema de logout
- ✅ Níveis de acesso (ADMIN, USUARIO, VISUALIZADOR)

---

## 🚀 Como Criar o Primeiro Usuário ADMIN

### **Opção 1: Via API (Recomendado)**

Após fazer deploy no EasyPanel, crie o primeiro usuário admin via API:

```bash
curl -X POST https://sua-url.easypanel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Administrador",
    "email": "admin@minhaagencia.com",
    "senha": "senha-super-segura-123",
    "role": "ADMIN"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Usuário criado com sucesso",
  "usuario": {
    "id": "...",
    "nome": "Administrador",
    "email": "admin@minhaagencia.com",
    "role": "ADMIN",
    "ativo": true
  }
}
```

### **Opção 2: Via Prisma Studio**

1. Acesse o Prisma Studio:
   ```bash
   npm run prisma:studio
   ```

2. Vá em "usuarios"
3. Clique em "Add record"
4. Preencha os campos:
   - **nome**: Administrador
   - **email**: admin@minhaagencia.com
   - **senha**: Use um hash bcrypt (veja abaixo como gerar)
   - **role**: ADMIN
   - **ativo**: true

**Para gerar hash de senha:**
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('sua-senha-aqui', 10);
console.log(hash);
```

### **Opção 3: Via Tela de Registro**

1. Acesse: `https://sua-url.easypanel.app/login.html`
2. Clique em "Criar conta"
3. Preencha os dados
4. **IMPORTANTE:** O primeiro usuário criado pela tela será USUARIO, não ADMIN
5. Você precisa alterar manualmente para ADMIN no banco de dados

---

## 🔑 Como Funciona

### **1. Registro de Usuário**

**Endpoint:** `POST /api/auth/register`

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "role": "USUARIO"  // Opcional: ADMIN, USUARIO, VISUALIZADOR
}
```

**O que acontece:**
1. Valida se email já existe
2. Criptografa a senha com bcrypt
3. Cria usuário no banco
4. Retorna dados do usuário (sem a senha)

---

### **2. Login**

**Endpoint:** `POST /api/auth/login`

**Body:**
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Resposta:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "...",
    "nome": "João Silva",
    "email": "joao@email.com",
    "role": "USUARIO"
  }
}
```

**O que acontece:**
1. Busca usuário por email
2. Verifica se está ativo
3. Compara senha com hash
4. Gera token JWT válido por 7 dias
5. Retorna token e dados do usuário

---

### **3. Acessar Rotas Protegidas**

Para acessar rotas protegidas, envie o token no header:

```bash
curl -H "Authorization: Bearer SEU-TOKEN-AQUI" \
  https://sua-url.easypanel.app/api/auth/me
```

**Exemplo de resposta:**
```json
{
  "id": "...",
  "nome": "João Silva",
  "email": "joao@email.com",
  "role": "USUARIO",
  "ativo": true,
  "createdAt": "2024-11-02T...",
  "updatedAt": "2024-11-02T..."
}
```

---

## 🛡️ Níveis de Acesso

### **ADMIN** (Administrador)
- Acesso total ao sistema
- Pode ver e gerenciar usuários
- Pode criar outros admins

### **USUARIO** (Usuário Padrão)
- Pode usar todas as funcionalidades do sistema
- Não pode gerenciar outros usuários

### **VISUALIZADOR**
- Apenas visualização
- Não pode criar/editar/deletar

---

## 🔒 Rotas Protegidas

### **Rotas Públicas (Sem Autenticação)**
- `GET /` - Informações da API
- `GET /health` - Health check
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/configuracao` - Ver configurações
- `GET /uploads/*` - Arquivos públicos

### **Rotas Protegidas (Requer Token)**
- `GET /api/auth/me` - Ver usuário logado
- `GET /api/transacoes` - Listar transações
- `POST /api/transacoes` - Criar transação
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Criar cliente
- `GET /api/produtos` - Listar produtos
- `POST /api/produtos` - Criar produto
- `GET /api/centros-custo` - Listar centros de custo
- `POST /api/centros-custo` - Criar centro de custo
- `GET /api/metas` - Listar metas
- `POST /api/metas` - Criar meta
- `PUT /api/configuracao` - Atualizar configuração
- `POST /api/configuracao/upload-logo` - Upload de logo

### **Rotas Apenas ADMIN**
- `GET /api/usuarios` - Listar todos os usuários

---

## 💻 Interface Web

### **Tela de Login**

Acesse: `https://sua-url.easypanel.app/login.html`

**Features:**
- Login com email e senha
- Registro de novos usuários
- Toggle para mostrar/esconder senha
- Validações de formulário
- Mensagens de erro e sucesso
- Design moderno e responsivo

### **Dashboard (Protegido)**

Acesse: `https://sua-url.easypanel.app/`

**Features:**
- Só acessa se estiver logado
- Redireciona para login se não tiver token
- Mostra nome do usuário logado
- Botão de logout
- Todas as funcionalidades do sistema

---

## 🔐 Segurança

### **Senhas**
- Criptografadas com bcrypt (hash irreversível)
- Salt de 10 rounds
- Nunca retornadas em respostas da API

### **Tokens JWT**
- Assinados com chave secreta (JWT_SECRET)
- Válidos por 7 dias
- Contém: id, email, nome, role
- Verificados em cada requisição

### **Middleware**
- `authenticateToken`: Verifica se token é válido
- `requireAdmin`: Verifica se usuário é ADMIN
- `optionalAuth`: Autenticação opcional (não bloqueia)

---

## 📝 Variáveis de Ambiente

Adicione no EasyPanel:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
PORT=3000
JWT_SECRET=sua-chave-secreta-super-segura-aqui-troque-em-producao
```

**IMPORTANTE:** Troque `JWT_SECRET` por uma chave aleatória e segura em produção!

**Gerar chave segura:**
```bash
# Linux/Mac
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🧪 Testando Autenticação

### **1. Criar Usuário**
```bash
curl -X POST https://sua-url.easypanel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste",
    "email": "teste@email.com",
    "senha": "senha123"
  }'
```

### **2. Fazer Login**
```bash
curl -X POST https://sua-url.easypanel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "senha": "senha123"
  }'
```

**Copie o token da resposta!**

### **3. Acessar Rota Protegida**
```bash
curl -H "Authorization: Bearer SEU-TOKEN-AQUI" \
  https://sua-url.easypanel.app/api/auth/me
```

### **4. Criar Transação (Exemplo)**
```bash
curl -X POST https://sua-url.easypanel.app/api/transacoes \
  -H "Authorization: Bearer SEU-TOKEN-AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "RECEITA",
    "valor": 1000,
    "descricao": "Venda",
    "centroCustoId": "centro-id",
    "statusPagamento": "PAGO",
    "metodoPagamento": "PIX"
  }'
```

---

## ❓ Perguntas Frequentes

### **Como recuperar senha?**
No momento não há sistema de recuperação de senha. Um ADMIN pode:
1. Resetar a senha no banco de dados
2. Ou criar novo usuário para a pessoa

### **Como mudar role de usuário?**
Um ADMIN pode fazer UPDATE direto no banco ou via Prisma Studio:
```javascript
await prisma.usuario.update({
  where: { email: 'usuario@email.com' },
  data: { role: 'ADMIN' }
});
```

### **Token expirado, o que fazer?**
Fazer login novamente para obter novo token.

### **Como desativar um usuário?**
```javascript
await prisma.usuario.update({
  where: { email: 'usuario@email.com' },
  data: { ativo: false }
});
```

---

## 🚨 Troubleshooting

### **Erro: "Token não fornecido"**
- Certifique-se de enviar o header: `Authorization: Bearer TOKEN`

### **Erro: "Token inválido ou expirado"**
- Faça login novamente
- Verifique se JWT_SECRET está correto no servidor

### **Erro: "Email já cadastrado"**
- Use outro email
- Ou faça login com o email existente

### **Não consigo fazer login**
- Verifique email e senha
- Verifique se usuário está ativo no banco
- Veja logs do servidor para mais detalhes

---

## 📚 Arquivos Relacionados

- `src/middleware/auth.js` - Middleware de autenticação
- `src/index.js` - Endpoints de auth (linhas 90-246)
- `public/login.html` - Tela de login/registro
- `public/index.html` - Dashboard protegido
- `prisma/schema.prisma` - Modelo Usuario

---

## 🎉 Resumo

**Para começar a usar:**

1. **Deploy no EasyPanel** (seguir INSTALACAO_EASYPANEL.md)
2. **Criar primeiro usuário ADMIN** (via API ou Prisma Studio)
3. **Acessar** `https://sua-url.easypanel.app/login.html`
4. **Fazer login**
5. **Usar o sistema!**

**Tudo funciona automaticamente!** 🚀

- ✅ Tela de login funcional
- ✅ Registro de usuários
- ✅ Dashboard protegido
- ✅ Logout
- ✅ Tokens seguros
- ✅ Senhas criptografadas

**Pronto para produção!** 💪
