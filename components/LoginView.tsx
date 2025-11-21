import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, LogIn, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onToggleRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onToggleRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Email ou senha inválidos.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="bg-teal-600 p-8 text-center">
           <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo</h2>
           <p className="text-teal-100">Faça login para acessar o sistema</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-lg transition disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} /> Entrar
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Não tem uma conta?{' '}
              <button 
                onClick={onToggleRegister}
                className="text-teal-600 font-semibold hover:underline focus:outline-none"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};