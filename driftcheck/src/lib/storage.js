const READINGS_KEY = 'driftcheck.readings'
const ACCOUNTS_KEY = 'driftcheck.accounts'
const CURRENT_ACCOUNT_KEY = 'driftcheck.currentAccount'

export const DEMO_EMAIL = 'demo@driftcheck.app'
export const DEMO_PASSWORD = 'driftcheck123'

function normalizeEmail(email) {
  return String(email).trim().toLowerCase()
}

export function hashPassword(password) {
  let hash = 0
  const input = `driftcheck:${password}`
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return String(hash >>> 0)
}

function readingsKey() {
  const account = getCurrentAccount()
  return account ? `${READINGS_KEY}.${account}` : READINGS_KEY
}

export function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || {}
  } catch {
    return {}
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function getAccount(email) {
  return getAccounts()[normalizeEmail(email)] || null
}

export function registerAccount(email, passwordHash) {
  const accounts = getAccounts()
  const key = normalizeEmail(email)
  const existing = accounts[key]
  const isNew = !existing
  accounts[key] = {
    passwordHash: passwordHash || (existing && existing.passwordHash) || '',
    createdAt: (existing && existing.createdAt) || new Date().toISOString(),
  }
  saveAccounts(accounts)
  return isNew
}

export function ensureDemoAccount() {
  const accounts = getAccounts()
  const key = normalizeEmail(DEMO_EMAIL)
  if (!accounts[key]) {
    accounts[key] = {
      passwordHash: hashPassword(DEMO_PASSWORD),
      createdAt: new Date().toISOString(),
    }
    saveAccounts(accounts)
  }
}

export function getCurrentAccount() {
  return localStorage.getItem(CURRENT_ACCOUNT_KEY) || null
}

export function setCurrentAccount(email) {
  localStorage.setItem(CURRENT_ACCOUNT_KEY, normalizeEmail(email))
}

export function getReadings() {
  try {
    return JSON.parse(localStorage.getItem(readingsKey())) || {}
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
  localStorage.setItem(readingsKey(), JSON.stringify(all))
}

export function hasAnyReadings() {
  return Object.keys(getReadings()).length > 0
}