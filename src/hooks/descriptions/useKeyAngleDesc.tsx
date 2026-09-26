import { useState, useEffect } from "react";
import type { ZodiacSign } from "../../types/zodiac";
import { apiFetch } from "../../utils/api";
import { useWheel } from "../useWheel";
import type { KeyType } from "../../types/cusp";

export interface KeyAngleDesc {
  sign: string;
}

interface KeyAngleDescParams {
  sign: ZodiacSign;
  angle: KeyType;
}

export const useKeyAngleDesc = (params: KeyAngleDescParams) => {
  const [loading, setLoading] = useState(false);
  const [keyAngleDesc, setKeyAngleDesc] = useState<KeyAngleDesc>({ sign: "temp" });

  const { type } = useWheel();

  // useEffect(() => {
  //   const fetchDesc = async () => {
  //     setLoading(true);
  //     const data = await apiFetch("/descriptions/key_angle", {
  //       method: "POST",
  //       body: JSON.stringify({ ...params, type }),
  //     });
  //     setKeyAngleDesc(data);
  //     setLoading(false);
  //   };

  //   fetchDesc();
  // }, [params.angle, params.sign, type]);

  return { loading, keyAngleDesc };
};
