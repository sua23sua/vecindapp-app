"use client";

import { useEffect, useState } from "react";
import type { PlanStatusResult } from "@/lib/plan-status";

export function usePlanStatus() {
  const [data, setData] = useState<PlanStatusResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plan/status")
      .then(r => r.json())
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  return { ...data, isLoading };
}
