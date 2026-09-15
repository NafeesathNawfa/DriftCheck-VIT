const READINGS_KEY = 'driftcheck.readings'

export function getReadings() {
  try {
    return JSON.parse(localStorage.getItem(READINGS_KEY)) || {}
  } catch {
    return {}
  }
}

export function getBiomarkerReadings(id) {
  return getReadings()[id] || []
}

export function saveBiomarkerReadings(id, readings) {
  const all = getReadings()
  all[id] = readings
  localStorage.setItem(READINGS_KEY, JSON.stringify(all))
}

export function hasAnyReadings() {
  return Object.keys(getReadings()).length > 0
}