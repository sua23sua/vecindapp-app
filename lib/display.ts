export const statusLabel: Record<string, string> = {
  sent:      "Enviado",
  delivered: "Entregado",
  read:      "Leído",
  confirmed: "Confirmado",
  failed:    "Fallido",
};

export const statusColor: Record<string, string> = {
  sent:      "bg-gray-100 text-gray-600",
  delivered: "bg-gray-200 text-gray-700",
  read:      "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  failed:    "bg-red-100 text-red-600",
};
