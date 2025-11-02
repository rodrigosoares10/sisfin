# Dockerfile para Sistema Financeiro - EasyPanel
# Multi-stage build para otimizar o tamanho da imagem

# Estágio 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production && \
    npm cache clean --force

# Gerar Prisma Client
RUN npx prisma generate

# Estágio 2: Produção
FROM node:20-alpine AS production

WORKDIR /app

# Copiar dependências e Prisma Client do estágio anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Copiar código da aplicação
COPY package*.json ./
COPY . .

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expor porta padrão
EXPOSE 3000

# Script de inicialização que roda migrations e inicia a aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
