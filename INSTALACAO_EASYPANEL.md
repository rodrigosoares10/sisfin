# 🚀 Como Instalar no EasyPanel - Guia Rápido

## ✅ O que você precisa ter antes

- Conta no EasyPanel
- Acesso ao seu servidor/projeto no EasyPanel
- Este repositório no GitHub

---

## 📝 Passo a Passo

### **1️⃣ Criar Banco de Dados PostgreSQL**

1. Entre no seu projeto no EasyPanel
2. Clique em **"+ Create"** → **"PostgreSQL"**
3. Preencha:
   - **Name**: `sisfin-db`
   - **Username**: (deixe o padrão)
   - **Password**: (será gerado automaticamente)
   - **Database**: `sisfin`
4. Clique em **"Create"**
5. ⚠️ **IMPORTANTE**: Anote a **Connection String** que aparece:
   ```
   postgresql://username:password@sisfin-db:5432/sisfin
   ```

---

### **2️⃣ Criar a Aplicação**

1. No mesmo projeto, clique em **"+ Create"** → **"App"**
2. Configure:

   **Source:**
   - **Type**: GitHub
   - **Repository**: Selecione `rodrigosoares10/sisfin`
   - **Branch**: `main` (ou a branch que você está usando)

   **Build:**
   - **Build Type**: `Dockerfile` (deve detectar automaticamente)
   - **Dockerfile Path**: `Dockerfile` (padrão)

---

### **3️⃣ Configurar Variáveis de Ambiente**

Na seção **Environment Variables**, adicione:

```
DATABASE_URL=postgresql://username:password@sisfin-db:5432/sisfin
PORT=3000
NODE_ENV=production
```

⚠️ **IMPORTANTE**: Use a Connection String que você copiou no Passo 1!

**Exemplo real:**
```
DATABASE_URL=postgresql://postgres:suasenha123@sisfin-db:5432/sisfin
PORT=3000
NODE_ENV=production
```

---

### **4️⃣ Configurar Porta**

Na seção **Ports**:
- **Container Port**: `3000`
- **Public Port**: (deixe o EasyPanel escolher ou escolha uma disponível)
- **Protocol**: HTTP

---

### **5️⃣ Deploy!**

1. Revise todas as configurações
2. Clique em **"Deploy"** ou **"Create & Deploy"**
3. Aguarde o build (leva 2-5 minutos)
4. Você verá o progresso no console

---

## ✅ Verificar se funcionou

Após o deploy completar, você receberá uma URL, algo como:
```
https://sisfin-api-xxxxx.easypanel.app
```

### Testar a API:

**1. Health Check:**
```bash
curl https://sua-url.easypanel.app/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2024-11-02T18:00:00.000Z",
  "service": "Sistema Financeiro API"
}
```

**2. Ver informações da API:**
```bash
curl https://sua-url.easypanel.app/
```

**3. Criar um centro de custo (teste completo):**
```bash
curl -X POST https://sua-url.easypanel.app/api/centros-custo \
  -H "Content-Type: application/json" \
  -d '{"nome": "Vendas", "descricao": "Receitas de vendas"}'
```

**4. Listar centros de custo:**
```bash
curl https://sua-url.easypanel.app/api/centros-custo
```

---

## 🔍 Checklist Final

- ✅ PostgreSQL criado e rodando
- ✅ Aplicação criada e conectada ao GitHub
- ✅ Variável `DATABASE_URL` configurada corretamente
- ✅ Porta 3000 exposta
- ✅ Deploy completado com sucesso
- ✅ Health check respondendo OK
- ✅ API criando e listando dados

---

## 📊 Endpoints Disponíveis

Após instalado, sua API terá:

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/health` | GET | Health check |
| `/` | GET | Informações da API |
| `/api/transacoes` | GET/POST | Transações |
| `/api/clientes` | GET/POST | Clientes |
| `/api/produtos` | GET/POST | Produtos |
| `/api/centros-custo` | GET/POST | Centros de custo |
| `/api/metas` | GET/POST | Metas |
| `/api/dashboard/resumo` | GET | Dashboard financeiro |

---

## ❌ Problemas Comuns

### Erro: "Cannot connect to database"
**Solução:** Verifique se:
- O PostgreSQL está rodando
- A `DATABASE_URL` está correta (usuário, senha, host, porta)
- O banco `sisfin` foi criado

### Erro: "Port already in use"
**Solução:**
- Mude a porta no EasyPanel
- Ou libere a porta 3000

### Build falhou
**Solução:**
- Veja os logs do build no EasyPanel
- Verifique se o Dockerfile está no repositório
- Confirme que o repositório está acessível

### Aplicação não inicia
**Solução:**
- Veja os logs da aplicação
- Verifique se as variáveis de ambiente estão corretas
- Confirme que `npm start` está configurado no package.json

---

## 🔄 Deploy Automático (Auto-Deploy)

Para que toda vez que você fizer push no GitHub a aplicação seja atualizada automaticamente:

1. Na configuração da aplicação no EasyPanel
2. Ative **"Auto Deploy"**
3. Selecione a branch (ex: `main`)
4. Pronto! Agora todo push fará deploy automaticamente 🎉

---

## 🎯 Próximos Passos

Após a instalação:

1. **Configure um domínio personalizado** (se quiser)
2. **Adicione HTTPS** (geralmente já vem configurado)
3. **Configure backup do PostgreSQL**
4. **Monitore os logs** para ver requisições
5. **Use o Prisma Studio** (se quiser gerenciar dados visualmente)

---

## 📞 Precisa de Ajuda?

- **Documentação completa**: Veja `DEPLOY.md`
- **API REST**: Veja `README.md`
- **EasyPanel Docs**: https://easypanel.io/docs

---

**✨ Instalação completa! Sua API está no ar! 🚀**
