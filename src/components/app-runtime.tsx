"use client";

import { useEffect } from "react";
import { contentIssues } from "@/content/devotionals";
import { localTodayISO } from "@/lib/dates";
import { REMINDER_BODY, REMINDER_TITLE, msUntil, webNotifications } from "@/lib/notifications";
import { applyPreferences, notificationPrefs, preferences } from "@/lib/state";

/** Efeitos globais: preferências, service worker (offline) e lembrete diário. */
export function AppRuntime() {
  const prefs = preferences.useValue();
  const notif = notificationPrefs.useValue();

  useEffect(() => {
    applyPreferences(prefs);
  }, [prefs]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Sem offline — o app continua funcionando normalmente online.
    });
  }, []);

  useEffect(() => {
    if (!notif.enabled || webNotifications.permission() !== "granted") return;
    const timer = window.setTimeout(async () => {
      const today = localTodayISO();
      if (notificationPrefs.get().lastShown === today) return;
      try {
        await webNotifications.show(REMINDER_TITLE, REMINDER_BODY);
        notificationPrefs.set((p) => ({ ...p, lastShown: today }));
      } catch {}
    }, msUntil(notif.time));
    return () => clearTimeout(timer);
  }, [notif.enabled, notif.time, notif.lastShown]);

  return null;
}

/** Em desenvolvimento, inconsistências do conteúdo ficam visíveis na tela. */
export function DevContentBanner() {
  if (process.env.NODE_ENV === "production" || contentIssues.length === 0) return null;
  return (
    <div role="alert" className="fixed inset-x-0 top-0 z-[200] max-h-[40vh] overflow-auto bg-[#3a2a12] p-4 font-mono text-xs text-[#f5e6c8]">
      <strong>Conteúdo: {contentIssues.length} inconsistência(s) — corrija no arquivo-fonte, não no código.</strong>
      <ul className="mt-2 space-y-1">
        {contentIssues.map((i, n) => (
          <li key={n}>
            [{i.level}] {i.where}: {i.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
