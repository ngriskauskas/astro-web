interface BackgroundProps {
  radius: number;
}
export const Background = ({ radius }: BackgroundProps) => {
  return (
    <g>
      <defs>
        <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#222" />
          <stop offset="100%" stopColor="#777" />
        </radialGradient>
      </defs>

      <circle cx={radius} cy={radius} r={radius} fill="url(#bgGradient)" />
    </g>
  );
};
