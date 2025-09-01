interface BackgroundProps {
  radius: number;
}
export const Background = ({ radius }: BackgroundProps) => {
  return (
    <g>
      <defs>
        <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#333" />
          <stop offset="50%" stopColor="#777" />
        </radialGradient>
      </defs>

      <circle cx={radius} cy={radius} r={radius - 3} fill="url(#bgGradient)" />
    </g>
  );
};
