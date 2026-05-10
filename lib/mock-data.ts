export type Owner = {
  id: string;
  name: string;
  unit: string;
  phone: string;
  email?: string;
};

export type Community = {
  id: string;
  name: string;
  address: string;
  owners: Owner[];
};

export type MessageStatus = "sent" | "delivered" | "read" | "confirmed" | "failed";

export type CampaignRow = {
  ownerId: string;
  ownerName: string;
  unit: string;
  phone: string;
  status: MessageStatus;
  readAt?: string;
  confirmedAt?: string;
  reply?: string;
};

export type Campaign = {
  id: string;
  title: string;
  communityId: string;
  communityName: string;
  sentAt: string;
  totalRecipients: number;
  rows: CampaignRow[];
  hasPdf: boolean;
};

export const communities: Community[] = [
  {
    id: "c1",
    name: "C/ Gran Vía 42",
    address: "C/ Gran Vía 42, Madrid",
    owners: [
      { id: "o1", name: "María García", unit: "1A", phone: "+34 612 111 001" },
      { id: "o2", name: "Josep Martí", unit: "2B", phone: "+34 612 111 002" },
      { id: "o3", name: "Carles Soler", unit: "3A", phone: "+34 612 111 003" },
      { id: "o4", name: "Miquel Roca", unit: "4B", phone: "+34 612 111 004" },
      { id: "o5", name: "Ana Torres", unit: "5A", phone: "+34 612 111 005" },
      { id: "o6", name: "Luis Fernández", unit: "5B", phone: "+34 612 111 006" },
    ],
  },
  {
    id: "c2",
    name: "Avda. Diagonal 88",
    address: "Avda. Diagonal 88, Barcelona",
    owners: [
      { id: "o7", name: "Marta López", unit: "1º1ª", phone: "+34 622 222 001" },
      { id: "o8", name: "Jordi Puig", unit: "1º2ª", phone: "+34 622 222 002" },
      { id: "o9", name: "Elena Vidal", unit: "2º1ª", phone: "+34 622 222 003" },
      { id: "o10", name: "Pau Mas", unit: "2º2ª", phone: "+34 622 222 004" },
    ],
  },
  {
    id: "c3",
    name: "C/ Colón 15",
    address: "C/ Colón 15, Valencia",
    owners: [
      { id: "o11", name: "Rosa Blanco", unit: "A", phone: "+34 633 333 001" },
      { id: "o12", name: "Pedro Ruiz", unit: "B", phone: "+34 633 333 002" },
      { id: "o13", name: "Carmen Sanz", unit: "C", phone: "+34 633 333 003" },
    ],
  },
];

export const campaigns: Campaign[] = [
  {
    id: "camp1",
    title: "Convocatoria Junta Mayo",
    communityId: "c1",
    communityName: "C/ Gran Vía 42",
    sentAt: "2026-05-10T10:32:00",
    totalRecipients: 6,
    hasPdf: true,
    rows: [
      { ownerId: "o1", ownerName: "María García", unit: "1A", phone: "+34 612 111 001", status: "confirmed", readAt: "10:34", confirmedAt: "10:41", reply: "Ok" },
      { ownerId: "o2", ownerName: "Josep Martí",  unit: "2B", phone: "+34 612 111 002", status: "confirmed", readAt: "10:38", confirmedAt: "10:52", reply: "RECIBIDO" },
      { ownerId: "o3", ownerName: "Carles Soler", unit: "3A", phone: "+34 612 111 003", status: "read",      readAt: "12:20" },
      { ownerId: "o4", ownerName: "Miquel Roca",  unit: "4B", phone: "+34 612 111 004", status: "delivered" },
      { ownerId: "o5", ownerName: "Ana Torres",   unit: "5A", phone: "+34 612 111 005", status: "confirmed", readAt: "11:05", confirmedAt: "11:10", reply: "Confirmado" },
      { ownerId: "o6", ownerName: "Luis Fernández",unit:"5B", phone: "+34 612 111 006", status: "failed" },
    ],
  },
  {
    id: "camp2",
    title: "Aviso avería ascensor",
    communityId: "c2",
    communityName: "Avda. Diagonal 88",
    sentAt: "2026-05-08T09:15:00",
    totalRecipients: 4,
    hasPdf: false,
    rows: [
      { ownerId: "o7",  ownerName: "Marta López", unit: "1º1ª", phone: "+34 622 222 001", status: "confirmed", readAt: "09:18", confirmedAt: "09:20", reply: "Entendido" },
      { ownerId: "o8",  ownerName: "Jordi Puig",  unit: "1º2ª", phone: "+34 622 222 002", status: "read",      readAt: "09:45" },
      { ownerId: "o9",  ownerName: "Elena Vidal", unit: "2º1ª", phone: "+34 622 222 003", status: "confirmed", readAt: "10:02", confirmedAt: "10:05", reply: "Ok gracias" },
      { ownerId: "o10", ownerName: "Pau Mas",     unit: "2º2ª", phone: "+34 622 222 004", status: "delivered" },
    ],
  },
];

export const statusLabel: Record<MessageStatus, string> = {
  sent:      "Enviado",
  delivered: "Entregado",
  read:      "Leído",
  confirmed: "Confirmado",
  failed:    "Fallido",
};

export const statusColor: Record<MessageStatus, string> = {
  sent:      "bg-gray-100 text-gray-600",
  delivered: "bg-gray-200 text-gray-700",
  read:      "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  failed:    "bg-red-100 text-red-600",
};
