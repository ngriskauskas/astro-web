export const createWedgePath = (
  center: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  drawOuterArc: boolean = true,
) => {
  const { x: innerStartX, y: innerStartY } = polarToCartesian(
    center,
    innerRadius,
    startAngle,
  );
  const { x: innerEndX, y: innerEndY } = polarToCartesian(
    center,
    innerRadius,
    endAngle,
  );
  const { x: outerStartX, y: outerStartY } = polarToCartesian(
    center,
    outerRadius,
    startAngle,
  );
  const { x: outerEndX, y: outerEndY } = polarToCartesian(
    center,
    outerRadius,
    endAngle,
  );

  if (drawOuterArc) {
    return `
      M ${innerStartX} ${innerStartY}
      A ${innerRadius} ${innerRadius} 0 0 0 ${innerEndX} ${innerEndY}
      L ${outerEndX} ${outerEndY}
      A ${outerRadius} ${outerRadius} 0 0 1 ${outerStartX} ${outerStartY}
      Z
    `;
  } else {
    return `
      M ${innerStartX} ${innerStartY}
      A ${innerRadius} ${innerRadius} 0 0 0 ${innerEndX} ${innerEndY}
      L ${outerEndX} ${outerEndY}
    `;
  }
};

const degToRad = (deg: number) => ((deg - 180) * Math.PI) / 180;

export const midpointAngle = (startAngle: number, endAngle: number) =>
  (startAngle + ((endAngle - startAngle + 360) % 360) / 2) % 360;

export const polarToCartesian = (
  center: number,
  radius: number,
  angle: number,
) => {
  const rad = degToRad(angle);
  return {
    x: center + radius * Math.cos(rad),
    y: center - radius * Math.sin(rad),
  };
};
