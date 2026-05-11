"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, XCircle, X } from "lucide-react";
import type { PlanStatusResult } from "@/lib/plan-status";

function dismissKey() {
  return `vecindapp_banner_dismissed_${new Date().toISOString().slice(0, 10)}`;
}

export default function PlanLimitBanner({ initial }: { initial: PlanStatusResult }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (initial.status === "over_limit") {
      setDismissed(localStorage.getItem(dismissKey()) === "1");
    }
  }, [initial.status]);

  if (initial.status === "ok") return null;
  if (initial.status === "over_limit" && dismissed) return null;

  const isBlocked = initial.status === "blocked";

  return (
    <div className={`border-b px-4 py-3 ${isBlocked ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
      <div className="max-w-6xl mx-auto flex items-start gap-3">
        {isBlocked
          ? <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          : <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        }

        <div className="flex-1 text-sm">
          {isBlocked ? (
            <>
              <span className="font-semibold text-red-800">Los envíos están pausados. </span>
              <span className="text-red-700">
                Tu plan <strong>{initial.planName}</strong> permite hasta <strong>{initial.planLimit}</strong> propietarios
                y llevas más de <strong>{initial.gracePeriodDays} días</strong> por encima del límite ({initial.ownerCount} actuales).
                Actualiza tu plan para reactivar los envíos.
              </span>
            </>
          ) : (
            <>
              <span className="font-semibold text-amber-800">Atención: </span>
              <span className="text-amber-700">
                Tienes <strong>{initial.ownerCount}</strong> propietarios pero tu plan <strong>{initial.planName}</strong> permite
                hasta <strong>{initial.planLimit}</strong>. Tienes <strong>{initial.daysRemaining} días</strong> para
                actualizar tu plan o reducir propietarios. Mientras tanto, todo sigue funcionando con normalidad.
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="/plan"
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${isBlocked ? "bg-red-600 text-white hover:bg-red-700" : "bg-amber-500 text-white hover:bg-amber-600"}`}
          >
            Actualizar plan →
          </a>
          {isBlocked && (
            <a
              href="/comunidades"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
            >
              Ver propietarios →
            </a>
          )}
          {!isBlocked && (
            <button
              onClick={() => { localStorage.setItem(dismissKey(), "1"); setDismissed(true); }}
              className="p-1 rounded-lg hover:bg-amber-100 text-amber-600"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
