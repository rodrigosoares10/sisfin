import Layout from '../components/Layout';
import { useAuthStore } from '../stores/authStore';
import { User, Lock } from 'lucide-react';

export default function Settings() {
  const { user } = useAuthStore();

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Perfil</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  className="input"
                  defaultValue={user?.name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="input"
                  defaultValue={user?.email}
                />
              </div>
              <button className="btn btn-primary">Salvar Alterações</button>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Alterar Senha</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha Atual
                </label>
                <input type="password" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <input type="password" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <input type="password" className="input" />
              </div>
              <button className="btn btn-primary">Alterar Senha</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
