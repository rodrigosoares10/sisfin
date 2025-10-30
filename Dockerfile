# Multi-stage build para otimização
FROM node:18-alpine AS base

# Instalar dependências necessárias para Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copiar apenas arquivos de dependências primeiro (cache layer)
COPY package*.json ./
COPY prisma ./prisma/

# ========================================
# Stage 1: Dependências
# ========================================
FROM base AS dependencies

RUN npm ci --only=production && \
    npm cache clean --force

# ========================================
# Stage 2: Build
# ========================================
FROM base AS build

RUN npm ci

# Gerar Prisma Client
RUN npx prisma generate

# ========================================
# Stage 3: Produção
# ========================================
FROM node:18-alpine AS production

RUN apk add --no-cache openssl libc6-compat dumb-init

WORKDIR /app

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar dependências de produção
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copiar código fonte
COPY --chown=nodejs:nodejs . .

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Expor porta
EXPOSE 3000

# Mudar para usuário não-root
USER nodejs

# Usar dumb-init para gerenciar processos
ENTRYPOINT ["dumb-init", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Executar migrations e iniciar servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
