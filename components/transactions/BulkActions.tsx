"use client";

import { CheckCircle, Download, Trash2 } from "lucide-react";

interface BulkActionsProps {
  selectedCount: number;
  onMarkAsPaid: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export default function BulkActions({
  selectedCount,
  onMarkAsPaid,
  onExport,
  onDelete,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white shadow-lg z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            {selectedCount} {selectedCount === 1 ? "transação selecionada" : "transações selecionadas"}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onMarkAsPaid}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Marcar como Pago
            </button>
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Deletar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
