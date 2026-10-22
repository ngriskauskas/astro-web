import { useDesc } from "../../contexts/DescContext";
import { HouseData, type CuspType } from "../../types/cusp";
import type { OwnerType } from "../../contexts/MultiWheelContext";
import { CHIP_BASE, CHIP_INTERACTIVE, chipTint } from "./chipStyles";

export const HouseChip = ({
  house,
  owner,
}: {
  house: CuspType;
  owner?: OwnerType;
}) => {
  const { open } = useDesc();
  const houseInfo = HouseData[house];

  return (
    <button
      type="button"
      className={`${CHIP_BASE} ${CHIP_INTERACTIVE}`}
      onClick={() => open({ type: "house", value: house, owner })}
      style={chipTint(houseInfo.color)}
    >
      <span>{houseInfo.name}</span>
    </button>
  );
};
