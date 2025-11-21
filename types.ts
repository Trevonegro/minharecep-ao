export enum Department {
  MEDICAL = 'MEDICAL',
  DENTAL = 'DENTAL'
}

export enum Priority {
  NORMAL = 'NORMAL',
  PREFERENTIAL = 'PREFERENTIAL'
}

export enum TicketStatus {
  WAITING = 'WAITING',
  CALLING = 'CALLING', // The state when it appears on the big screen flashing
  FINISHED = 'FINISHED'
}

export interface Ticket {
  id: string;
  ticketNumber: number;
  patientName: string;
  cpf?: string; // Added CPF field
  department: Department;
  priority: Priority;
  status: TicketStatus;
  createdAt: number;
  calledAt?: number;
  finishedAt?: number;
  doctorName?: string;
  officeName?: string;
}

export type ViewMode = 'HOME' | 'RECEPTION' | 'DOCTOR' | 'TV' | 'SEARCH';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, never store plain text
}