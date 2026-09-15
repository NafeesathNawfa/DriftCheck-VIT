import './TrendChart.css'

const W = 340
const H = 170
const PAD_L = 40
const PAD_R = 12
const PAD_T = 14
const PAD_B = 24
const PLOT_W = W - PAD_L - PAD_R
const PLOT_H = H - PAD_T - PAD_B

function fmtShort(iso) {
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function TrendChart({
  values = [],
  low = null,
  high = null,
  baseline = null,
  unit = '',
  dec = 1,
  dates = [],
}) {
  if (!values.length) {
    return <div className="tc-empty">No readings to chart yet.</div>
  }

  const rawMin = Math.min(
    ...values,
    baseline == null ? Infinity : baseline,
    low == null ? Infinity : low,
  )
  const rawMax = Math.max(
    ...values,
    baseline == null ? -Infinity : baseline,
    high == null ? -Infinity : high,
  )
  const span = Math.max(rawMax - rawMin, Math.abs(rawMax) * 0.05 || 1)
  const yMin = rawMin - span * 0.12
  const yMax = rawMax + span * 0.12

  const x = (index) =>
    PAD_L +
    (values.length === 1
      ? PLOT_W / 2
      : (index / (values.length - 1)) * PLOT_W)
  const y = (value) => PAD_T + ((yMax - value) / (yMax - yMin)) * PLOT_H

  const points = values
    .map((value, index) => `${x(index).toFixed(2)},${y(value).toFixed(2)}`)
    .join(' ')
  const bandTop = high == null ? PAD_T : y(high)
  const bandY = Math.min(bandTop, y(low == null ? rawMax : low))
  const bandHeight = Math.max(
    y(low == null ? rawMin : low) - bandTop,
    0,
  )
  const baseY = baseline == null ? null : y(baseline)
  const firstDate = dates[0] ? fmtShort(dates[0]) : null
  const lastDate = dates.length > 1 ? fmtShort(dates[dates.length - 1]) : null

  return (
    <figure className="tc-chart">
      <figcaption className="tc-legend">
        <span className="tc-legend-line" />
        <span>Drift trace</span>
        {low != null && high != null && (
          <>
            <span className="tc-legend-band" />
            <span>Normal band</span>
          </>
        )}
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="tc-svg" role="img" aria-label="Trend chart">
        {low != null && high != null && (
          <rect
            x={PAD_L}
            y={bandY}
            width={PLOT_W}
            height={bandHeight}
            rx="4"
            className="tc-band"
          />
        )}
        {baseY != null && (
          <line
            x1={PAD_L}
            y1={baseY}
            x2={PAD_L + PLOT_W}
            y2={baseY}
            className="tc-baseline"
          />
        )}
        <polyline points={points} className="tc-line" fill="none" />
        {values.map((value, index) => (
          <circle
            key={index}
            cx={x(index)}
            cy={y(value)}
            r="3"
            className="tc-dot"
          />
        ))}
        <text x={PAD_R} y={y(rawMax) + 3} className="tc-ylabel">
          {rawMax.toFixed(dec)} {unit}
        </text>
        <text x={PAD_R} y={y(rawMin) + 3} className="tc-ylabel">
          {rawMin.toFixed(dec)}
        </text>
        {firstDate && (
          <text x={PAD_L} y={H - 6} className="tc-xlabel">
            {firstDate}
          </text>
        )}
        {lastDate && (
          <text x={W - PAD_R} y={H - 6} className="tc-xlabel tc-xlabel-right">
            {lastDate}
          </text>
        )}
      </svg>
    </figure>
  )
}

export default TrendChart