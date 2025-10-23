import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { accountService } from '../services/accountService';
import { Plus, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Accounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await accountService.getAll();
      setAccounts(data.accounts);
      setTotalBalance(data.totalBalance);
    } catch (error) {
      toast.error('Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getAccountTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      CHECKING: 'Conta Corrente',
      SAVINGS: 'Poupança',
      INVESTMENT: 'Investimento',
      CASH: 'Dinheiro',
      CREDIT_CARD: 'Cartão de Crédito',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Contas</h1>
          <button className="btn btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Nova Conta</span>
          </button>
        </div>

        <div className="card bg-gradient-to-r from-primary-500 to-primary-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Saldo Total</p>
              <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
            </div>
            <Wallet className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div key={account.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{account.name}</h3>
                <span className="px-2 py-1 text-xs font-semibold text-primary-600 bg-primary-100 rounded">
                  {getAccountTypeLabel(account.type)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Saldo Atual:</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(account.balance)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Saldo Inicial:</span>
                  <span className="text-gray-700">
                    {formatCurrency(account.initialBalance)}
                  </span>
                </div>
                {account.description && (
                  <p className="text-sm text-gray-500 mt-2">{account.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
