import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { categoryService } from '../services/categoryService';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const incomeCategories = categories.filter((c) => c.type === 'INCOME');
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

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
          <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
          <button className="btn btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Nova Categoria</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Categorias de Receita
            </h2>
            <div className="space-y-3">
              {incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {category.icon && (
                      <span className="text-2xl">{category.icon}</span>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      {category.description && (
                        <p className="text-sm text-gray-500">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {category.color && (
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Categorias de Despesa
            </h2>
            <div className="space-y-3">
              {expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {category.icon && (
                      <span className="text-2xl">{category.icon}</span>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      {category.description && (
                        <p className="text-sm text-gray-500">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {category.color && (
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
