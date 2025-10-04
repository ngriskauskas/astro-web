import { useState, useEffect } from "react";
import type { MoonPhase } from "../../types/moon";
import type { ZodiacSign } from "../../types/zodiac";
import { apiFetch } from "../../utils/api";
import { useWheel } from "../useWheel";

export interface MoonPhaseDesc {
  description: string;
}

interface MoonPhaseDescParams {
  phase: MoonPhase;
  sign: ZodiacSign;
}

export const useMoonPhaseDesc = (
  params: MoonPhaseDescParams,
  enabled: boolean = true,
) => {
  const [loading, setLoading] = useState(true);
  const [moonPhaseDesc, setMoonPhaseDesc] = useState<MoonPhaseDesc>();

  const { type } = useWheel();
  useEffect(() => {
    if (!enabled) return;

    const fetchDesc = async () => {
      setLoading(true);
      const data = await apiFetch("/descriptions/moon-phase", {
        method: "POST",
        body: JSON.stringify({ ...params, type }),
      });
      setMoonPhaseDesc(data);
      setLoading(false);
    };

    fetchDesc();
  }, [params.phase, params.sign, type, enabled]);

  return { loading, moonPhaseDesc };
};
