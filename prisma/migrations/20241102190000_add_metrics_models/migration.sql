-- CreateEnum
CREATE TYPE "CanalMarketing" AS ENUM ('ORGANICO', 'GOOGLE_ADS', 'META_ADS', 'LINKEDIN_ADS', 'EMAIL', 'INDICACAO', 'PARCERIA', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoCusto" AS ENUM ('COGS', 'OPEX', 'CAC');

-- CreateEnum
CREATE TYPE "HealthScore" AS ENUM ('EXCELENTE', 'BOM', 'MEDIO', 'RISCO', 'CRITICO');

-- CreateEnum
CREATE TYPE "TipoMRRMovement" AS ENUM ('NOVO', 'EXPANSION', 'CONTRACTION', 'CHURN', 'REATIVACAO');

-- CreateEnum
CREATE TYPE "StatusProjeto" AS ENUM ('PLANEJAMENTO', 'EM_ANDAMENTO', 'REVISAO', 'CONCLUIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PrioridadeTicket" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "StatusTicket" AS ENUM ('ABERTO', 'EM_ATENDIMENTO', 'AGUARDANDO_CLIENTE', 'RESOLVIDO', 'FECHADO');

-- CreateTable
CREATE TABLE "marketing_costs" (
    "id" TEXT NOT NULL,
    "canal" "CanalMarketing" NOT NULL,
    "campanha" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT,
    "leads" INTEGER,
    "conversoes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_costs" (
    "id" TEXT NOT NULL,
    "tipo" "TipoCusto" NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "centroCustoId" TEXT,
    "usuariosAtivos" INTEGER,
    "transacoes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operational_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_health" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "healthScore" "HealthScore" NOT NULL DEFAULT 'MEDIO',
    "scoreNumerico" INTEGER NOT NULL DEFAULT 50,
    "usoProduto" INTEGER,
    "nps" INTEGER,
    "ticketsAbertos" INTEGER NOT NULL DEFAULT 0,
    "diasSemUso" INTEGER NOT NULL DEFAULT 0,
    "riscoPagamento" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "ultimaRevisao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mrr_movements" (
    "id" TEXT NOT NULL,
    "tipo" "TipoMRRMovement" NOT NULL,
    "clienteId" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "produtoId" TEXT,
    "mrrAnterior" DECIMAL(10,2),
    "mrrNovo" DECIMAL(10,2),
    "motivo" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mrr_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agency_projects" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "clienteId" TEXT,
    "status" "StatusProjeto" NOT NULL DEFAULT 'PLANEJAMENTO',
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPrevisao" TIMESTAMP(3),
    "dataConclusao" TIMESTAMP(3),
    "valorContratado" DECIMAL(10,2) NOT NULL,
    "valorFaturado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "horasEstimadas" DECIMAL(10,2) NOT NULL,
    "horasRealizadas" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "horasFaturaveis" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "custoReal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "margemBruta" DECIMAL(10,2),
    "descricao" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agency_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "prioridade" "PrioridadeTicket" NOT NULL DEFAULT 'MEDIA',
    "status" "StatusTicket" NOT NULL DEFAULT 'ABERTO',
    "dataAbertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataResposta" TIMESTAMP(3),
    "dataResolucao" TIMESTAMP(3),
    "dataFechamento" TIMESTAMP(3),
    "tempoResposta" INTEGER,
    "tempoResolucao" INTEGER,
    "primeiroContato" BOOLEAN NOT NULL DEFAULT true,
    "responsavelId" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_balances" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "saldoInicial" DECIMAL(10,2) NOT NULL,
    "entradas" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "saidas" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "saldoFinal" DECIMAL(10,2) NOT NULL,
    "burnRate" DECIMAL(10,2),
    "runwayMeses" INTEGER,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marketing_costs_canal_idx" ON "marketing_costs"("canal");

-- CreateIndex
CREATE INDEX "marketing_costs_data_idx" ON "marketing_costs"("data");

-- CreateIndex
CREATE INDEX "marketing_costs_data_canal_idx" ON "marketing_costs"("data", "canal");

-- CreateIndex
CREATE INDEX "operational_costs_tipo_idx" ON "operational_costs"("tipo");

-- CreateIndex
CREATE INDEX "operational_costs_data_idx" ON "operational_costs"("data");

-- CreateIndex
CREATE INDEX "operational_costs_centroCustoId_idx" ON "operational_costs"("centroCustoId");

-- CreateIndex
CREATE INDEX "operational_costs_data_tipo_idx" ON "operational_costs"("data", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "customer_health_clienteId_key" ON "customer_health"("clienteId");

-- CreateIndex
CREATE INDEX "customer_health_healthScore_idx" ON "customer_health"("healthScore");

-- CreateIndex
CREATE INDEX "customer_health_scoreNumerico_idx" ON "customer_health"("scoreNumerico");

-- CreateIndex
CREATE INDEX "customer_health_riscoPagamento_idx" ON "customer_health"("riscoPagamento");

-- CreateIndex
CREATE INDEX "mrr_movements_tipo_idx" ON "mrr_movements"("tipo");

-- CreateIndex
CREATE INDEX "mrr_movements_data_idx" ON "mrr_movements"("data");

-- CreateIndex
CREATE INDEX "mrr_movements_clienteId_idx" ON "mrr_movements"("clienteId");

-- CreateIndex
CREATE INDEX "mrr_movements_mes_ano_idx" ON "mrr_movements"("mes", "ano");

-- CreateIndex
CREATE INDEX "mrr_movements_mes_ano_tipo_idx" ON "mrr_movements"("mes", "ano", "tipo");

-- CreateIndex
CREATE INDEX "agency_projects_status_idx" ON "agency_projects"("status");

-- CreateIndex
CREATE INDEX "agency_projects_clienteId_idx" ON "agency_projects"("clienteId");

-- CreateIndex
CREATE INDEX "agency_projects_dataInicio_idx" ON "agency_projects"("dataInicio");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_prioridade_idx" ON "support_tickets"("prioridade");

-- CreateIndex
CREATE INDEX "support_tickets_clienteId_idx" ON "support_tickets"("clienteId");

-- CreateIndex
CREATE INDEX "support_tickets_dataAbertura_idx" ON "support_tickets"("dataAbertura");

-- CreateIndex
CREATE UNIQUE INDEX "cash_balances_mes_ano_key" ON "cash_balances"("mes", "ano");

-- CreateIndex
CREATE INDEX "cash_balances_mes_ano_idx" ON "cash_balances"("mes", "ano");

-- CreateIndex
CREATE INDEX "cash_balances_data_idx" ON "cash_balances"("data");

-- AddForeignKey
ALTER TABLE "operational_costs" ADD CONSTRAINT "operational_costs_centroCustoId_fkey" FOREIGN KEY ("centroCustoId") REFERENCES "centros_custo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_health" ADD CONSTRAINT "customer_health_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mrr_movements" ADD CONSTRAINT "mrr_movements_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mrr_movements" ADD CONSTRAINT "mrr_movements_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_projects" ADD CONSTRAINT "agency_projects_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
