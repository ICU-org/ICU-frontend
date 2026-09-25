export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:5002/api",
  /** Даты и время для людей — по Еревану, как на бэкенде (APP_TIMEZONE). */
  timeZone: "Asia/Yerevan",
} as const;
