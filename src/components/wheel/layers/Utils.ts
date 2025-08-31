export const createWedgePath = (
  center: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
) => {
  const toRad = (deg: number) => ((deg - 180) * Math.PI) / 180;

  const sA = toRad(startAngle);
  const eA = toRad(endAngle);

  const innerStartX = center + innerRadius * Math.cos(sA);
  const innerStartY = center - innerRadius * Math.sin(sA);
  const innerEndX = center + innerRadius * Math.cos(eA);
  const innerEndY = center - innerRadius * Math.sin(eA);

  const outerStartX = center + outerRadius * Math.cos(sA);
  const outerStartY = center - outerRadius * Math.sin(sA);
  const outerEndX = center + outerRadius * Math.cos(eA);
  const outerEndY = center - outerRadius * Math.sin(eA);

  return `
    M ${innerStartX} ${innerStartY}
    A ${innerRadius} ${innerRadius} 0 0 0 ${innerEndX} ${innerEndY}
    L ${outerEndX} ${outerEndY}
    A ${outerRadius} ${outerRadius} 0 0 1 ${outerStartX} ${outerStartY}
    Z
  `;
};
