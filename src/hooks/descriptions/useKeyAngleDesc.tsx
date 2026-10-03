import type { OwnerType } from "../../contexts/MultiWheelContext";
import type { ZodiacSign } from "../../types/zodiac";
import type { KeyType } from "../../types/cusp";
import { useWheel } from "../useWheel";
import { getChartSource, useGeneratedDescriptions } from "./useGeneratedDescriptions";

export interface KeyAngleDesc {
  sign: string;
}

interface KeyAngleDescParams {
  sign: ZodiacSign;
  angle: KeyType;
  owner?: OwnerType;
}

export const useKeyAngleDesc = (params: KeyAngleDescParams) => {
  const { type } = useWheel();
  const { loading, descriptions, error } = useGeneratedDescriptions([
    {
      type: "placement",
      subject: {
        chart: getChartSource(type, params.owner),
        point: { type: "keyAngle", name: params.angle },
        sign: params.sign,
      },
    },
  ]);
  return { loading, error, keyAngleDesc: { sign: descriptions[0] ?? "" } };
};
