"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import TransactionsTable from "@/components/transactions/TransactionsTable";
import Pagination from "@/components/transactions/Pagination";
import TransactionFilters from "@/components/transactions/TransactionFilters";
import TransactionModal from "@/components/transactions/TransactionModal";
import BulkActions from "@/components/transactions/BulkActions";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useBulkOperation,
  useCostCenters,
  useClients,
  useProducts,
} from "@/hooks/useTransactions";
import { Transaction, TransactionFormData, TransactionFilters as FilterTypes } from "@/lib/types";

export default function TransactionsPage() {
  // State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState("data");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<FilterTypes>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Queries
  const { data, isLoading, error } = useTransactions(page, limit, sortBy, sortOrder, filters);
  const { data: costCenters = [] } = useCostCenters();
  const { data: clients = [] } = useClients();
  const { data: products = [] } = useProducts();

  // Mutations
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const bulkMutation = useBulkOperation();

  // Handlers
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleSelectTransaction = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === data?.data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data?.data.map((t) => t.id) || []);
    }
  };

  const handleCreateTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleSubmitTransaction = async (formData: TransactionFormData) => {
    if (editingTransaction) {
      await updateMutation.mutateAsync({ id: editingTransaction.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleBulkMarkAsPaid = async () => {
    if (confirm(`Marcar ${selectedIds.length} transações como pagas?`)) {
      await bulkMutation.mutateAsync({ action: "markAsPaid", ids: selectedIds });
      setSelectedIds([]);
    }
  };

  const handleBulkExport = () => {
    const ids = selectedIds.join(",");
    window.open(`/api/transactions/export?ids=${ids}`, "_blank");
  };

  const handleBulkDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir ${selectedIds.length} transações?`)) {
      await bulkMutation.mutateAsync({ action: "delete", ids: selectedIds });
      setSelectedIds([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Transações</h1>
          <p className="text-gray-600">Gerencie todas as suas transações financeiras</p>
        </div>

        {/* Filters */}
        <TransactionFilters
          filters={filters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
            setPage(1); // Reset to first page when filters change
          }}
          costCenters={costCenters}
        />

        {/* Loading/Error States */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Carregando transações...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Erro ao carregar transações. Tente novamente.</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && data && (
          <>
            <TransactionsTable
              transactions={data.data}
              selectedIds={selectedIds}
              onSelectTransaction={handleSelectTransaction}
              onSelectAll={handleSelectAll}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
                totalItems={data.pagination.total}
                itemsPerPage={limit}
              />
            )}
          </>
        )}

        {/* Floating Action Button */}
        <button
          onClick={handleCreateTransaction}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
          title="Nova Transação"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Bulk Actions */}
        <BulkActions
          selectedCount={selectedIds.length}
          onMarkAsPaid={handleBulkMarkAsPaid}
          onExport={handleBulkExport}
          onDelete={handleBulkDelete}
        />

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
          }}
          onSubmit={handleSubmitTransaction}
          transaction={editingTransaction}
          costCenters={costCenters}
          clients={clients}
          products={products}
        />
      </div>
    </div>
  );
}
