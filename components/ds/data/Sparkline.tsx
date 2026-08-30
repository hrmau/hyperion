import type { CSSProperties, SVGAttributes } from 'react';

export interface SparklineProps extends Omit<SVGAttributes<SVGSVGElement>, 'values'> {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}

/**
 * Tiny trend line for table rows and stat blocks. One series, one colour, no
 * axes, no fill — it shows direction, not magnitude. Anything that needs a
 * readable value needs a real chart.
 */
export function Sparkline({
  values,
  width = 88,
  height = 22,
  color = 'var(--paper-a55)',
  strokeWidth = 1.5,
  style,
  ...rest
}: SparklineProps) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  // A flat series would divide by zero; draw it down the middle instead.
  const span = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / span) * height;
      return `${x},${max === min ? height / 2 : y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width, height, overflow: 'visible', ...style }}
      aria-hidden="true"
      {...rest}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
