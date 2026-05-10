import { Resend } from "resend";

const FROM = "VecindApp <no-reply@vecindapp.es>";

export async function sendTeamInvite(to: string, invitedBy: string, registerUrl: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${invitedBy} te ha invitado a VecindApp`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px">
        <h2 style="color:#1A3C6E">Has sido invitado a VecindApp</h2>
        <p style="color:#475569">${invitedBy} te ha añadido como miembro del equipo en VecindApp, la plataforma de gestión de comunidades de propietarios.</p>
        <a href="${registerUrl}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#1A56DB;color:white;border-radius:12px;text-decoration:none;font-weight:600">
          Crear mi cuenta →
        </a>
        <p style="margin-top:32px;font-size:12px;color:#94A3B8">Si no esperabas este correo, puedes ignorarlo.</p>
      </div>
    `,
  });
}
