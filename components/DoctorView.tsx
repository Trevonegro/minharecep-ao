import React, { useState, useMemo } from 'react';
import { useQueue } from '../context/QueueContext';
import { Department, Priority, TicketStatus } from '../types';
import { DEPARTMENT_LABELS, PRIORITY_LABELS } from '../constants';
import { Megaphone, CheckCircle, User, Clock, Activity, DoorOpen } from 'lucide-react';

const AVAILABLE_OFFICES = [
  "Consultório Médico 1",
  "Consultório Médico 2",
  "Consultório Médico 3",
  "Consultório Médico 4",
  "Consultório Odontológico 1",
  "Consultório Odontológico 2",
  "Consultório Odontológico 3",
  "Consultório Odontológico 4"
];

export const DoctorView: React.FC = () => {
  const { tickets, callNextTicket, finishTicket, recallTicket } = useQueue();
  const [selectedDept, setSelectedDept] = useState<Department>(Department.MEDICAL);
  const [doctorName, setDoctorName] = useState("Dr. Silva"); // Simulated logged-in doctor
  const [selectedOffice, setSelectedOffice] = useState(AVAILABLE_OFFICES[0]);

  // Filter tickets for this doctor's view
  const queue = useMemo(() => {
    return tickets
      .filter(t => t.department === selectedDept && t.status === TicketStatus.WAITING)
      .sort((a, b) => {
        if (a.priority === Priority.PREFERENTIAL && b.priority !== Priority.PREFERENTIAL) return -1;
        if (a.priority !== Priority.PREFERENTIAL && b.priority === Priority.PREFERENTIAL) return 1;
        return a.createdAt - b.createdAt;
      });
  }, [tickets, selectedDept]);

  const currentPatient = useMemo(() => {
    // Find if this doctor has a patient currently "Calling" or in consultation
    // We match by doctorName to ensure this specific doctor sees their current patient
    return tickets.find(t => t.department === selectedDept && t.status === TicketStatus.CALLING && t.doctorName === doctorName);
  }, [tickets, selectedDept, doctorName]);

  return (
    <div className="max-w-6xl mx-auto p-6 h-screen flex flex-col">
      <header className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
        <div>
             <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-teal-600" />
            Painel do Especialista
            </h1>
            <p className="text-slate-500 text-sm">Gerencie sua fila de atendimento</p>
        </div>
       
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
            {/* Department Selection */}
            <div className="flex items-center gap-2">
                <select 
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value as Department)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                >
                    <option value={Department.MEDICAL}>Medicina</option>
                    <option value={Department.DENTAL}>Odontologia</option>
                </select>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            {/* Office Selection */}
            <div className="flex items-center gap-2 relative group">
                <DoorOpen size={18} className="text-slate-400 absolute left-3 pointer-events-none" />
                <select 
                    value={selectedOffice}
                    onChange={(e) => setSelectedOffice(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-lg pl-10 pr-8 py-2 outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer min-w-[220px]"
                >
                    {AVAILABLE_OFFICES.map(office => (
                        <option key={office} value={office}>{office}</option>
                    ))}
                </select>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            {/* Doctor Name Input */}
            <div className="flex items-center gap-2 relative">
                 <User size={18} className="text-slate-400 absolute left-3 pointer-events-none" />
                <input 
                    type="text" 
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 font-medium w-40 placeholder-slate-400"
                    placeholder="Nome do Doutor"
                />
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        
        {/* Left: Current Consultation */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            {currentPatient ? (
                <div className="bg-white rounded-xl shadow-md border border-teal-100 overflow-hidden">
                    <div className="bg-teal-600 p-4 text-white flex justify-between items-center">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Megaphone size={20} /> Em Atendimento
                        </h2>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                           Senha: {currentPatient.ticketNumber.toString().padStart(3, '0')}
                        </span>
                    </div>
                    <div className="p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
                            <User size={48} />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-2">{currentPatient.patientName}</h3>
                        <p className="text-lg text-slate-500 mb-2">{PRIORITY_LABELS[currentPatient.priority]} • {DEPARTMENT_LABELS[currentPatient.department]}</p>
                        <p className="text-md text-teal-600 font-medium bg-teal-50 px-4 py-1 rounded-full border border-teal-100 mb-8">
                            {currentPatient.officeName || selectedOffice}
                        </p>
                        
                        <div className="flex gap-4 w-full max-w-md">
                            <button 
                                onClick={() => recallTicket(currentPatient.id)}
                                className="flex-1 py-3 border-2 border-teal-600 text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition flex items-center justify-center gap-2"
                            >
                                <Megaphone size={18} />
                                Chamar Novamente
                            </button>
                            <button 
                                onClick={() => finishTicket(currentPatient.id)}
                                className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md transition flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} />
                                Finalizar Atendimento
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
                    <User size={48} className="mb-4 opacity-50" />
                    <p className="text-lg">Nenhum paciente em atendimento</p>
                    <p className="text-sm">Chame o próximo da fila</p>
                </div>
            )}
        </div>

        {/* Right: Waiting List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <Clock size={16} /> Fila de Espera
                </h3>
                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {queue.length}
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {queue.length === 0 ? (
                     <div className="text-center py-10 text-slate-400">
                        <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                        <p>Fila vazia!</p>
                     </div>
                ) : (
                    queue.map((ticket) => (
                        <div key={ticket.id} className={`p-4 rounded-lg border transition hover:shadow-md flex justify-between items-center ${
                            ticket.priority === Priority.PREFERENTIAL 
                            ? 'bg-amber-50 border-amber-200' 
                            : 'bg-white border-slate-100'
                        }`}>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-lg text-slate-800">
                                        #{ticket.ticketNumber.toString().padStart(3, '0')}
                                    </span>
                                    {ticket.priority === Priority.PREFERENTIAL && (
                                        <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase">
                                            Pref
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-600 font-medium truncate max-w-[150px]">{ticket.patientName}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Aguardando há {Math.floor((Date.now() - ticket.createdAt) / 60000)} min
                                </p>
                            </div>
                            
                            {!currentPatient && (
                                <button 
                                    onClick={() => callNextTicket(selectedDept, doctorName, selectedOffice)}
                                    className="p-2 bg-teal-100 text-teal-700 rounded-full hover:bg-teal-200 transition"
                                    title="Chamar"
                                >
                                    <Megaphone size={18} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
                 <button 
                    onClick={() => callNextTicket(selectedDept, doctorName, selectedOffice)}
                    disabled={!!currentPatient || queue.length === 0}
                    className="w-full py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 shadow transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Megaphone size={18} />
                    Chamar Próximo
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};