import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { Department, Priority } from '../types';
import { DEPARTMENT_LABELS, PRIORITY_LABELS } from '../constants';
import { UserPlus, Clock, Stethoscope, CreditCard } from 'lucide-react';

// Custom Tooth Icon since it might not be available in all Lucide versions
const ToothIcon: React.FC<{ size?: number, className?: string }> = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4.2 12c0-5.5 4.5-10 10-10s10 4.5 10 10c0 2.5-2 4.5-2 7v2.5c0 1.4-1.1 2.5-2.5 2.5h-.5c-1.4 0-2.5-1.1-2.5-2.5v-1c0-.6-.4-1-1-1s-1 .4-1 1v1c0 1.4-1.1 2.5-2.5 2.5h-.5c-1.4 0-2.5-1.1-2.5-2.5v-2.5c0-2.5-2-4.5-2-7z" />
    <path d="M9 12c0 1.1.9 2 2 2s2-.9 2-2" />
    <path d="M13 12c0 1.1.9 2 2 2s2-.9 2-2" />
  </svg>
);

export const ReceptionView: React.FC = () => {
  const { addTicket, getWaitingCount } = useQueue();
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [department, setDepartment] = useState<Department>(Department.MEDICAL);
  const [priority, setPriority] = useState<Priority>(Priority.NORMAL);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Pass CPF to addTicket
    addTicket(name, department, priority, cpf);
    
    setName('');
    setCpf('');
    setPriority(Priority.NORMAL); // Reset priority but maybe keep department
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-teal-600" />
          Recepção
        </h1>
        <p className="text-slate-500 mt-1">Novo atendimento e triagem</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Paciente</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                placeholder="Ex: João da Silva"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CPF (Opcional)</label>
              <div className="relative">
                 <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    placeholder="000.000.000-00"
                  />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Especialidade</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepartment(Department.MEDICAL)}
                    className={`px-4 py-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition ${
                      department === Department.MEDICAL
                        ? 'bg-teal-50 border-teal-500 text-teal-700 ring-1 ring-teal-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Stethoscope size={20} />
                    <span className="text-sm font-medium">{DEPARTMENT_LABELS[Department.MEDICAL]}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepartment(Department.DENTAL)}
                    className={`px-4 py-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition ${
                      department === Department.DENTAL
                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ToothIcon size={20} />
                    <span className="text-sm font-medium">{DEPARTMENT_LABELS[Department.DENTAL]}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
                <div className="flex flex-col gap-2">
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${priority === Priority.NORMAL ? 'bg-slate-100 border-slate-400' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input 
                            type="radio" 
                            name="priority" 
                            checked={priority === Priority.NORMAL} 
                            onChange={() => setPriority(Priority.NORMAL)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="ml-2 text-sm text-slate-700">{PRIORITY_LABELS[Priority.NORMAL]}</span>
                    </label>
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${priority === Priority.PREFERENTIAL ? 'bg-amber-50 border-amber-400' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input 
                            type="radio" 
                            name="priority" 
                            checked={priority === Priority.PREFERENTIAL} 
                            onChange={() => setPriority(Priority.PREFERENTIAL)}
                            className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="ml-2 text-sm text-slate-700 font-medium">{PRIORITY_LABELS[Priority.PREFERENTIAL]}</span>
                    </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gerar Senha
            </button>
          </form>
          
          {showSuccess && (
             <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-center animate-fade-in">
               Senha gerada com sucesso!
             </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Fila de Espera</h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-100 rounded-full text-teal-600">
                                <Stethoscope size={18} />
                            </div>
                            <span className="font-medium text-slate-700">Médico</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800">{getWaitingCount(Department.MEDICAL)}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                <ToothIcon size={18} />
                            </div>
                            <span className="font-medium text-slate-700">Odonto</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800">{getWaitingCount(Department.DENTAL)}</span>
                    </div>
                </div>
            </div>
            
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 text-indigo-900">
                <div className="flex items-start gap-3">
                   <Clock className="mt-1 text-indigo-600" size={20} />
                   <div>
                       <p className="font-semibold">Horário de Atendimento</p>
                       <div className="text-sm mt-2 text-indigo-700 space-y-1">
                          <p><strong>Seg - Qui:</strong> 08:00 - 16:30</p>
                          <p><strong>Sex:</strong> 08:00 - 12:00</p>
                       </div>
                   </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};