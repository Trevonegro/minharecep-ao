import React, { useState, useMemo } from 'react';
import { useQueue } from '../context/QueueContext';
import { Search, User, Calendar, CreditCard, Repeat, X, Stethoscope, CheckCircle } from 'lucide-react';
import { DEPARTMENT_LABELS, STATUS_LABELS } from '../constants';
import { TicketStatus, Ticket, Department, Priority } from '../types';

// Duplicate ToothIcon locally to ensure it works without refactoring entire shared components
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

export const PatientSearchView: React.FC = () => {
  const { tickets, addTicket } = useQueue();
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for Re-queue Modal
  const [requeueTicket, setRequeueTicket] = useState<Ticket | null>(null);
  const [newDept, setNewDept] = useState<Department>(Department.MEDICAL);
  const [newPriority, setNewPriority] = useState<Priority>(Priority.NORMAL);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const filteredTickets = useMemo(() => {
    if (!searchTerm.trim()) return tickets.sort((a, b) => b.createdAt - a.createdAt);
    
    const lowerTerm = searchTerm.toLowerCase();
    return tickets.filter(ticket => 
      ticket.patientName.toLowerCase().includes(lowerTerm) || 
      (ticket.cpf && ticket.cpf.includes(lowerTerm)) ||
      ticket.ticketNumber.toString().includes(lowerTerm)
    ).sort((a, b) => b.createdAt - a.createdAt);
  }, [tickets, searchTerm]);

  const handleOpenRequeue = (ticket: Ticket) => {
    setRequeueTicket(ticket);
    setNewDept(ticket.department); // Default to previous department
    setNewPriority(Priority.NORMAL); // Reset priority to normal
  };

  const handleConfirmRequeue = () => {
    if (requeueTicket) {
      addTicket(requeueTicket.patientName, newDept, newPriority, requeueTicket.cpf);
      setRequeueTicket(null);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Search className="w-8 h-8 text-teal-600" />
          Buscar Pacientes
        </h1>
        <p className="text-slate-500 mt-1">Histórico de atendimentos e re-inserção na fila</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome, CPF ou número da senha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-slate-200">Paciente</th>
                <th className="p-4 font-semibold border-b border-slate-200">CPF</th>
                <th className="p-4 font-semibold border-b border-slate-200">Senha</th>
                <th className="p-4 font-semibold border-b border-slate-200">Status</th>
                <th className="p-4 font-semibold border-b border-slate-200">Data</th>
                <th className="p-4 font-semibold border-b border-slate-200 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                          <User size={16} />
                        </div>
                        <span className="font-medium text-slate-800">{ticket.patientName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {ticket.cpf ? (
                        <div className="flex items-center gap-2">
                          <CreditCard size={14} className="text-slate-400" />
                          {ticket.cpf}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm italic">Não informado</span>
                      )}
                    </td>
                    <td className="p-4">
                       <div className="flex flex-col">
                           <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded w-fit">
                             #{ticket.ticketNumber.toString().padStart(3, '0')}
                           </span>
                           <span className="text-xs text-slate-400 mt-1">{DEPARTMENT_LABELS[ticket.department]}</span>
                       </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        ticket.status === TicketStatus.FINISHED 
                          ? 'bg-green-100 text-green-700' 
                          : ticket.status === TicketStatus.CALLING 
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}>
                        {STATUS_LABELS[ticket.status]}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                       <div className="flex items-center gap-2">
                         <Calendar size={14} />
                         {new Date(ticket.createdAt).toLocaleDateString()}
                       </div>
                    </td>
                    <td className="p-4 text-right">
                        <button 
                            onClick={() => handleOpenRequeue(ticket)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition flex items-center gap-2 ml-auto text-sm font-medium border border-indigo-200"
                            title="Gerar nova senha para este paciente"
                        >
                            <Repeat size={14} />
                            Re-inserir
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Requeue Modal */}
      {requeueTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in-up">
                <div className="bg-teal-600 p-4 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Repeat size={20} /> Re-inserir na Fila
                    </h3>
                    <button onClick={() => setRequeueTicket(null)} className="text-teal-100 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paciente</label>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium text-slate-800">
                            {requeueTicket.patientName}
                        </div>
                        {requeueTicket.cpf && (
                            <div className="mt-1 text-sm text-slate-500 flex items-center gap-1">
                                <CreditCard size={12} /> CPF: {requeueTicket.cpf}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Selecione a Especialidade</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setNewDept(Department.MEDICAL)}
                                className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition ${
                                    newDept === Department.MEDICAL
                                    ? 'bg-teal-50 border-teal-500 text-teal-700 ring-1 ring-teal-500'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <Stethoscope size={18} /> Médica
                            </button>
                            <button
                                onClick={() => setNewDept(Department.DENTAL)}
                                className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition ${
                                    newDept === Department.DENTAL
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <ToothIcon size={18} /> Odonto
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Prioridade</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="priority" 
                                    checked={newPriority === Priority.NORMAL}
                                    onChange={() => setNewPriority(Priority.NORMAL)}
                                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-slate-700">Normal</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="priority" 
                                    checked={newPriority === Priority.PREFERENTIAL}
                                    onChange={() => setNewPriority(Priority.PREFERENTIAL)}
                                    className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                                />
                                <span className="text-slate-700 font-medium">Preferencial</span>
                            </label>
                        </div>
                    </div>

                    <button 
                        onClick={handleConfirmRequeue}
                        className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow transition flex items-center justify-center gap-2"
                    >
                        Confirmar e Gerar Senha
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up z-50">
            <CheckCircle className="text-green-400" size={20} />
            <div>
                <p className="font-bold">Sucesso!</p>
                <p className="text-sm text-slate-300">Nova senha gerada para o paciente.</p>
            </div>
        </div>
      )}
    </div>
  );
};