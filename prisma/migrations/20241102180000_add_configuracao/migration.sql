-- CreateEnum
CREATE TYPE "Tema" AS ENUM ('LIGHT', 'DARK');

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" TEXT NOT NULL,
    "nomeAgencia" TEXT NOT NULL DEFAULT 'Minha Agência',
    "logoUrl" TEXT,
    "tema" "Tema" NOT NULL DEFAULT 'LIGHT',
    "corPrimaria" TEXT NOT NULL DEFAULT '#3B82F6',
    "corSecundaria" TEXT NOT NULL DEFAULT '#10B981',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);
