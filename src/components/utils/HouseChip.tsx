import { useDesc } from "../../contexts/DescContext";
import { HouseData, type CuspType } from "../../types/cusp";
import type { OwnerType } from "../../contexts/MultiWheelContext";

export const HouseChip = ({
  house,
  owner,
}: {
  house: CuspType;
  owner?: OwnerType;
}) => {
  const { open } = useDesc();
  const houseInfo = HouseData[house];
  const color = houseInfo.color;

  return (
    <div
      className="flex items-center gap-1 px-1 py-1.5 bg-white border rounded shadow-sm text-xs font-medium cursor-pointer hover:shadow-md transition-all justify-center"
      onClick={() => open({ type: "house", value: house, owner })}
      style={{
        backgroundColor: `${color}11`,
        borderColor: `${color}55`,
      }}
    >
      <span className="font-xs">{houseInfo.name}</span>
    </div>
  );
};
