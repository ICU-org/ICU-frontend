// Изменяемые данные в памяти, живут до перезагрузки.
// Типы из entities не импортируются: shared не зависит от слоёв выше.
export const feedback: Array<{ id: string; message: string; createdAt: string }> = [];

/** Партнёры из макета — в том виде, в каком их отдаёт GET /api/content/partners. */
export const partners = [
  { id: "p1", name: "Մեր քաղաքապետարանը", description: "Мониторинг муниципального транспорта.", type: "GOV", services: ["GPS", "CAMERAS"], vehicleCount: 1200, partnerSince: 2021, logoUrl: null },
  { id: "p2", name: "Перевозчик 1", description: "Автобусные маршруты.", type: "CARRIER", services: ["GPS"], vehicleCount: 150, partnerSince: 2022, logoUrl: null },
  { id: "p3", name: "Компания 1", description: null, type: "PRIVATE", services: ["GPS", "MAINTENANCE"], vehicleCount: null, partnerSince: null, logoUrl: null },
];
