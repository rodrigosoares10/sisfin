"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionFormSchema, TransactionFormData, Transaction, CentroCusto, Cliente, Produto } from "@/lib/types";
import { X } from "lucide-react";
import { useEffect } from "react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => void;
  transaction?: Transaction | null;
  costCenters: CentroCusto[];
  clients: Cliente[];
  products: Produto[];
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  transaction,
  costCenters,
  clients,
  products,
}: TransactionModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TransactionFormData>({
    // @ts-ignore - resolver type mismatch between versions
    resolver: zodResolver(transactionFormSchema),
    defaultValues: transaction
      ? {
          tipo: transaction.tipo as "RECEITA" | "DESPESA",
          descricao: transaction.descricao,
          valor: transaction.valor.toString(),
          data: new Date(transaction.data).toISOString().split("T")[0],
          centroCustoId: transaction.centroCustoId.toString(),
          clienteId: transaction.clienteId?.toString() || "",
          produtoId: transaction.produtoId?.toString() || "",
          statusPagamento: transaction.statusPagamento as any,
          metodoPagamento: transaction.metodoPagamento as any,
          dataVencimento: transaction.dataVencimento
            ? new Date(transaction.dataVencimento).toISOString().split("T")[0]
            : "",
          dataPagamento: transaction.dataPagamento
            ? new Date(transaction.dataPagamento).toISOString().split("T")[0]
            : "",
          recorrente: transaction.recorrente,
          frequenciaRecorrencia: transaction.frequenciaRecorrencia as any,
          observacoes: transaction.observacoes || "",
          anexoUrl: transaction.anexoUrl || "",
        }
      : {
          tipo: "RECEITA",
          descricao: "",
          valor: "",
          data: new Date().toISOString().split("T")[0],
          centroCustoId: "",
          clienteId: "",
          produtoId: "",
          statusPagamento: "PENDENTE",
          metodoPagamento: "PIX",
          dataVencimento: "",
          dataPagamento: "",
          recorrente: false,
          frequenciaRecorrencia: undefined,
          observacoes: "",
          anexoUrl: "",
        },
  });

  const isRecorrente = watch("recorrente");

  useEffect(() => {
    if (isOpen) {
      reset(
        transaction
          ? {
              tipo: transaction.tipo as "RECEITA" | "DESPESA",
              descricao: transaction.descricao,
              valor: transaction.valor.toString(),
              data: new Date(transaction.data).toISOString().split("T")[0],
              centroCustoId: transaction.centroCustoId.toString(),
              clienteId: transaction.clienteId?.toString() || "",
              produtoId: transaction.produtoId?.toString() || "",
              statusPagamento: transaction.statusPagamento as any,
              metodoPagamento: transaction.metodoPagamento as any,
              dataVencimento: transaction.dataVencimento
                ? new Date(transaction.dataVencimento).toISOString().split("T")[0]
                : "",
              dataPagamento: transaction.dataPagamento
                ? new Date(transaction.dataPagamento).toISOString().split("T")[0]
                : "",
              recorrente: transaction.recorrente,
              frequenciaRecorrencia: transaction.frequenciaRecorrencia as any,
              observacoes: transaction.observacoes || "",
              anexoUrl: transaction.anexoUrl || "",
            }
          : {
              tipo: "RECEITA",
              descricao: "",
              valor: "",
              data: new Date().toISOString().split("T")[0],
              centroCustoId: "",
              clienteId: "",
              produtoId: "",
              statusPagamento: "PENDENTE",
              metodoPagamento: "PIX",
              dataVencimento: "",
              dataPagamento: "",
              recorrente: false,
              frequenciaRecorrencia: undefined,
              observacoes: "",
              anexoUrl: "",
            }
      );
    }
  }, [isOpen, transaction, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = (data: TransactionFormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {transaction ? "Editar Transação" : "Nova Transação"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          {/* @ts-ignore */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  {...register("tipo")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="RECEITA">Receita</option>
                  <option value="DESPESA">Despesa</option>
                </select>
                {errors.tipo && (
                  <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <input
                  {...register("descricao")}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.descricao && (
                  <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
                )}
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor *
                </label>
                <input
                  {...register("valor")}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.valor && (
                  <p className="mt-1 text-sm text-red-600">{errors.valor.message}</p>
                )}
              </div>

              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data *
                </label>
                <input
                  {...register("data")}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.data && (
                  <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
                )}
              </div>

              {/* Centro de Custo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Centro de Custo *
                </label>
                <select
                  {...register("centroCustoId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione...</option>
                  {costCenters.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.nome}
                    </option>
                  ))}
                </select>
                {errors.centroCustoId && (
                  <p className="mt-1 text-sm text-red-600">{errors.centroCustoId.message}</p>
                )}
              </div>

              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <select
                  {...register("clienteId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Nenhum</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Produto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produto
                </label>
                <select
                  {...register("produtoId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Nenhum</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status de Pagamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status de Pagamento *
                </label>
                <select
                  {...register("statusPagamento")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="PAGO">Pago</option>
                  <option value="ATRASADO">Atrasado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              {/* Método de Pagamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pagamento *
                </label>
                <select
                  {...register("metodoPagamento")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  <option value="CARTAO_DEBITO">Cartão de Débito</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>

              {/* Data de Vencimento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento
                </label>
                <input
                  {...register("dataVencimento")}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Data de Pagamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Pagamento
                </label>
                <input
                  {...register("dataPagamento")}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* URL do Anexo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Anexo
                </label>
                <input
                  {...register("anexoUrl")}
                  type="url"
                  placeholder="https://exemplo.com/arquivo.pdf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Recorrente */}
              <div className="flex items-center">
                <input
                  {...register("recorrente")}
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Transação Recorrente
                </label>
              </div>

              {/* Frequência de Recorrência */}
              {isRecorrente && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequência *
                  </label>
                  <select
                    {...register("frequenciaRecorrencia")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="DIARIA">Diária</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="QUINZENAL">Quinzenal</option>
                    <option value="MENSAL">Mensal</option>
                    <option value="BIMESTRAL">Bimestral</option>
                    <option value="TRIMESTRAL">Trimestral</option>
                    <option value="SEMESTRAL">Semestral</option>
                    <option value="ANUAL">Anual</option>
                  </select>
                </div>
              )}

              {/* Observações */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  {...register("observacoes")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                {transaction ? "Salvar" : "Criar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
