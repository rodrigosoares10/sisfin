# 🚀 Deploy no Easypanel - SisFin API

Guia completo para fazer deploy da API SisFin no Easypanel.

---

## 📋 Pré-requisitos

1. **Conta no Easypanel** - https://easypanel.io
2. **Repositório Git** (GitHub, GitLab ou Bitbucket)
3. **Código commitado** com Dockerfile na raiz do projeto

---

## 🗄️ Passo 1: Criar Banco de Dados PostgreSQL

1. Acesse seu projeto no Easypanel
2. Clique em **"Services"** → **"+ Add Service"**
3. Selecione **"PostgreSQL"**
4. Configure:
   - **Name**: `sisfin-postgres`
   - **Version**: `15` (ou mais recente)
   - **Database**: `sisfin`
   - **Username**: `postgres` (ou customize)
   - **Password**: `[gere uma senha forte]`
5. Clique em **"Create"**
6. ⚠️ **IMPORTANTE**: Anote a **Connection String** que será fornecida
   - Formato: `postgresql://user:password@host:5432/database`

---

## 🐳 Passo 2: Fazer Deploy da API

### Opção A: Deploy via Git (Recomendado)

1. No Easypanel, clique em **"+ Add Service"** → **"App"**
2. Configure:

   **Informações Básicas:**
   - **Name**: `sisfin-api`
   - **Source**: Selecione **"Git Repository"**
   - **Repository URL**: URL do seu repositório Git
   - **Branch**: `main` (ou sua branch principal)

   **Build Settings:**
   - **Build Type**: `Dockerfile`
   - **Dockerfile Path**: `./Dockerfile`
   - **Build Context**: `./`

   **Port Configuration:**
   - **Port**: `3000`

3. Clique em **"Environment Variables"** e adicione:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@sisfin-postgres:5432/sisfin?schema=public
CORS_ORIGIN=*
```

⚠️ **IMPORTANTE**:
- Substitua `DATABASE_URL` pela connection string do seu PostgreSQL
- Para `CORS_ORIGIN`, use `*` para desenvolvimento ou seu domínio específico para produção

4. Clique em **"Create"** para iniciar o deploy

---

### Opção B: Deploy via GitHub (com Auto-Deploy)

1. Conecte seu repositório GitHub ao Easypanel
2. Configure **Auto-Deploy** para fazer deploy automático a cada push
3. Siga os mesmos passos da Opção A para configurar variáveis de ambiente

---

## 🔧 Passo 3: Configurações Avançadas

### 3.1 Domínio Customizado

1. No serviço `sisfin-api`, vá em **"Domains"**
2. Clique em **"+ Add Domain"**
3. Digite seu domínio (ex: `api.seudominio.com`)
4. Configure o DNS do seu domínio:
   - **Tipo**: `CNAME`
   - **Host**: `api`
   - **Value**: URL fornecida pelo Easypanel
5. Aguarde propagação do DNS (pode levar até 24h)

### 3.2 SSL/HTTPS

O Easypanel configura SSL automaticamente via Let's Encrypt ✅

### 3.3 Health Checks

O Dockerfile já inclui health checks, mas você pode configurar no Easypanel:

- **Health Check Path**: `/health`
- **Health Check Interval**: `30s`
- **Health Check Timeout**: `3s`
- **Health Check Retries**: `3`

### 3.4 Resources (Recursos)

Configure os recursos de acordo com seu plano:

- **Memory**: Mínimo `512MB`, recomendado `1GB`
- **CPU**: Mínimo `0.5 vCPU`, recomendado `1 vCPU`

---

## 🔍 Passo 4: Verificar Deploy

### 4.1 Verificar Logs

1. Acesse o serviço `sisfin-api`
2. Clique em **"Logs"**
3. Você deve ver:

```
✅ Database connected successfully
╔═══════════════════════════════════════════╗
║   💰 SisFin API - Sistema Financeiro      ║
╠═══════════════════════════════════════════╣
║   🚀 Servidor rodando na porta 3000      ║
║   📝 Ambiente: production                 ║
╚═══════════════════════════════════════════╝
```

### 4.2 Testar Endpoints

Teste se a API está respondendo:

```bash
# Health Check
curl https://sua-url.easypanel.app/health

# Resposta esperada:
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}

# Endpoint raiz
curl https://sua-url.easypanel.app/

# Resposta esperada:
{
  "success": true,
  "message": "SisFin API - Sistema Financeiro",
  "version": "1.0.0",
  "status": "online"
}
```

---

## 📊 Passo 5: Gerenciar Banco de Dados

### Opção 1: Prisma Studio (Recomendado)

Para acessar o Prisma Studio e visualizar/editar dados:

1. Clone o repositório localmente
2. Configure o `.env` com a DATABASE_URL do Easypanel
3. Execute:

```bash
npm install
npm run prisma:studio
```

### Opção 2: Ferramenta SQL Externa

Use ferramentas como:
- **pgAdmin** - https://www.pgadmin.org/
- **DBeaver** - https://dbeaver.io/
- **TablePlus** - https://tableplus.com/

Configure a conexão usando a connection string do Easypanel.

---

## 🔄 Atualizações e Migrations

### Criar nova migration

```bash
# Localmente
npm run prisma:migrate

# Commitar e fazer push
git add .
git commit -m "feat: nova migration"
git push
```

As migrations serão aplicadas automaticamente no deploy (via `prisma migrate deploy` no Dockerfile).

---

## 🛠️ Troubleshooting

### Problema: Erro de conexão com banco de dados

**Solução:**
- Verifique se a `DATABASE_URL` está correta
- Certifique-se de que o serviço PostgreSQL está rodando
- Verifique se a porta 5432 está acessível

### Problema: Build falha

**Solução:**
- Verifique os logs de build no Easypanel
- Certifique-se de que todas as dependências estão no `package.json`
- Verifique se o Dockerfile está na raiz do projeto

### Problema: API não responde

**Solução:**
- Verifique os logs da aplicação
- Verifique se a porta 3000 está exposta
- Confirme que as variáveis de ambiente estão configuradas

### Problema: CORS errors

**Solução:**
- Configure `CORS_ORIGIN` com seu domínio frontend
- Exemplo: `CORS_ORIGIN=https://meu-app.com`
- Para múltiplos domínios: `CORS_ORIGIN=https://app1.com,https://app2.com`

---

## 📈 Monitoramento

### Logs

Acesse logs em tempo real no Easypanel:
1. Vá no serviço `sisfin-api`
2. Clique em **"Logs"**
3. Use filtros para buscar erros ou warnings

### Métricas

O Easypanel fornece métricas de:
- CPU Usage
- Memory Usage
- Network I/O
- Request Rate

---

## 🔒 Segurança

### Recomendações:

1. **Variáveis de Ambiente Sensíveis**
   - Nunca commite `.env` no Git
   - Use as variáveis de ambiente do Easypanel

2. **CORS**
   - Em produção, configure com domínios específicos
   - Evite usar `*` em produção

3. **Rate Limiting**
   - A API já tem rate limiting configurado (100 req/15min)
   - Ajuste conforme necessário em `src/server.js:33`

4. **PostgreSQL**
   - Use senhas fortes
   - Limite acesso apenas aos serviços necessários

---

## 💰 Custos

O Easypanel é self-hosted, você paga apenas pelo servidor:

- **VPS**: A partir de $5-10/mês (DigitalOcean, Hetzner, etc)
- **Easypanel**: Gratuito (self-hosted) ou planos pagos com features extras

---

## 📚 Recursos Úteis

- **Documentação Easypanel**: https://easypanel.io/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Express.js Docs**: https://expressjs.com/

---

## ✅ Checklist de Deploy

- [ ] PostgreSQL criado no Easypanel
- [ ] Connection string anotada
- [ ] Repositório Git conectado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] Health check respondendo
- [ ] Endpoints testados
- [ ] Domínio customizado configurado (opcional)
- [ ] SSL ativo
- [ ] Logs verificados

---

**🎉 Parabéns! Sua API SisFin está no ar!**

Se precisar de ajuda, consulte a documentação ou abra uma issue no repositório.
