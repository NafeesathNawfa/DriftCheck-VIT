import { useState } from 'react'
import { biomarkers, getBiomarker } from '../config/biomarkers'
import { evaluateDrift } from '../lib/driftLogic'
import { saveBiomarkerReadings } from '../lib/storage'
import { ArrowRightIcon, BackIcon, BiomarkerGlyph } from './icons'
import './AddBaseline.css'

const EMPTY_ENTRY = { date: '', value: '' }

const BODY_COPY =
  'Establish your personalized biological corridor. Enter your past 4 readings to compute your mean baseline and personal reference range.'

function decimalsOf(step) {
  const text = String(step)
  const dot = text.indexOf('.')
  return dot === -1 ? 0 : text.length - dot - 1
}

function stepFrom(current, step, direction) {
  const base = parseFloat(current)
  const next = (Number.isNaN(base) ? 0 : base) + step * direction
  return Number(next.toFixed(decimalsOf(step))).toString()
}

function monthsBetween(olderIso, newerIso) {
  if (!olderIso || !newerIso) return null
  const older = new Date(`${olderIso}T00:00:00`)
  const newer = new Date(`${newerIso}T00:00:00`)
  if (Number.isNaN(older.getTime()) || Number.isNaN(newer.getTime())) return null
  let months =
    (newer.getFullYear() - older.getFullYear()) * 12 +
    (newer.getMonth() - older.getMonth())
  if (newer.getDate() < older.getDate()) months -= 1
  return Math.max(months, 0)
}

function relativeLabel(olderIso, newerIso) {
  const months = monthsBetween(olderIso, newerIso)
  if (months === null) return ''
  if (months === 0) return 'Same month'
  if (months === 1) return '1 month prior'
  return `${months} months prior`
}

function latestDateOf(entries) {
  const dates = entries.map((entry) => entry.date).filter(Boolean).sort()
  return dates.length ? dates[dates.length - 1] : null
}

function meanAndStd(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
  return { mean, std: Math.sqrt(variance) }
}

function AddBaselineHeader({ onBack }) {
  return (
    <header className="ba-header">
      <button type="button" className="ba-back" onClick={onBack}>
        <BackIcon />
        Back
      </button>
      <button type="button" className="ba-help" aria-label="Help">
        ?
      </button>
    </header>
  )
}

function ReadingCard({
  biomarker,
  entry,
  badge,
  tag,
  isNew,
  relative,
  onDate,
  onValue,
  onStep,
}) {
  return (
    <section className={isNew ? 'ba-card is-new' : 'ba-card'}>
      <div className="ba-card-top">
        <div className="ba-card-heading">
          {!isNew && <span className="ba-badge">{badge}</span>}
          <div className="ba-card-titles">
            <span className="ba-card-title">
              {isNew ? 'New Reading' : `Reading ${badge}`}
            </span>
            {tag && <span className="ba-tag">{tag}</span>}
          </div>
        </div>
        <span className="ba-rel">{isNew ? 'Now' : relative}</span>
      </div>

      <div className="ba-fields-row">
        <label className="ba-field">
          <span className="ba-field-label">Test Date</span>
          <input
            className="ba-date"
            type="date"
            value={entry.date}
            onChange={(event) => onDate(event.target.value)}
            required
          />
        </label>

        <div className="ba-field">
          <span className="ba-field-label">Result</span>
          <div className="ba-stepper">
            <button
              type="button"
              className="ba-step-btn"
              aria-label="Decrease"
              onClick={() => onStep(-1)}
            >
              {'\u2212'}
            </button>
            <input
              className="ba-value"
              type="text"
              inputMode="decimal"
              value={entry.value}
              placeholder="0.0"
              onChange={(event) => onValue(event.target.value)}
            />
            <button
              type="button"
              className="ba-step-btn"
              aria-label="Increase"
              onClick={() => onStep(1)}
            >
              +
            </button>
            <span className="ba-unit">{biomarker.unit}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function BaselineForm({ biomarker, onBack, onComplete }) {
  const [entries, setEntries] = useState(() =>
    Array.from({ length: 5 }, () => ({ ...EMPTY_ENTRY })),
  )
  const [error, setError] = useState('')

  const step = biomarker.step
  const referenceDate = latestDateOf(entries)
  const historicalOrder = [3, 2, 1, 0]

  const setEntry = (index) => (patch) =>
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    )

  const stepEntry = (index) => (direction) =>
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, value: stepFrom(entry.value, step, direction) } : entry,
      ),
    )

  const submit = (event) => {
    event.preventDefault()
    if (entries.some((entry) => !entry.date)) {
      setError('Add a test date for every reading.')
      return
    }
    const parsed = entries.map((entry) => Number(entry.value))
    if (parsed.some((value) => Number.isNaN(value) || value <= 0)) {
      setError('Enter a positive number for every result.')
      return
    }
    const readings = entries.map((entry) => ({
      date: entry.date,
      value: Number(Number(entry.value).toFixed(decimalsOf(step))),
    }))
    saveBiomarkerReadings(biomarker.id, readings)
    onComplete({ biomarker, readings, result: evaluateDrift(biomarker) })
  }

  return (
    <form className="ba-screen" onSubmit={submit} noValidate>
      <AddBaselineHeader onBack={onBack} />
      <span className="ba-eyebrow">{biomarker.category}</span>
      <h1 className="ba-headline">Add Baseline</h1>
      <p className="ba-lede">{BODY_COPY}</p>

      <h2 className="ba-section-title">Historical Readings</h2>
      <div className="ba-historical">
        {historicalOrder.map((storedIndex, j) => {
          const badge = j + 1
          const tag =
            badge === 1 ? '(Latest)' : badge === 4 ? '(Oldest)' : null
          const entry = entries[storedIndex]
          return (
            <ReadingCard
              key={storedIndex}
              biomarker={biomarker}
              entry={entry}
              badge={badge}
              tag={tag}
              relative={relativeLabel(entry.date, referenceDate)}
              onDate={(value) => setEntry(storedIndex)({ date: value })}
              onValue={(value) => setEntry(storedIndex)({ value: value })}
              onStep={stepEntry(storedIndex)}
            />
          )
        })}
      </div>

      <ReadingCard
        biomarker={biomarker}
        entry={entries[4]}
        isNew
        relative="Now"
        onDate={(value) => setEntry(4)({ date: value })}
        onValue={(value) => setEntry(4)({ value: value })}
        onStep={stepEntry(4)}
      />

      {error && <p className="ba-error">{error}</p>}

      <button type="submit" className="ba-submit">
        Calculate &amp; Save Baseline
        <ArrowRightIcon size={18} />
      </button>
      <p className="ba-footer">Encrypted • Stored strictly on device</p>
    </form>
  )
}

function BiomarkerPicker({ onSelect, onBack }) {
  return (
    <div className="ba-screen">
      <AddBaselineHeader onBack={onBack} />
      <span className="ba-eyebrow">Baseline Setup</span>
      <h1 className="ba-headline">Add Baseline</h1>
      <p className="ba-lede">{BODY_COPY}</p>
      <h2 className="ba-section-title">Choose a biomarker</h2>
      <div className="ba-picker-list">
        {biomarkers.map((biomarker) => (
          <button
            type="button"
            key={biomarker.id}
            className="ba-picker-card"
            onClick={() => onSelect(biomarker)}
          >
            <span className="ba-picker-icon">
              <BiomarkerGlyph id={biomarker.id} />
            </span>
            <span className="ba-picker-main">
              <span className="ba-picker-title">{biomarker.category}</span>
              <span className="ba-picker-sub">
                Tracks {biomarker.name} · {biomarker.rangeLabel}
              </span>
            </span>
          </button>
        ))}
      </div>
      <p className="ba-footer">Encrypted • Stored strictly on device</p>
    </div>
  )
}

function BaselineResult({ biomarker, readings, result, onFinish }) {
  const values = readings.map((reading) => reading.value)
  const dec = decimalsOf(biomarker.step)
  const { mean, std } = meanAndStd(values)
  const rangeLow = Math.max(0, mean - 2 * std).toFixed(dec)
  const rangeHigh = Math.max(mean, mean + 2 * std).toFixed(dec)

  return (
    <div className="ba-screen">
      <span className="ba-eyebrow">{biomarker.category}</span>
      <h1 className="ba-headline">Baseline saved</h1>
      <div className="ba-result-card">
        <span className="ba-result-icon">
          <BiomarkerGlyph id={biomarker.id} size={30} />
        </span>
        <h2>{result.label}</h2>
        <p>{result.note}</p>
        <div className="ba-result-stats">
          <div className="ba-stat">
            <span>Mean baseline</span>
            <strong>
              {mean.toFixed(dec)} {biomarker.unit}
            </strong>
          </div>
          <div className="ba-stat">
            <span>Personal range</span>
            <strong>
              {rangeLow}–{rangeHigh} {biomarker.unit}
            </strong>
          </div>
        </div>
        <p className="ba-result-meta">
          First corridor logged for {biomarker.name}. Future readings will be
          checked against your own pattern.
        </p>
        <button type="button" className="ba-submit" onClick={onFinish}>
          Go to Overview
          <ArrowRightIcon size={18} />
        </button>
      </div>
      <p className="ba-footer">Encrypted • Stored strictly on device</p>
    </div>
  )
}

function AddBaseline({ biomarkerId = null, onBack, onDone }) {
  const [selected, setSelected] = useState(biomarkerId)
  const [completed, setCompleted] = useState(null)

  if (completed) {
    return (
      <BaselineResult
        {...completed}
        onFinish={() => onDone(completed.biomarker.id)}
      />
    )
  }

  if (!selected) {
    return (
      <BiomarkerPicker
        onSelect={(biomarker) => setSelected(biomarker.id)}
        onBack={onBack}
      />
    )
  }

  const biomarker = getBiomarker(selected)
  return (
    <BaselineForm
      biomarker={biomarker}
      onBack={onBack}
      onComplete={(payload) => setCompleted(payload)}
    />
  )
}

export default AddBaseline