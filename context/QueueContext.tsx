import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Ticket, Department, Priority, TicketStatus } from '../types';
import { supabase } from '../supabaseClient';

interface QueueContextType {
  tickets: Ticket[];
  lastCalledTicket: Ticket | null;
  addTicket: (patientName: string, department: Department, priority: Priority, cpf?: string) => void;
  callNextTicket: (department: Department, doctorName: string, officeName: string) => void;
  recallTicket: (ticketId: string) => void;
  finishTicket: (ticketId: string) => void;
  getWaitingCount: (department: Department) => number;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

// Helper to map Supabase DB snake_case to App camelCase
const mapTicketFromDB = (dbTicket: any): Ticket => ({
  id: dbTicket.id,
  ticketNumber: dbTicket.ticket_number,
  patientName: dbTicket.patient_name,
  cpf: dbTicket.cpf,
  department: dbTicket.department as Department,
  priority: dbTicket.priority as Priority,
  status: dbTicket.status as TicketStatus,
  createdAt: new Date(dbTicket.created_at).getTime(),
  calledAt: dbTicket.called_at ? new Date(dbTicket.called_at).getTime() : undefined,
  finishedAt: dbTicket.finished_at ? new Date(dbTicket.finished_at).getTime() : undefined,
  doctorName: dbTicket.doctor_name,
  officeName: dbTicket.office_name
});

export const QueueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Fetch tickets from DB
  const fetchTickets = useCallback(async () => {
    // Fetch tickets from the last 24 hours to keep the list relevant
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .gt('created_at', yesterday.toISOString())
      .order('created_at', { ascending: true });

    if (data && !error) {
      setTickets(data.map(mapTicketFromDB));
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchTickets();

    // Realtime subscription
    const channel = supabase
      .channel('tickets-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          // Whenever a change happens, re-fetch the full list to ensure consistency
          fetchTickets();
        }
      )
      .subscribe();

    // Polling Mechanism (Safety Net)
    // Fetches data every 5 seconds to ensure sync across devices even if WebSocket drops
    const pollInterval = setInterval(() => {
      fetchTickets();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [fetchTickets]);

  const addTicket = useCallback(async (patientName: string, department: Department, priority: Priority, cpf?: string) => {
    // Robust Ticket Number Generation:
    // Query the DB for the absolute last ticket number instead of relying on local state
    // This prevents duplicate numbers when multiple receptions are working simultaneously.
    const { data: lastTicketData } = await supabase
        .from('tickets')
        .select('ticket_number')
        .order('ticket_number', { ascending: false })
        .limit(1);

    const maxTicket = lastTicketData && lastTicketData.length > 0 ? lastTicketData[0].ticket_number : 0;
    const nextNumber = maxTicket + 1;

    const { error } = await supabase.from('tickets').insert({
      ticket_number: nextNumber,
      patient_name: patientName,
      cpf: cpf || null,
      department,
      priority,
      status: TicketStatus.WAITING,
      created_at: new Date().toISOString()
    });

    if (error) {
        console.error("Error adding ticket:", error);
    } else {
        // Update immediately for a snappy UI
        fetchTickets();
    }
  }, [fetchTickets]);

  const callNextTicket = useCallback(async (department: Department, doctorName: string, officeName: string) => {
    // Find the correct ticket to call (Logic mirrored from local version)
    const waiting = tickets.filter(t => t.department === department && t.status === TicketStatus.WAITING);
    
    if (waiting.length === 0) return;

    waiting.sort((a, b) => {
      if (a.priority === Priority.PREFERENTIAL && b.priority !== Priority.PREFERENTIAL) return -1;
      if (a.priority !== Priority.PREFERENTIAL && b.priority === Priority.PREFERENTIAL) return 1;
      return a.createdAt - b.createdAt;
    });

    const nextTicket = waiting[0];

    const { error } = await supabase
      .from('tickets')
      .update({ 
        status: TicketStatus.CALLING, 
        called_at: new Date().toISOString(),
        doctor_name: doctorName,
        office_name: officeName
      })
      .eq('id', nextTicket.id);

    if (error) {
        console.error("Error calling ticket:", error);
    } else {
        fetchTickets();
    }

  }, [tickets, fetchTickets]);

  const recallTicket = useCallback(async (ticketId: string) => {
     // Update timestamp to re-trigger effects on BigScreen
     const { error } = await supabase
       .from('tickets')
       .update({ 
         status: TicketStatus.CALLING,
         called_at: new Date().toISOString() 
       })
       .eq('id', ticketId);

     if (error) {
         console.error("Error recalling ticket:", error);
     } else {
         fetchTickets();
     }
  }, [fetchTickets]);

  const finishTicket = useCallback(async (ticketId: string) => {
    const { error } = await supabase
      .from('tickets')
      .update({ 
        status: TicketStatus.FINISHED, 
        finished_at: new Date().toISOString() 
      })
      .eq('id', ticketId);
      
    if (error) {
        console.error("Error finishing ticket:", error);
    } else {
        fetchTickets();
    }
  }, [fetchTickets]);

  const getWaitingCount = useCallback((department: Department) => {
    return tickets.filter(t => t.department === department && t.status === TicketStatus.WAITING).length;
  }, [tickets]);

  // Derived state for the "current" call on the big screen
  const lastCalledTicket = tickets
    .filter(t => t.status === TicketStatus.CALLING)
    .sort((a, b) => (b.calledAt || 0) - (a.calledAt || 0))[0] || null;

  return (
    <QueueContext.Provider value={{ 
      tickets, 
      lastCalledTicket, 
      addTicket, 
      callNextTicket, 
      recallTicket, 
      finishTicket,
      getWaitingCount
    }}>
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) throw new Error("useQueue must be used within a QueueProvider");
  return context;
};