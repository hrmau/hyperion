/**
 * Least-squares fit shared by the scatter plot and the correlations page.
 *
 * The important part is `logSpace`. The correlations charts default to
 * logarithmic axes, and a line fitted in raw space is a *curve* once drawn on
 * those axes — so a linear fit both renders wrongly and reports an r² that
 * describes a model the reader is not looking at. When `logSpace` is set the
 * fit is performed on log10(x) and log10(y), i.e. a power law y = 10^b · x^m,
 * which is the relationship a log-log chart actually depicts and the one that
 * fits energy-vs-prosperity data honestly.
 *
 * Callers must pass the same `logSpace` value they use to build their axes,
 * otherwise the number and the picture disagree again.
 */

export interface RegressionFit {
  /** Slope in fitted space — an exponent when logSpace is true. */
  slope: number;
  /** Intercept in fitted space. */
  intercept: number;
  /** Coefficient of determination, measured in the same space as the fit. */
  rSquared: number;
  /** Evaluate the fitted model in raw data space. */
  predict: (x: number) => number;
}

export interface RegressionPoint {
  x: number;
  y: number;
}

export function fitRegression(
  rawPoints: RegressionPoint[],
  logSpace: boolean
): RegressionFit | null {
  // Non-positive values have no logarithm, and zeroes are missing data rather
  // than measurements in every metric this is used for.
  const points = rawPoints.filter(
    (p) => p.x > 0 && p.y > 0 && Number.isFinite(p.x) && Number.isFinite(p.y)
  );
  if (points.length < 2) return null;

  const tx = logSpace ? Math.log10 : (v: number) => v;
  const xs = points.map((p) => tx(p.x));
  const ys = points.map((p) => tx(p.y));

  const n = points.length;
  const sum = (arr: number[]) => arr.reduce((s, v) => s + v, 0);
  const sumX = sum(xs);
  const sumY = sum(ys);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumXX = sum(xs.map((x) => x * x));

  // Every x identical: the slope is undefined rather than infinite.
  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const meanY = sumY / n;
  const ssTotal = sum(ys.map((y) => (y - meanY) ** 2));
  // Every y identical: r² is undefined, not zero. Returning null keeps callers
  // from rendering "r² = NaN".
  if (ssTotal === 0) return null;

  const ssResidual = xs.reduce(
    (s, x, i) => s + (ys[i] - (slope * x + intercept)) ** 2,
    0
  );
  const rSquared = 1 - ssResidual / ssTotal;

  const predict = logSpace
    ? (x: number) => 10 ** (slope * Math.log10(x) + intercept)
    : (x: number) => slope * x + intercept;

  return { slope, intercept, rSquared, predict };
}
