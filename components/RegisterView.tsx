import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';

interface RegisterViewProps {
  onToggleLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onToggleLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const success = await register(name, email, password);
      if (!success) {
        setError('Este email já está cadastrado.');
      }
    } catch (err) {
      setError('Erro ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="bg-slate-800 p-8 text-center">
           <h2 className="text-3xl font-bold text-white mb-2">Criar Conta</h2>
           <p className="text-slate-300">Preencha seus dados para começar</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition"
                  placeholder="Ex: Dr. Bruno"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition"
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
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg shadow-lg transition disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Cadastrar <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Já possui uma conta?{' '}
              <button 
                onClick={onToggleLogin}
                className="text-slate-800 font-semibold hover:underline focus:outline-none"
              >
                Fazer Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};