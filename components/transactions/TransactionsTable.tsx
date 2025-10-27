"use client";

import { Transaction } from "@/lib/types";
import { formatCurrency, formatDate, getStatusColor, getTipoColor, statusLabels, metodoLabels } from "@/lib/utils";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";

interface TransactionsTableProps {
  transactions: Transaction[];
  selectedIds: number[];
  onSelectTransaction: (id: number) => void;
  onSelectAll: () => void;
  onSort: (field: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

export default function TransactionsTable({
  transactions,
  selectedIds,
  onSelectTransaction,
  onSelectAll,
  onSort,
  sortBy,
  sortOrder,
  onEdit,
  onDelete,
}: TransactionsTableProps) {
  const isAllSelected = transactions.length > 0 && selectedIds.length === transactions.length;

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 hover:text-gray-900 font-semibold"
    >
      {children}
      <ArrowUpDown className={`w-4 h-4 ${sortBy === field ? "text-blue-600" : "text-gray-400"}`} />
    </button>
  );

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
              <SortButton field="data">Data</SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
              <SortButton field="descricao">Descrição</SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
              <SortButton field="tipo">Tipo</SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
              <SortButton field="valor">Valor</SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
              Centro de Custo
            </th>
            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
              <SortButton field="statusPagamento">Status</SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
              Método
            </th>
            <th className="px-6 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                Nenhuma transação encontrada
              </td>
            </tr>
          ) : (
            transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className={`hover:bg-gray-50 ${selectedIds.includes(transaction.id) ? "bg-blue-50" : ""}`}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(transaction.id)}
                    onChange={() => onSelectTransaction(transaction.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(transaction.data)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {transaction.descricao}
                  {transaction.cliente && (
                    <div className="text-xs text-gray-500">{transaction.cliente.nome}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getTipoColor(transaction.tipo)}`}>
                    {transaction.tipo === "RECEITA" ? "Receita" : "Despesa"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(Number(transaction.valor))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${transaction.centroCusto.cor}20`,
                      color: transaction.centroCusto.cor,
                    }}
                  >
                    {transaction.centroCusto.nome}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.statusPagamento)}`}>
                    {statusLabels[transaction.statusPagamento]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metodoLabels[transaction.metodoPagamento]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
