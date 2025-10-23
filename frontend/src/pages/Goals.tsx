import Layout from '../components/Layout';
import { Plus, Target } from 'lucide-react';

export default function Goals() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Metas Financeiras</h1>
          <button className="btn btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Nova Meta</span>
          </button>
        </div>

        <div className="card text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhuma meta cadastrada
          </h3>
          <p className="text-gray-600 mb-4">
            Comece criando sua primeira meta financeira
          </p>
          <button className="btn btn-primary">
            <Plus className="w-5 h-5 inline mr-2" />
            Criar Meta
          </button>
        </div>
      </div>
    </Layout>
  );
}
