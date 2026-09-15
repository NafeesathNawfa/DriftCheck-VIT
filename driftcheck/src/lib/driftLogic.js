import { getReadings } from './storage'

function toValue(reading) {
  return typeof reading === 'object' && reading !== null
    ? Number(reading.value)
    : Number(reading)
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