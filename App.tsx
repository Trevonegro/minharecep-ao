import React, { useState } from 'react';
import { QueueProvider } from './context/QueueContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ReceptionView } from './components/ReceptionView';
import { DoctorView } from './components/DoctorView';
import { BigScreenView } from './components/BigScreenView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { PatientSearchView } from './components/PatientSearchView';
import { ViewMode } from './types';
import { Monitor, Stethoscope, UserPlus, LayoutGrid, LogOut, UserCircle, Search } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [view, setView] = useState<ViewMode>('HOME');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleExitTV = () => {
    setView('HOME');
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  // Auth Flow
  if (!isAuthenticated) {
    return isRegistering ? (
      <RegisterView onToggleLogin={() => setIsRegistering(false)} />
    ) : (
      <LoginView onToggleRegister={() => setIsRegistering(true)} />
    );
  }

  // Authenticated Flow
  if (view === 'TV') {
    return (
      <div className="relative">
        <BigScreenView />
        <button 
          onClick={handleExitTV} 
          className="fixed top-4 right-4 z-[60] bg-black/30 hover:bg-red-600 text-white/70 hover:text-white backdrop-blur-md border border-white/10 p-3 rounded-full shadow-lg transition-all duration-300 group flex items-center gap-2"
          title="Sair do Modo Telão"
        >
          <span className="hidden group-hover:inline text-sm font-bold px-2">Sair</span>
          <LogOut size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      {view === 'HOME' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
          
          {/* Logout Button for Home */}
          <button 
            onClick={logout}
            className="absolute top-6 right-6 flex items-center gap-2 text-slate-500 hover:text-red-600 transition px-4 py-2 rounded-lg hover:bg-red-50"
          >
            <span className="text-sm font-medium hidden sm:block">Sair da conta</span>
            <LogOut size={20} />
          </button>

          <div className="text-center mb-12 animate-fade-in">
             <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-600 text-white rounded-2xl mb-6 shadow-lg transform -rotate-3">
                <LayoutGrid size={40} />
             </div>
             <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">MINHA <span className="text-teal-600">RECEPÇÃO</span></h1>
             <p className="text-xl text-slate-500 max-w-md mx-auto">
               Olá, <span className="font-bold text-slate-700">{user?.name}</span>. Selecione um módulo.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl animate-fade-in-up">
            <button 
              onClick={() => setView('RECEPTION')}
              className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-teal-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <UserPlus size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Recepção</h2>
              <p className="text-slate-500 text-sm">Cadastro de pacientes, triagem e emissão de senhas.</p>
            </button>

            <button 
              onClick={() => setView('DOCTOR')}
              className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-teal-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Stethoscope size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Médico</h2>
              <p className="text-slate-500 text-sm">Painel de chamadas, histórico e finalização de consultas.</p>
            </button>
            
            <button 
              onClick={() => setView('SEARCH')}
              className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-teal-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Search size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Pacientes</h2>
              <p className="text-slate-500 text-sm">Buscar pacientes cadastrados e histórico de senhas.</p>
            </button>

            <button 
              onClick={() => setView('TV')}
              className="group bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-700 hover:border-teal-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-slate-700 text-teal-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Monitor size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Telão</h2>
              <p className="text-slate-400 text-sm">Exibição pública em tempo real das chamadas.</p>
            </button>
          </div>
          
          <footer className="mt-16 text-slate-400 text-sm font-medium">
            &copy; {new Date().getFullYear()} CB BRUNO GASPARETE NASCIMENTO
          </footer>
        </div>
      )}

      {view !== 'HOME' && (
        <>
          {/* Navigation Bar for Modules */}
          <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
             <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('HOME')}>
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white">
                    <LayoutGrid size={18} />
                </div>
                <span className="font-bold text-lg text-slate-800 hidden sm:inline">MINHA <span className="text-teal-600">RECEPÇÃO</span></span>
             </div>
             
             <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1 mr-4 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                   <UserCircle size={16} className="text-slate-400"/>
                   <span className="text-xs font-bold text-slate-600">{user?.name}</span>
                </div>

                <button 
                  onClick={() => setView('RECEPTION')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${view === 'RECEPTION' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Recepção
                </button>
                <button 
                  onClick={() => setView('DOCTOR')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${view === 'DOCTOR' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Médico
                </button>
                <button 
                  onClick={() => setView('SEARCH')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${view === 'SEARCH' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'} flex items-center gap-2`}
                >
                  <Search size={16} />
                  <span className="hidden sm:inline">Pacientes</span>
                </button>
                <button 
                  onClick={() => setView('TV')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition text-slate-600 hover:bg-slate-50 flex items-center gap-2`}
                >
                  <Monitor size={16} />
                  <span className="hidden sm:inline">Telão</span>
                </button>
                
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                
                <button onClick={logout} title="Sair" className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition">
                    <LogOut size={18} />
                </button>
             </div>
          </nav>
          
          <main className="animate-fade-in">
            {view === 'RECEPTION' && <ReceptionView />}
            {view === 'DOCTOR' && <DoctorView />}
            {view === 'SEARCH' && <PatientSearchView />}
          </main>
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <QueueProvider>
        <AppContent />
      </QueueProvider>
    </AuthProvider>
  );
};

export default App;