"use client";

import { m } from "motion/react";
import { useState } from "react";
import { spring } from "@/components/motion";
import { SettingsGroups } from "@/components/reader";
import { Button } from "@/components/ui";
import { type PermissionState, REMINDER_BODY, webNotifications } from "@/lib/notifications";
import { notificationPrefs, preferences } from "@/lib/state";
import { useHydrated } from "@/lib/store";

export function PreferenceSettings() {
  return <SettingsGroups prefs={preferences.useValue()} />;
}

/**
 * A permissão do sistema só é pedida quando a pessoa ativa o lembrete —
 * nunca na primeira abertura.
 */
export function NotificationSettings() {
  const hydrated = useHydrated();
  const prefs = notificationPrefs.useValue();
  const [permission, setPermission] = useState<PermissionState | null>(null);
  const current = permission ?? (hydrated ? webNotifications.permission() : "default");
  const enabled = hydrated && prefs.enabled;

  async function toggle() {
    if (enabled) {
      notificationPrefs.set((p) => ({ ...p, enabled: false }));
      return;
    }
    const result = current === "granted" ? "granted" : await webNotifications.requestPermission();
    setPermission(result);
    if (result === "granted") notificationPrefs.set((p) => ({ ...p, enabled: true }));
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Lembrete diário</p>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink">“{REMINDER_BODY}”</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Lembrete diário"
          disabled={!hydrated || current === "unsupported"}
          onClick={toggle}
          className={`relative mt-1 inline-flex h-8 w-[3.25rem] shrink-0 items-center rounded-full border p-[3px] transition-colors duration-300 disabled:opacity-40 ${
            enabled ? "justify-end border-ink bg-ink" : "justify-start border-line bg-surface-2"
          }`}
        >
          <m.span layout transition={spring.touch} className="block h-6 w-6 rounded-full bg-bg shadow" />
        </button>
      </div>

      {enabled && (
        <label className="animate-rise mt-5 flex items-center justify-between gap-4 border-t border-line-soft pt-5">
          <span className="text-[0.9375rem] text-ink">Horário</span>
          <input
            type="time"
            value={prefs.time}
            onChange={(e) => e.target.value && notificationPrefs.set((p) => ({ ...p, time: e.target.value, lastShown: undefined }))}
            className="min-h-11 rounded-xl border border-line bg-bg px-3 text-ink"
          />
        </label>
      )}

      {hydrated && (
        <p className="mt-4 text-xs leading-relaxed text-muted">
          {current === "unsupported"
            ? "Este navegador não oferece lembretes. Ao instalar o ALTAR na tela inicial, eles podem ficar disponíveis."
            : current === "denied"
              ? "Os lembretes estão bloqueados nas configurações do navegador para este site."
              : "No navegador, o lembrete aparece enquanto o ALTAR estiver aberto ou em segundo plano. Você pode desativar quando quiser."}
        </p>
      )}
      {hydrated && current === "denied" && enabled && (
        <Button variant="ghost" className="mt-2" onClick={() => notificationPrefs.set((p) => ({ ...p, enabled: false }))}>
          Desativar
        </Button>
      )}
    </div>
  );
}
