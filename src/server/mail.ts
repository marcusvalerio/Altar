import "server-only";
import nodemailer from "nodemailer";

export class MailNotConfiguredError extends Error {}

type Mail = { to: string; subject: string; html: string; text: string };

/**
 * Envio por SMTP de uma conta de e-mail comum — não precisa de domínio próprio.
 * Gmail: ative a verificação em duas etapas e crie uma "senha de app"
 * (https://myaccount.google.com/apppasswords).
 * Variáveis: SMTP_USER e SMTP_PASS; opcionais SMTP_HOST (padrão smtp.gmail.com),
 * SMTP_PORT (padrão 465) e EMAIL_FROM (padrão "ALTAR <SMTP_USER>").
 * Em desenvolvimento, sem SMTP configurado, o e-mail é mostrado no terminal.
 */
export async function sendMail(mail: Mail): Promise<{ delivered: boolean }> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`\n[e-mail de desenvolvimento] para ${mail.to}\n${mail.subject}\n${mail.text}\n`);
      return { delivered: false };
    }
    throw new MailNotConfiguredError("SMTP_USER/SMTP_PASS não configurados");
  }
  const port = Number(process.env.SMTP_PORT ?? 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? `ALTAR <${user}>`,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });
  return { delivered: true };
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** E-mail único para criar a senha (cadastro) ou redefini-la. */
export function passwordLinkEmail(link: string, purpose: "signup" | "reset") {
  const signup = purpose === "signup";
  const subject = signup ? "Confirme seu e-mail e crie sua senha · ALTAR" : "Crie uma nova senha · ALTAR";
  const lead = signup
    ? "Recebemos um pedido para criar uma conta no ALTAR com este e-mail. Para confirmar, toque no botão abaixo e escolha sua senha."
    : "Recebemos um pedido para criar uma nova senha para sua conta no ALTAR. Toque no botão abaixo para escolher a nova senha.";
  const action = signup ? "Confirmar e criar senha" : "Criar nova senha";
  const note = "O link vale por 24 horas e pode ser usado uma vez. Se você não fez este pedido, pode ignorar este e-mail.";

  const text = `ALTAR · Devocional Espírita\n\n${lead}\n\n${action}: ${link}\n\n${note}`;
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#EBEBDF;padding:32px 16px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#2B211B">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
  <table role="presentation" width="100%" style="max-width:480px;background:#F5F4EC;border-radius:24px;padding:36px 32px" cellspacing="0" cellpadding="0"><tr><td>
    <p style="margin:0;font-family:Georgia,serif;font-size:24px;letter-spacing:2px">ALTAR</p>
    <p style="margin:4px 0 28px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#5B676D">Devocional Espírita</p>
    <p style="margin:0 0 28px;font-size:16px;line-height:1.6">${escape(lead)}</p>
    <a href="${escape(link)}" style="display:inline-block;background:#2B211B;color:#EBEBDF;text-decoration:none;padding:14px 26px;border-radius:999px;font-size:15px">${escape(action)}</a>
    <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#5B676D">${escape(note)}</p>
    <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#5B676D;word-break:break-all">Se o botão não funcionar, copie este endereço: ${escape(link)}</p>
  </td></tr></table></td></tr></table></body></html>`;
  return { subject, html, text };
}
