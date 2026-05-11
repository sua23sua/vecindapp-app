import { CheckCircle, XCircle, AlertTriangle, Server, Globe, Key, Webhook, QrCode, Smartphone } from "lucide-react";

export const dynamic = "force-dynamic";

function envOk(val: string | undefined, placeholder: string) {
  return !!val && val !== placeholder;
}

export default function AdminWhatsAppPage() {
  const evoUrl = process.env.EVOLUTION_API_URL;
  const evoKey = process.env.EVOLUTION_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const urlOk  = envOk(evoUrl, "https://tu-instancia.evolution-api.com");
  const keyOk  = envOk(evoKey, "tu-api-key");
  const appOk  = envOk(appUrl, "");
  const allOk  = urlOk && keyOk && appOk;

  const checks = [
    {
      ok: urlOk,
      label: "EVOLUTION_API_URL",
      value: urlOk ? evoUrl! : "Sin configurar",
      help: "URL pública de tu servidor Evolution API (debe empezar por https://)",
    },
    {
      ok: keyOk,
      label: "EVOLUTION_API_KEY",
      value: keyOk ? "••••••••" : "Sin configurar",
      help: "La API key que pusiste en el .env del servidor",
    },
    {
      ok: appOk,
      label: "NEXT_PUBLIC_APP_URL",
      value: appOk ? appUrl! : "Sin configurar",
      help: "URL de producción de VecindApp (para registrar el webhook automáticamente)",
    },
  ];

  const steps = [
    {
      icon: Server,
      title: "1. Contrata un VPS",
      body: "Hostinger KVM 1 (~5 €/mes) o DigitalOcean Droplet básico con Ubuntu 22.04 son suficientes.",
    },
    {
      icon: Globe,
      title: "2. Instala Docker y Evolution API",
      code: `ssh root@TU_IP
curl -fsSL https://get.docker.com | sh
git clone https://github.com/EvolutionAPI/evolution-api
cd evolution-api && cp .env.example .env`,
    },
    {
      icon: Key,
      title: "3. Configura la API key",
      body: "Edita el fichero .env del servidor y cambia solo estas dos líneas:",
      code: `AUTHENTICATION_TYPE=apikey
AUTHENTICATION_API_KEY=pon-aqui-una-clave-segura`,
    },
    {
      icon: Server,
      title: "4. Arranca el servidor",
      code: `docker compose up -d
# Comprueba que responde:
curl http://localhost:8080`,
    },
    {
      icon: Globe,
      title: "5. Apunta un dominio y activa HTTPS",
      body: "Crea un registro DNS A: wa.tudominio.com → IP del VPS. Luego en el servidor:",
      code: `apt install nginx certbot python3-certbot-nginx -y

cat > /etc/nginx/sites-available/evolution << 'EOF'
server {
    server_name wa.tudominio.com;
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

ln -s /etc/nginx/sites-available/evolution /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d wa.tudominio.com`,
    },
    {
      icon: Key,
      title: "6. Añade las variables en Vercel",
      body: "Ve a vercel.com → tu proyecto → Settings → Environment Variables y añade:",
      code: `EVOLUTION_API_URL  = https://wa.tudominio.com
EVOLUTION_API_KEY  = la-clave-del-paso-3`,
      extra: "Elimina EVOLUTION_INSTANCE si existe (ya no se usa).",
    },
    {
      icon: Webhook,
      title: "7. El webhook se registra solo",
      body: "La primera vez que un usuario abre la pestaña WhatsApp en Ajustes, VecindApp crea su instancia y registra automáticamente el webhook en Evolution API apuntando a /api/whatsapp/incoming.",
    },
    {
      icon: QrCode,
      title: "8. El usuario escanea el QR",
      body: "En Ajustes → WhatsApp aparece un código QR. El usuario lo escanea con su teléfono desde WhatsApp → Dispositivos vinculados → Vincular dispositivo. Listo.",
    },
    {
      icon: Smartphone,
      title: "9. Listo para enviar",
      body: "A partir de ahí el usuario puede enviar campañas. Los vecinos que respondan «Sí», «Confirmado», «Ok», etc. quedan marcados automáticamente como confirmados.",
    },
  ];

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">WhatsApp — Guía de implementación</h1>
        <p className="text-[#475569] mt-1 text-sm">Configura la pasarela de WhatsApp para que los usuarios puedan enviar avisos a sus vecinos.</p>
      </div>

      {/* Estado actual */}
      <div className={`rounded-2xl border-2 p-6 mb-8 ${allOk ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
        <div className="flex items-center gap-2 mb-4">
          {allOk
            ? <><CheckCircle className="w-5 h-5 text-green-600" /><span className="font-semibold text-green-800">Configuración completa</span></>
            : <><AlertTriangle className="w-5 h-5 text-amber-600" /><span className="font-semibold text-amber-800">Configuración incompleta</span></>
          }
        </div>
        <div className="space-y-3">
          {checks.map(c => (
            <div key={c.label} className="flex items-start gap-3">
              {c.ok
                ? <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                : <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              }
              <div>
                <p className="text-sm font-medium text-[#1E293B]">
                  {c.label}
                  {c.ok && <span className="ml-2 font-mono text-xs text-[#475569]">{c.value}</span>}
                </p>
                {!c.ok && <p className="text-xs text-[#475569] mt-0.5">{c.help}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pasos */}
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <step.icon className="w-4 h-4 text-[#1A56DB]" />
              <h2 className="font-semibold text-[#1A3C6E] text-sm">{step.title}</h2>
            </div>
            {step.body && <p className="text-sm text-[#475569] mb-3">{step.body}</p>}
            {step.code && (
              <pre className="bg-[#0F1E3C] text-green-400 text-xs rounded-xl p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {step.code}
              </pre>
            )}
            {step.extra && <p className="text-xs text-[#94A3B8] mt-2">{step.extra}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
