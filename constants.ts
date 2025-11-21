import { Department, Priority, TicketStatus } from "./types";

export const DEPARTMENT_LABELS: Record<Department, string> = {
  [Department.MEDICAL]: "Clínica Médica",
  [Department.DENTAL]: "Odontologia",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.NORMAL]: "Normal",
  [Priority.PREFERENTIAL]: "Preferencial",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.WAITING]: "Aguardando",
  [TicketStatus.CALLING]: "Chamando",
  [TicketStatus.FINISHED]: "Atendido",
};

export const COLORS = {
  primary: "teal",
  secondary: "blue",
};
