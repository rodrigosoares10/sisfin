# 🚀 Guia de Deploy no EasyPanel

Este guia detalha o processo completo de deploy do Sistema Financeiro no EasyPanel.

## 📋 Pré-requisitos

- Conta no EasyPanel (https://easypanel.io)
- Repositório GitHub com o código do projeto
- Acesso ao servidor EasyPanel

## 🗄️ Passo 1: Criar Banco de Dados PostgreSQL

### No EasyPanel:

1. Acesse seu projeto no EasyPanel
2. Clique em **"Create Service"** ou **"Add Service"**
3. Selecione **"PostgreSQL"**
4. Configure:
   - **Name**: `sisfin-db`
   - **Version**: 16 (ou mais recente)
   - **Database Name**: `sisfin`
   - **Username**: (mantenha o padrão ou personalize)
   - **Password**: (será gerado automaticamente ou defina um)

5. Clique em **"Create"**
6. Aguarde a criação do serviço
7. **Importante**: Copie a **Connection String** fornecida. Será algo como:
   ```
   postgresql://username:password@sisfin-db:5432/sisfin
   ```

## 🌐 Passo 2: Criar Aplicação Node.js

### No EasyPanel:

1. No mesmo projeto, clique em **"Create App"**
2. Selecione **"GitHub"** como fonte
3. Conecte sua conta GitHub (se ainda não conectou)
4. Selecione o repositório **sisfin**
5. Configure:
   - **Name**: `sisfin-api`
   - **Branch**: `main` (ou sua branch principal)
   - **Build Method**: `Dockerfile` (será detectado automaticamente)

## ⚙️ Passo 3: Configurar Variáveis de Ambiente

Na configuração da aplicação, adicione as variáveis de ambiente:

### Variáveis Obrigatórias:

```env
DATABASE_URL=postgresql://username:password@sisfin-db:5432/sisfin
PORT=3000
NODE_ENV=production
```

**Dicas:**
- Use a connection string do Passo 1 para `DATABASE_URL`
- Se o PostgreSQL estiver no mesmo projeto EasyPanel, use o nome interno: `sisfin-db`
- A porta `3000` é a padrão, mas pode ser alterada se necessário

## 🔧 Passo 4: Configurar Build e Deploy

### Build Configuration:

O EasyPanel detectará automaticamente o `Dockerfile` presente no projeto. Não é necessário configurar comandos de build manualmente.

Se preferir usar **Nixpacks** em vez de Docker:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Install Command**: `npm ci --only=production`

### Port Mapping:

- **Container Port**: `3000`
- **Public Port**: (escolha uma porta livre ou deixe o EasyPanel atribuir automaticamente)

## 🚀 Passo 5: Deploy

1. Clique em **"Deploy"** ou **"Save & Deploy"**
2. O EasyPanel irá:
   - Clonar o repositório
   - Executar o build usando Dockerfile
   - Instalar dependências
   - Gerar Prisma Client
   - Executar migrations (`prisma migrate deploy`)
   - Iniciar a aplicação

3. Aguarde o processo de build (pode levar alguns minutos)
4. Quando concluído, a aplicação estará disponível!

## ✅ Passo 6: Verificar Deploy

### Testar a API:

1. Acesse a URL fornecida pelo EasyPanel, por exemplo:
   ```
   https://sisfin-api.yourdomain.com
   ```

2. Teste os endpoints:

   **Health Check:**
   ```bash
   curl https://sisfin-api.yourdomain.com/health
   ```

   **API Info:**
   ```bash
   curl https://sisfin-api.yourdomain.com/
   ```

3. Você deve receber respostas JSON confirmando que a API está funcionando

## 🔄 Passo 7: Configurar Auto-Deploy (Opcional)

### Deploy Automático no Git Push:

1. Na configuração da aplicação no EasyPanel
2. Ative **"Auto Deploy"** ou **"Deploy on Push"**
3. Configure:
   - **Branch**: `main`
   - **Auto Deploy**: `Enabled`

Agora, toda vez que você fizer push para a branch configurada, o EasyPanel fará deploy automaticamente!

## 📊 Passo 8: Migrations e Dados Iniciais

### Executar Migrations Manualmente (se necessário):

Se as migrations não foram executadas automaticamente:

1. Acesse o **Terminal** da aplicação no EasyPanel
2. Execute:
   ```bash
   npx prisma migrate deploy
   ```

### Adicionar Dados Iniciais:

Para popular o banco com dados de exemplo:

1. No terminal da aplicação:
   ```bash
   npx prisma db seed
   ```

Ou crie dados via API:

```bash
# Criar centro de custo
curl -X POST https://sisfin-api.yourdomain.com/api/centros-custo \
  -H "Content-Type: application/json" \
  -d '{"nome": "Vendas", "descricao": "Receitas de vendas"}'
```

## 🔍 Monitoramento

### Logs:

- Acesse os **Logs** da aplicação no painel do EasyPanel
- Monitore erros e requisições
- Use filtros para encontrar problemas específicos

### Prisma Studio (Opcional):

Para gerenciar dados visualmente:

1. Execute Prisma Studio em uma instância temporária
2. Configure túnel SSH para acessar o banco
3. Ou use ferramentas como **pgAdmin**, **DBeaver**, **TablePlus**

## 🛠️ Troubleshooting

### Erro de Conexão com Banco:

- Verifique se `DATABASE_URL` está correta
- Confirme que PostgreSQL está rodando
- Teste conexão usando `psql` no terminal

### Build Falhou:

- Verifique logs de build no EasyPanel
- Confirme que `Dockerfile` está correto
- Verifique se todas as dependências estão no `package.json`

### Migrations Falharam:

```bash
# Reset migrations (⚠️ CUIDADO - apaga dados)
npx prisma migrate reset

# Criar nova migration
npx prisma migrate dev --name init

# Deploy migrations
npx prisma migrate deploy
```

### Aplicação não Inicia:

- Verifique se a porta está correta (`PORT=3000`)
- Confirme que `npm start` funciona localmente
- Verifique logs para erros de sintaxe

## 🔐 Segurança

### Recomendações:

1. **Nunca** commite arquivos `.env` no git
2. Use **variáveis de ambiente** do EasyPanel para secrets
3. Configure **HTTPS** (geralmente automático no EasyPanel)
4. Limite acesso ao PostgreSQL (use rede interna)
5. Configure **CORS** apropriadamente em produção

## 📚 Recursos Adicionais

- [Documentação do EasyPanel](https://easypanel.io/docs)
- [Documentação do Prisma - Deploy](https://www.prisma.io/docs/guides/deployment)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

## 🎉 Deploy Concluído!

Sua aplicação agora está rodando no EasyPanel! 🚀

Para suporte, consulte a documentação ou abra uma issue no repositório.
