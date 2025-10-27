# 📚 Recursos Avançados - Sistema Financeiro

Este documento descreve os recursos avançados implementados no sistema financeiro.

---

## 📋 Índice

1. [Transações Recorrentes](#1-transações-recorrentes)
2. [Sistema de Notificações](#2-sistema-de-notificações)
3. [Multi-Moeda](#3-multi-moeda)
4. [Anexos e Armazenamento](#4-anexos-e-armazenamento)
5. [Controle de Acesso](#5-controle-de-acesso)
6. [Auditoria](#6-auditoria)
7. [Cron Jobs](#7-cron-jobs)

---

## 1. Transações Recorrentes

Sistema completo para gerenciar transações que se repetem em intervalos regulares.

### Características

- ✅ Múltiplas frequências (diária, semanal, mensal, anual, etc.)
- ✅ Definição de data de início e fim
- ✅ Geração automática via cron job
- ✅ Vínculo entre transação gerada e template recorrente
- ✅ Suporte a multi-moeda

### Frequências Disponíveis

- `DIARIA` - Todo dia
- `SEMANAL` - Toda semana
- `QUINZENAL` - A cada 15 dias
- `MENSAL` - Todo mês (com dia específico)
- `BIMESTRAL` - A cada 2 meses
- `TRIMESTRAL` - A cada 3 meses
- `SEMESTRAL` - A cada 6 meses
- `ANUAL` - Todo ano

### Exemplo de Uso

```javascript
const recorrenteService = require('./src/services/recorrenteService');

// Criar transação recorrente mensal
const recorrente = await recorrenteService.criar({
  tipo: 'DESPESA',
  valor: 1500.00,
  descricao: 'Aluguel do escritório',
  frequencia: 'MENSAL',
  dataInicio: new Date('2024-01-05'),
  diaVencimento: 5, // Dia 5 de cada mês
  metodoPagamento: 'BOLETO',
  centroCustoId: 'centro-custo-id'
});

// Gerar transações manualmente
const geradas = await recorrenteService.gerarTransacoes();
```

### Modelo de Dados

```prisma
model TransacaoRecorrente {
  id              String
  tipo            TipoTransacao
  valor           Decimal
  frequencia      FrequenciaRecorrencia
  dataInicio      DateTime
  dataFim         DateTime? // Null = sem data fim
  diaVencimento   Int? // Dia do mês ou da semana
  ultimaGeracao   DateTime?
  proximaGeracao  DateTime
  // ... outros campos
}
```

---

## 2. Sistema de Notificações

Sistema completo de notificações in-app e por email.

### Tipos de Notificações

1. **Transações Vencendo** - Alerta X dias antes do vencimento
2. **Transações Vencidas** - Alerta de pagamentos atrasados
3. **Meta Ultrapassada** - Notifica quando meta de centro de custo é excedida
4. **Meta Atingida** - Notifica quando meta é alcançada
5. **Resumo Semanal** - Resumo financeiro da semana
6. **Resumo Mensal** - Resumo financeiro do mês
7. **Sistema** - Notificações gerais do sistema

### Preferências do Usuário

Cada usuário pode configurar suas preferências:

```javascript
{
  emailAtivo: true,              // Habilitar emails
  emailTransacaoVencendo: true,  // Email para transações vencendo
  emailTransacaoVencida: true,   // Email para transações vencidas
  emailMetaUltrapassada: true,   // Email para metas ultrapassadas
  emailResumoSemanal: false,     // Email de resumo semanal
  emailResumoMensal: true,       // Email de resumo mensal
  notificacaoApp: true,          // Notificações in-app
  diasAntesVencimento: 3,        // Quantos dias antes notificar
  horaResumo: 9                  // Hora do dia para resumos (0-23)
}
```

### Exemplo de Uso

```javascript
const notificacaoService = require('./src/services/notificacaoService');

// Criar notificação manual
await notificacaoService.criar({
  usuarioId: 'usuario-id',
  tipo: 'SISTEMA',
  titulo: 'Bem-vindo!',
  mensagem: 'Seu cadastro foi concluído.',
  metadata: { origem: 'sistema' }
});

// Verificar transações vencendo
await notificacaoService.notificarTransacoesVencendo();

// Verificar metas
await notificacaoService.verificarMetasCentroCusto();
```

### Integração com Email

Para integrar com serviço de email real, edite o método `enviarEmail` em `notificacaoService.js`:

```javascript
// Exemplo com Nodemailer
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

await transporter.sendMail({
  from: 'noreply@seudominio.com',
  to: destinatario,
  subject: assunto,
  html: corpo
});
```

---

## 3. Multi-Moeda

Suporte completo para múltiplas moedas com conversão automática.

### Características

- ✅ Gerenciamento de moedas
- ✅ Taxa de câmbio histórica
- ✅ Conversão automática
- ✅ Relatórios em moeda base
- ✅ Integração com API externa de câmbio

### Moedas Padrão

- BRL - Real Brasileiro (padrão)
- USD - Dólar Americano
- EUR - Euro
- GBP - Libra Esterlina
- JPY - Iene Japonês

### Exemplo de Uso

```javascript
const moedaService = require('./src/services/moedaService');

// Inicializar moedas padrão
await moedaService.inicializarMoedasPadrao();

// Criar moeda customizada
await moedaService.criarMoeda({
  codigo: 'ARS',
  nome: 'Peso Argentino',
  simbolo: '$',
  casasDecimais: 2
});

// Registrar taxa de câmbio
await moedaService.registrarTaxaCambio({
  codigoOrigem: 'USD',
  codigoDestino: 'BRL',
  taxa: 5.20,
  fonte: 'manual'
});

// Converter valor
const valorBRL = await moedaService.converter(100, 'USD', 'BRL');
// Resultado: 520.00

// Atualizar taxas via API
await moedaService.atualizarTaxasAutomaticamente();
```

### Criar Transação com Multi-Moeda

```javascript
const transacao = await prisma.transacao.create({
  data: {
    tipo: 'RECEITA',
    valor: 520.00,           // Valor convertido em BRL
    valorOriginal: 100.00,   // Valor original em USD
    taxaConversao: 5.20,
    moedaId: 'usd-id',
    // ... outros campos
  }
});
```

### API de Câmbio Externa

Configure a chave de API no `.env`:

```bash
EXCHANGE_RATE_API_KEY=sua-chave-aqui
```

Cadastre-se em: https://www.exchangerate-api.com/

---

## 4. Anexos e Armazenamento

Sistema para upload e gerenciamento de arquivos (notas fiscais, comprovantes, etc.).

### Características

- ✅ Upload de arquivos
- ✅ Armazenamento local ou S3
- ✅ Múltiplos anexos por transação
- ✅ Tipos de arquivo validados
- ✅ Estatísticas de armazenamento
- ✅ URLs assinadas (S3)

### Tipos de Anexo

- `NOTA_FISCAL` - Notas fiscais
- `COMPROVANTE` - Comprovantes de pagamento
- `CONTRATO` - Contratos
- `OUTRO` - Outros tipos

### Exemplo de Uso (Local)

```javascript
const anexoService = require('./src/services/anexoService');

// Inicializar
await anexoService.inicializar();

// Upload de arquivo
const anexo = await anexoService.upload({
  transacaoId: 'transacao-id',
  tipo: 'NOTA_FISCAL',
  arquivo: {
    originalname: 'nota.pdf',
    buffer: fileBuffer,
    size: 102400,
    mimetype: 'application/pdf'
  },
  descricao: 'Nota fiscal do fornecedor'
});

// Listar anexos
const anexos = await anexoService.listarPorTransacao('transacao-id');

// Deletar anexo
await anexoService.deletar(anexo.id);
```

### Configuração S3

Configure as variáveis de ambiente:

```bash
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu-bucket
```

Instale o SDK da AWS:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Use o método `uploadParaS3`:

```javascript
const anexo = await anexoService.uploadParaS3({
  transacaoId: 'transacao-id',
  tipo: 'NOTA_FISCAL',
  arquivo: arquivoMulter
});
```

---

## 5. Controle de Acesso

Sistema completo de permissões granulares por funcionalidade.

### Roles (Perfis)

1. **ADMIN** - Acesso total ao sistema
2. **FINANCEIRO** - Gerenciamento financeiro completo
3. **VISUALIZADOR** - Apenas visualização

### Permissões Disponíveis

#### Transações
- `TRANSACAO_CRIAR`
- `TRANSACAO_EDITAR`
- `TRANSACAO_DELETAR`
- `TRANSACAO_VISUALIZAR`

#### Centro de Custo
- `CENTRO_CUSTO_CRIAR`
- `CENTRO_CUSTO_EDITAR`
- `CENTRO_CUSTO_DELETAR`
- `CENTRO_CUSTO_VISUALIZAR`

#### Clientes
- `CLIENTE_CRIAR`
- `CLIENTE_EDITAR`
- `CLIENTE_DELETAR`
- `CLIENTE_VISUALIZAR`

#### Produtos
- `PRODUTO_CRIAR`
- `PRODUTO_EDITAR`
- `PRODUTO_DELETAR`
- `PRODUTO_VISUALIZAR`

#### Metas
- `META_CRIAR`
- `META_EDITAR`
- `META_DELETAR`
- `META_VISUALIZAR`

#### Relatórios
- `RELATORIO_FINANCEIRO`
- `RELATORIO_GERENCIAL`
- `RELATORIO_EXPORTAR`

#### Usuários
- `USUARIO_CRIAR`
- `USUARIO_EDITAR`
- `USUARIO_DELETAR`
- `USUARIO_VISUALIZAR`

#### Sistema
- `CONFIGURACOES_SISTEMA`
- `AUDITORIA_VISUALIZAR`

### Exemplo de Uso

```javascript
const permissaoMiddleware = require('./src/middleware/permissaoMiddleware');

// Verificar permissão
const temPermissao = await permissaoMiddleware.verificarPermissao(
  'usuario-id',
  'TRANSACAO_CRIAR'
);

// Listar permissões do usuário
const permissoes = await permissaoMiddleware.listarPermissoesUsuario('usuario-id');

// Conceder permissão
await permissaoMiddleware.concederPermissao(
  'usuario-id',
  'RELATORIO_GERENCIAL'
);

// Revogar permissão
await permissaoMiddleware.revogarPermissao(
  'usuario-id',
  'TRANSACAO_DELETAR'
);
```

### Uso em API Express

```javascript
const express = require('express');
const app = express();
const permissaoMiddleware = require('./src/middleware/permissaoMiddleware');

// Rota protegida
app.post('/api/transacoes',
  permissaoMiddleware.requerPermissao('TRANSACAO_CRIAR'),
  async (req, res) => {
    // Criar transação
  }
);

// Múltiplas permissões (OR)
app.get('/api/relatorios',
  permissaoMiddleware.requerQualquerPermissao([
    'RELATORIO_FINANCEIRO',
    'RELATORIO_GERENCIAL'
  ]),
  async (req, res) => {
    // Gerar relatório
  }
);

// Restrito por role
app.post('/api/usuarios',
  permissaoMiddleware.requerRole(['ADMIN']),
  async (req, res) => {
    // Criar usuário
  }
);
```

---

## 6. Auditoria

Registro automático de todas as ações importantes do sistema.

### Informações Registradas

- Usuário que executou a ação
- Tipo de ação (CREATE, UPDATE, DELETE, LOGIN, etc.)
- Entidade afetada
- Dados antes e depois da alteração
- IP e User-Agent
- Data/hora

### Modelo de Dados

```prisma
model AuditLog {
  id          String
  usuarioId   String?
  acao        String
  entidade    String
  entidadeId  String?
  dadosAntigos Json?
  dadosNovos   Json?
  ip          String?
  userAgent   String?
  createdAt   DateTime
}
```

### Exemplo de Uso

```javascript
// Registrar ação de auditoria
await prisma.auditLog.create({
  data: {
    usuarioId: req.user.id,
    acao: 'UPDATE',
    entidade: 'Transacao',
    entidadeId: transacao.id,
    dadosAntigos: transacaoAntiga,
    dadosNovos: transacaoNova,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  }
});

// Consultar logs
const logs = await prisma.auditLog.findMany({
  where: {
    entidade: 'Transacao',
    acao: 'DELETE'
  },
  orderBy: { createdAt: 'desc' },
  take: 100
});
```

---

## 7. Cron Jobs

Sistema de tarefas automatizadas que executam em horários programados.

### Tarefas Configuradas

| Tarefa | Horário | Frequência |
|--------|---------|------------|
| Gerar transações recorrentes | 00:05 | Diária |
| Notificar transações vencendo | 09:00 | Diária |
| Notificar transações vencidas | 10:00 | Diária |
| Verificar metas | 11:00 | Diária |
| Resumo semanal | 09:00 | Segunda-feira |
| Resumo mensal | 09:00 | Dia 1 do mês |
| Atualizar taxas de câmbio | 08:00 | Diária |

### Iniciar Cron Jobs

```bash
# Instalar dependência
npm install node-cron

# Iniciar agendador
node src/jobs/index.js
```

### Executar Tarefa Manualmente

```javascript
const cronScheduler = require('./src/jobs/cronScheduler');

// Executar geração de recorrentes
await cronScheduler.executarManual('recorrentes');

// Executar verificação de metas
await cronScheduler.executarManual('metas');

// Outras opções: 'vencendo', 'vencidas', 'resumo-semanal', 'resumo-mensal', 'taxas'
```

### Configurar Timezone

O timezone padrão é `America/Sao_Paulo`. Para alterar, edite `cronScheduler.js`:

```javascript
cron.schedule('0 9 * * *', async () => {
  // Tarefa
}, {
  timezone: 'America/New_York' // Alterar aqui
});
```

---

## 📦 Instalação de Dependências

```bash
# Dependências principais
npm install @prisma/client node-cron

# Dependências opcionais
npm install nodemailer              # Para emails
npm install @aws-sdk/client-s3      # Para S3
npm install @aws-sdk/s3-request-presigner  # Para URLs assinadas
npm install express multer          # Para API REST
npm install bcrypt jsonwebtoken     # Para autenticação
```

---

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sisfin"

# Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760  # 10MB em bytes

# AWS S3 (opcional)
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu-bucket

# Exchange Rate API (opcional)
EXCHANGE_RATE_API_KEY=sua-chave

# SMTP (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha
```

---

## 🚀 Próximos Passos

1. Execute as migrações do Prisma:
   ```bash
   npx prisma migrate dev --name recursos-avancados
   ```

2. Inicialize o sistema:
   ```bash
   node -e "
     const permissaoService = require('./src/services/permissaoService');
     const moedaService = require('./src/services/moedaService');

     (async () => {
       await permissaoService.inicializarSistema();
       await moedaService.inicializarMoedasPadrao();
       console.log('✓ Sistema inicializado');
     })();
   "
   ```

3. Inicie os cron jobs:
   ```bash
   node src/jobs/index.js
   ```

4. Execute os exemplos:
   ```bash
   node examples/api-examples.js
   ```

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte os exemplos em `examples/api-examples.js`
2. Revise o schema em `prisma/schema.prisma`
3. Verifique os logs de erro no console

---

**Sistema desenvolvido com Prisma ORM e Node.js**
