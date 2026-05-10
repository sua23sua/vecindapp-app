import Link from "next/link";
import { MessageSquare, Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#0F2447] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <MessageSquare className="w-8 h-8 text-[#1A56DB]" />
          <span className="text-2xl font-bold text-white">VecindApp</span>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-[#1A56DB]" />
          </div>
          <h1 className="text-xl font-bold text-[#1A3C6E] mb-2">Confirma tu email</h1>
          <p className="text-sm text-[#475569] mb-6">
            Te hemos enviado un enlace de verificación. Revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace para activar tu cuenta.
          </p>
          <Link href="/login" className="text-sm text-[#1A56DB] hover:underline font-medium">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
