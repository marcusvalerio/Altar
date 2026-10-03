"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Button, ButtonLink } from "@/components/ui";
import { account, api, logout } from "@/lib/account";
import { useHydrated } from "@/lib/store";

const PASSWORD_MIN = 8;

function Field({ label, hint, ...props }: { label: string; hint?: string } & React.ComponentProps<"input">) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-2 block">
        {label}
      </label>
      <input
        id={id}
        className="min-h-13 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-[1rem] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-ink"
        {...props}
      />
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Message({ tone, children }: { tone: "error" | "info"; children: React.ReactNode }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`animate-fade rounded-2xl px-4 py-3 text-[0.9375rem] leading-relaxed ${tone === "error" ? "bg-terracotta/10 text-terracotta" : "bg-surface-2/70 text-ink"}`}>
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------------- */

export function AccountHome() {
  const hydrated = useHydrated();
  const { email } = account.useValue();
  if (!hydrated) return <div className="min-h-64" />;
  return email ? <SignedIn email={email} /> : <LoginForm />;
}

function SignedIn({ email }: { email: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="animate-rise space-y-8">
      <div className="rounded-[24px] border border-line-soft bg-surface p-6">
        <p className="eyebrow">Conectado como</p>
        <p className="mt-2 break-all font-display text-[1.375rem] text-ink">{email}</p>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
          Seus favoritos, leituras concluídas e preferências ficam guardados na sua conta e aparecem em qualquer aparelho em que você entrar.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="quiet"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await logout();
            setBusy(false);
          }}
        >
          Sair da conta
        </Button>
        <ButtonLink href="/conta/esqueci/" variant="ghost">
          Trocar senha
        </ButtonLink>
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await api("/api/auth/login/", { email, password });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    account.set({ email: email.trim().toLowerCase() });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="animate-rise space-y-5" noValidate>
      <Field label="E-mail" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="Senha" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <Message tone="error">{error}</Message>}
      <Button type="submit" disabled={busy || !email || !password} className="w-full">
        {busy ? "Entrando…" : "Entrar"}
      </Button>
      <div className="flex flex-col items-center gap-1 pt-2 text-sm">
        <Link href="/conta/criar/" className="inline-flex min-h-11 items-center font-medium text-ink underline-offset-4 hover:underline">
          Criar uma conta
        </Link>
        <Link href="/conta/esqueci/" className="inline-flex min-h-11 items-center text-muted underline-offset-4 hover:text-ink hover:underline">
          Esqueci minha senha
        </Link>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------------- */

/** Passo 1 do cadastro (e da troca de senha): só o e-mail. */
export function RequestLinkForm({ mode }: { mode: "signup" | "reset" }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState("");
  const [devLink, setDevLink] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setError("");
    const r = await api<{ devLink?: string }>("/api/auth/request-link/", { email });
    if (!r.ok) {
      setState("idle");
      return setError(r.error);
    }
    setDevLink(r.data.devLink ?? "");
    setState("sent");
  }

  if (state === "sent") {
    return (
      <div className="animate-rise space-y-5 text-center">
        <span aria-hidden="true" className="animate-breathe mx-auto block h-2.5 w-2.5 rounded-full bg-mustard" />
        <p className="font-display text-[1.5rem] leading-snug text-ink">Enviamos um link para</p>
        <p className="break-all text-[1rem] font-medium text-ink">{email.trim().toLowerCase()}</p>
        <p className="mx-auto max-w-sm text-[0.9375rem] leading-relaxed text-muted">
          {mode === "signup"
            ? "Abra o e-mail e toque em “Confirmar e criar senha”. Lá você escolhe sua senha e já entra na conta."
            : "Abra o e-mail e toque no link para criar uma nova senha."}{" "}
          O link vale por 24 horas.
        </p>
        <p className="text-xs text-muted">Não chegou? Confira a caixa de spam ou tente de novo em um minuto.</p>
        {devLink && (
          <p className="rounded-2xl border border-dashed border-line p-3 text-left text-xs text-muted">
            Desenvolvimento (e-mail não configurado):{" "}
            <a href={devLink} className="break-all text-accent-ink underline">
              abrir o link
            </a>
          </p>
        )}
        <Button variant="ghost" onClick={() => setState("idle")}>
          Usar outro e-mail
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="animate-rise space-y-5" noValidate>
      <Field
        label="E-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        hint={mode === "signup" ? "Vamos enviar um link de confirmação. Nele você cria sua senha." : "Vamos enviar um link para você criar uma nova senha."}
      />
      {error && <Message tone="error">{error}</Message>}
      <Button type="submit" disabled={state === "busy" || !email} className="w-full">
        {state === "busy" ? "Enviando…" : "Enviar link"}
      </Button>
      <p className="pt-2 text-center text-sm">
        <Link href="/conta/" className="inline-flex min-h-11 items-center text-muted underline-offset-4 hover:text-ink hover:underline">
          Já tenho conta · Entrar
        </Link>
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------------- */

/** Passo 2: o link do e-mail abre esta tela; a pessoa cria a senha e já entra. */
export function SetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [check, setCheck] = useState<{ state: "checking" | "valid" | "invalid"; email?: string; purpose?: string }>(() =>
    token ? { state: "checking" } : { state: "invalid" },
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    api<{ ok: boolean; email?: string; purpose?: string }>("/api/auth/check-token/", { token }).then((r) =>
      setCheck(r.ok && r.data.ok ? { state: "valid", email: r.data.email, purpose: r.data.purpose } : { state: "invalid" }),
    );
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < PASSWORD_MIN) return setError(`A senha precisa ter pelo menos ${PASSWORD_MIN} caracteres.`);
    if (password !== confirm) return setError("As duas senhas não são iguais.");
    setBusy(true);
    const r = await api("/api/auth/set-password/", { token, password });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    account.set({ email: check.email ?? null });
    router.replace("/conta/?bemvindo=1");
  }

  if (check.state === "checking") return <p className="text-[0.9375rem] text-muted">Conferindo o link…</p>;
  if (check.state === "invalid") {
    return (
      <div className="animate-rise space-y-5">
        <Message tone="info">Este link expirou ou já foi usado. Peça um novo link com o seu e-mail.</Message>
        <ButtonLink href="/conta/esqueci/" className="w-full">
          Pedir novo link
        </ButtonLink>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="animate-rise space-y-5" noValidate>
      <div className="rounded-2xl bg-surface-2/60 px-4 py-3 text-[0.9375rem] text-ink">
        {check.purpose === "signup" ? "E-mail confirmado: " : "Conta: "}
        <span className="break-all font-medium">{check.email}</span>
      </div>
      <Field
        label={check.purpose === "signup" ? "Crie sua senha" : "Nova senha"}
        type="password"
        autoComplete="new-password"
        required
        minLength={PASSWORD_MIN}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint={`Pelo menos ${PASSWORD_MIN} caracteres.`}
      />
      <Field label="Repita a senha" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      {error && <Message tone="error">{error}</Message>}
      <Button type="submit" disabled={busy || !password || !confirm} className="w-full">
        {busy ? "Salvando…" : check.purpose === "signup" ? "Criar senha e entrar" : "Salvar e entrar"}
      </Button>
    </form>
  );
}

export function WelcomeNote() {
  const welcome = useSearchParams().get("bemvindo");
  const { email } = account.useValue();
  if (!welcome || !email) return null;
  return (
    <div className="mb-6">
      <Message tone="info">Pronto. Sua conta está criada e você já está conectado.</Message>
    </div>
  );
}
