import { getReadings } from './storage'

export function mean(values) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function stdDev(values) {
  if (!values.length) return 0
  const m = mean(values)
  return Math.sqrt(
    values.reduce((sum, value) => sum + (value - m) ** 2, 0) / values.length,
  )
}

function toValue(reading) {
  return typeof reading === 'object' && reading !== null
    ? Number(reading.value)
    : Number(reading)
}

function toDate(reading) {
  return typeof reading === 'object' && reading !== null
    ? String(reading.date || '')
    : ''
}

export function checkSuddenChange(values) {
  if (values.length < 2) {
    return { flagged: false, mean: mean(values), std: 0, z: 0 }
  }
  const history = values.slice(0, -1)
  const latest = values[values.length - 1]
  const m = mean(history)
  const sd = stdDev(history)
  const effectiveSd = Math.max(sd, Math.abs(m) * 0.02 || 0.01)
  const z = (latest - m) / effectiveSd
  return {
    flagged: Math.abs(z) >= 2.5,
    mean: m,
    std: sd,
    z,
  }
}

export function checkGradualDrift(values) {
  if (values.length < 3) {
    return { flagged: false, direction: null, slope: 0, rate: 0 }
  }
  const n = values.length
  const sumX = (n * (n - 1)) / 2
  const sumY = values.reduce((sum, value) => sum + value, 0)
  let sumXY = 0
  let sumXX = 0
  values.forEach((value, index) => {
    sumXY += index * value
    sumXX += index * index
  })
  const denominator = n * sumXX - sumX * sumX
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0
  const base = Math.max(Math.abs(mean(values)), 1e-9)
  const rate = slope / base
  return {
    flagged: Math.abs(rate) >= 0.05,
    direction: rate > 0 ? 'up' : 'down',
    slope,
    rate,
  }
}

export function evaluateDrift(biomarker) {
  const readings = getReadings()[biomarker.id] || []
  if (readings.length < 5) {
    return {
      status: 'baseline',
      label: 'Baseline in progress',
      note: 'Keep logging to shape your personal corridor.',
    }
  }

  const recent = readings.slice(-5)
  const inRange = recent.every((reading) => {
    const value = toValue(reading)
    return value >= biomarker.range.min && value <= biomarker.range.max
  })
  if (inRange) {
    return {
      status: 'stable',
      label: 'Within your corridor',
      note: 'Values sit comfortably inside your personal range.',
    }
  }
  return {
    status: 'shifting',
    label: 'Gentle drift detected',
    note: 'A slow, quiet shift — worth watching, nothing alarming.',
  }
}

export function analyzeBiomarker(biomarker) {
  const readings = getReadings()[biomarker.id] || []
  const values = readings.map(toValue)
  if (!values.length) {
    return { hasData: false }
  }

  const latest = values[values.length - 1]
  const latestDate = toDate(readings[readings.length - 1]) || null
  const recentHistory = values.slice(0, -1).slice(-4)

  let baseline = mean(recentHistory)
  if (!Number.isFinite(baseline) || recentHistory.length === 0) {
    baseline = latest
  }

  const percent = baseline !== 0 ? ((latest - baseline) / baseline) * 100 : 0
  const absPercent = Math.abs(percent)
  const direction =
    absPercent < 0.5 ? 'Stable' : percent > 0 ? 'Upward' : 'Downward'

  const sudden = checkSuddenChange(
    recentHistory.length >= 1 ? [...recentHistory, latest] : [latest],
  )
  const drift = checkGradualDrift(values.slice(-5))

  let tag
  let status
  if (sudden.flagged) {
    tag = 'Sudden change'
    status = 'review'
  } else if (drift.flagged) {
    tag = drift.direction === 'down' ? 'Downward drift' : 'Upward drift'
    status = 'review'
  } else {
    tag = 'Within personal pattern'
    status = 'stable'
  }

  return {
    hasData: true,
    count: values.length,
    historyCount: recentHistory.length,
    values,
    dates: readings.map(toDate),
    latest,
    latestDate,
    baseline,
    percent,
    absPercent,
    direction,
    sudden,
    drift,
    tag,
    status,
  }
}