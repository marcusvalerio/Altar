"use client";

/**
 * Lembrete diário — suporte preparado.
 *
 * Linguagem: convite, nunca cobrança. (Nunca "você ainda não leu…")
 *
 * Limitação da web: sem servidor de push, o navegador só consegue disparar o
 * lembrete enquanto o ALTAR estiver aberto (ou em segundo plano recente).
 * Para lembretes confiáveis com o app fechado, implemente `NotificationAdapter`
 * com notificações locais nativas (ex.: Capacitor LocalNotifications) ou Web Push.
 */

export const REMINDER_TITLE = "ALTAR";
export const REMINDER_BODY = "Seu momento no ALTAR está esperando por você.";

export type PermissionState = "granted" | "denied" | "default" | "unsupported";

export interface NotificationAdapter {
  isSupported(): boolean;
  permission(): PermissionState;
  requestPermission(): Promise<PermissionState>;
  show(title: string, body: string): Promise<void>;
}

export const webNotifications: NotificationAdapter = {
  isSupported() {
    return typeof window !== "undefined" && "Notification" in window;
  },
  permission() {
    if (!this.isSupported()) return "unsupported";
    return Notification.permission as PermissionState;
  },
  async requestPermission() {
    if (!this.isSupported()) return "unsupported";
    return (await Notification.requestPermission()) as PermissionState;
  },
  async show(title, body) {
    const options: NotificationOptions = { body, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", tag: "altar-daily" };
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (reg) await reg.showNotification(title, options);
    else new Notification(title, options);
  },
};

/** Milissegundos até o próximo horário "HH:MM" (hoje ou amanhã). */
export function msUntil(time: string, now = new Date()) {
  const [h, m] = time.split(":").map(Number);
  const next = new Date(now);
  next.setHours(h, m, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}
