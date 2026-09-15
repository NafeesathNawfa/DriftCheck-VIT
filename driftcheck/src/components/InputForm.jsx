import { useState } from 'react'
import { biomarkers, getBiomarker } from '../config/biomarkers'
import { evaluateDrift } from '../lib/driftLogic'
import { saveBiomarkerReadings } from '../lib/storage'
import { BackIcon, BiomarkerGlyph } from './icons'
import './InputForm.css'

function BiomarkerPicker({ onSelect }) {
  return (
    <div className="form-screen">
      <PageHeader title="Log a Reading" subtitle="Choose a biomarker" />
      <div className="picker-list">
        {biomarkers.map((biomarker) => {
          return (
            <button
              type="button"
              key={biomarker.id}
              className="picker-card"
              onClick={() => onSelect(biomarker)}
            >
              <span className="picker-icon">
                <BiomarkerGlyph id={biomarker.id} />
              </span>
              <span className="picker-main">
                <span className="picker-title">{biomarker.category}</span>
                <span className="picker-sub">
                  Tracks {biomarker.name} · {biomarker.rangeLabel}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PageHeader({ title, subtitle, onBack }) {
  return (
    <div className="form-header">
      {onBack && (
        <button
          type="button"
          className="back-button"
          onClick={onBack}
          aria-label="Back"
        >
          <BackIcon />
        </button>
      )}
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  )
}

function EntryForm({ biomarker, onBack, onSave }) {
  const [values, setValues] = useState(['', '', '', '', ''])
  const [error, setError] = useState('')

  const setValue = (index) => (event) => {
    const next = [...values]
    next[index] = event.target.value
    setValues(next)
  }

  const submit = (event) => {
    event.preventDefault()
    const parsed = values.map((value) => Number(value))
    if (parsed.some((value) => Number.isNaN(value) || value <= 0)) {
      setError('Please enter a positive number for every reading.')
      return
    }
    onSave(parsed)
  }

  return (
    <form className="form-screen" onSubmit={submit}>
      <PageHeader
        title={biomarker.name}
        subtitle={`${biomarker.category} · ${biomarker.rangeLabel}`}
        onBack={onBack}
      />

      <div className="entry-card">
        {values.map((value, index) => (
          <label className="field" key={index}>
            <span className="field-label">
              {index === 4 ? 'New reading' : `Reading ${index + 1} (past)`}
              {index === 4 && <span className="field-new">now</span>}
            </span>
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              value={value}
              onChange={setValue(index)}
              placeholder="0.0"
              required
            />
            <span className="field-unit">{biomarker.unit}</span>
          </label>
        ))}
        {error && <p className="form-error">{error}</p>}
      </div>

      <p className="form-hint">
        Your 5 values build a personal corridor around{' '}
        {biomarker.name.toLowerCase()}. Nothing is compared to a scary general
        average.
      </p>

      <button type="submit" className="btn btn-accent btn-block">
        Log {biomarker.name}
      </button>
    </form>
  )
}

function SavedConfirmation({ biomarker, result, onFinish }) {
  return (
    <div className="form-screen">
      <PageHeader title="Baseline saved" subtitle={biomarker.category} />
      <div className="confirmation-card">
        <span className="confirmation-icon">
          <BiomarkerGlyph id={biomarker.id} size={30} />
        </span>
        <h2>{result.label}</h2>
        <p>{result.note}</p>
        <p className="confirmation-meta">
          First corridor logged for {biomarker.name}. Future readings will be
          checked against your own pattern.
        </p>
        <button
          type="button"
          className="btn btn-accent btn-block"
          onClick={onFinish}
        >
          Go to Overview
        </button>
      </div>
    </div>
  )
}

function InputForm({ biomarkerId = null, onBack, onDone }) {
  const [selected, setSelected] = useState(biomarkerId)
  const [saved, setSaved] = useState(null)

  if (saved) {
    return (
      <SavedConfirmation
        biomarker={saved.biomarker}
        result={saved.result}
        onFinish={() => onDone()}
      />
    )
  }

  if (!selected) {
    return <BiomarkerPicker onSelect={(biomarker) => setSelected(biomarker.id)} />
  }

  const biomarker = getBiomarker(selected)

  const handleSave = (readings) => {
    saveBiomarkerReadings(selected, readings)
    setSaved({ biomarker, result: evaluateDrift(biomarker) })
  }

  return (
    <EntryForm
      biomarker={biomarker}
      onBack={onBack}
      onSave={handleSave}
    />
  )
}

export default InputForm