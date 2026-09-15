import { useState } from 'react'
import { biomarkers, getBiomarker } from '../config/biomarkers'
import { analyzeBiomarker } from '../lib/driftLogic'
import {
  ArrowRightIcon,
  BackIcon,
  BellIcon,
  BiomarkerGlyph,
  InfoIcon,
  LeafLogo,
  PlusIcon,
  ShieldIcon,
  WarnIcon,
} from './icons'
import TrendChart from './TrendChart'
import './OverviewScreen.css'

function decimalsOf(step) {
  const s = Number(step) || 0.1
  if (Math.abs(s - 0.05) < 1e-9) return 2
  if (Math.abs(s - 0.1) < 1e-9) return 1
  return 0
}

function fmtVal(value, step) {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toFixed(decimalsOf(step))
}

function fmtDate(iso) {
  if (!iso) return 'Not recorded'
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function diffText(a) {
  if (a.absPercent < 0.5) return 'Roughly even with baseline'
  return `${a.absPercent.toFixed(1)}% ${a.percent > 0 ? 'above' : 'below'} baseline`
}

function previousValues(biomarker, analysis) {
  const history = analysis.values.slice(0, -1)
  if (!history.length) return 'None yet'
  return history
    .map((value) => `${fmtVal(value, biomarker.step)} ${biomarker.unit}`)
    .join('  ·  ')
}

function conversationPrompt(biomarker, analysis) {
  const change =
    analysis.sudden.flagged
      ? 'suddenly changed compared with my previous readings'
      : analysis.drift.direction === 'down'
        ? 'has been trending down over my past five readings'
        : 'has been trending up over my past five readings'
  return `My ${biomarker.name} result of ${fmtVal(analysis.latest, biomarker.step)} ${biomarker.unit} ${change}. Could anything explain this?`
}

function buildSummary(biomarker, analysis) {
  return [
    `${biomarker.name} — ${analysis.tag}`,
    `Latest result: ${fmtVal(analysis.latest, biomarker.step)} ${biomarker.unit} (${fmtDate(analysis.latestDate)})`,
    `Personal baseline: ${fmtVal(analysis.baseline, biomarker.step)} ${biomarker.unit}`,
    `Difference: ${diffText(analysis)}`,
    `Historical readings: ${analysis.count} sequential`,
    `Normal range used: ${biomarker.range.min}–${biomarker.range.max} ${biomarker.unit}`,
  ].join('\n')
}

function interpretation(biomarker, analysis) {
  const latest = `${fmtVal(analysis.latest, biomarker.step)} ${biomarker.unit}`
  if (analysis.status === 'stable') {
    return `Your ${biomarker.name} values are consistent with your personal baseline. Your last logged reading of ${latest} sits within your personal corridor, so there is nothing to act on right now.`
  }
  if (analysis.sudden.flagged) {
    return `Your ${biomarker.name} reading of ${latest} sits ${diffText(analysis)} your personal baseline from your recent readings. That is a sudden change relative to your own pattern — it may be a one-off, but it is worth mentioning on your next visit.`
  }
  const trend =
    analysis.drift.direction === 'down'
      ? `Your ${biomarker.name} has been drifting down across your recent readings.`
      : `Your ${biomarker.name} has been drifting up across your recent readings.`
  return `${trend} The latest reading of ${latest} is roughly ${analysis.absPercent.toFixed(1)}% ${analysis.percent > 0 ? 'above' : 'below'} your baseline. A gradual ${analysis.drift.direction === 'down' ? 'downward' : 'upward'} trend across your last five readings is worth highlighting.`
}

function explanation(biomarker, analysis) {
  if (analysis.sudden.flagged) {
    return `Your latest reading of ${fmtVal(analysis.latest, biomarker.step)} ${biomarker.unit} is ${Math.abs(analysis.sudden.z).toFixed(1)}x the typical spread of your recent values, beyond the 2.5x threshold we treat as a sudden change. The baseline is the average of your four most recent prior readings.`
  }
  if (analysis.drift.flagged) {
    return `We fitted a trend line through your last five readings. The ${analysis.drift.direction === 'down' ? 'downward' : 'upward'} slope of about ${(Math.abs(analysis.drift.rate) * 100).toFixed(1)}% per reading crossed our 5% per-reading threshold, so the sequence was flagged as ${analysis.tag.toLowerCase()}.`
  }
  return `No flag was raised. Your latest reading stays close to the average of your four most recent prior readings, and no consistent upward or downward slope was found across the last five readings.`
}

function MedicalNotice() {
  return (
    <aside className="ov-medical">
      <div className="ov-medical-head">
        <span className="ov-medical-icon">
          <WarnIcon size={17} />
        </span>
        <span className="ov-medical-title">Important Medical Notice</span>
      </div>
      <p>
        This is not a diagnosis. Do not start, stop, or change medication based
        on this prototype. Discuss any concerning or persistent trend with a
        qualified doctor.
      </p>
    </aside>
  )
}

function DataCard() {
  return (
    <section className="ov-data-card">
      <div className="ov-data-head">
        <span className="ov-data-icon">
          <ShieldIcon size={18} />
        </span>
        <span className="ov-data-title">Your data</span>
        <span className="ov-quality">Comparison quality: Good</span>
      </div>
      <p>
        This prototype uses manually entered fictional data and does not
        connect to a diagnostic laboratory.
      </p>
    </section>
  )
}

function StatRow({ number, label, tag, tone }) {
  return (
    <div className="ov-stat-row">
      <span className="ov-stat-number">{number}</span>
      <span className="ov-stat-label">{label}</span>
      {tag && (
        <span className={`ov-stat-tag ${tone || 'stable'}`}>{tag}</span>
      )}
    </div>
  )
}

function ResultCard({ biomarker, analysis, onOpen }) {
  return (
    <button type="button" className="ov-result-card" onClick={onOpen}>
      <div className="ov-result-head">
        <div className="ov-result-name-row">
          <span className="ov-result-glyph">
            <BiomarkerGlyph id={biomarker.id} size={20} />
          </span>
          <span className="ov-result-name">{biomarker.name}</span>
        </div>
        <span className={`ov-tag ${analysis.status}`}>{analysis.tag}</span>
      </div>
      <div className="ov-result-value">
        {fmtVal(analysis.latest, biomarker.step)}
        <span className="ov-result-unit">{biomarker.unit}</span>
      </div>
      <div className="ov-result-meta">
        <span>
          Baseline:{' '}
          {fmtVal(analysis.baseline, biomarker.step)} {biomarker.unit}
        </span>
        <span>Direction: {analysis.direction}</span>
      </div>
      <div className={`ov-result-diff ${analysis.status}`}>
        {diffText(analysis)}
      </div>
      <div className="ov-result-foot">
        <span className="ov-result-date">
          Last updated: {fmtDate(analysis.latestDate)}
        </span>
        <span className="ov-trend-link">
          View trend <ArrowRightIcon size={15} />
        </span>
      </div>
    </button>
  )
}

function DetailView({ biomarker, analysis, onBack, onAddResult }) {
  const [copied, setCopied] = useState(false)
  const flagged = analysis.status === 'review'

  const copySummary = async (event) => {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(buildSummary(biomarker, analysis))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="ov-screen ov-detail-screen">
      <button type="button" className="ov-back" onClick={onBack}>
        <BackIcon size={18} /> Overview
      </button>

      <div className="ov-detail-eyebrow-row">
        <span className="ov-eyebrow">Personal Trend: {biomarker.name}</span>
        <span className="ov-audit-tag">Sequential Audit</span>
      </div>

      <h1 className="ov-detail-title">{biomarker.name}</h1>

      <div className="ov-callouts">
        <div className="ov-callout">
          <span>Latest result</span>
          <strong>
            {fmtVal(analysis.latest, biomarker.step)}{' '}
            <small>{biomarker.unit}</small>
          </strong>
        </div>
        <div className="ov-callout">
          <span>Personal baseline</span>
          <strong>
            {fmtVal(analysis.baseline, biomarker.step)}{' '}
            <small>{biomarker.unit}</small>
          </strong>
        </div>
        <div className="ov-callout">
          <span>Difference</span>
          <strong className={flagged ? 'ov-diff-review' : ''}>
            {diffText(analysis)}
          </strong>
        </div>
      </div>

      <p className="ov-seq">
        Historical readings: {analysis.count} sequential
      </p>

      <section className="ov-chart-card">
        <TrendChart
          values={analysis.values}
          dates={analysis.dates}
          low={biomarker.range.min}
          high={biomarker.range.max}
          baseline={analysis.baseline}
          unit={biomarker.unit}
          dec={decimalsOf(biomarker.step)}
        />
      </section>

      <section className="ov-card">
        <p className="ov-interp">{interpretation(biomarker, analysis)}</p>
        <p className="ov-prev-values">
          Previous readings: {previousValues(biomarker, analysis)}
        </p>
      </section>

      <section className="ov-card">
        <div className="ov-explain-title">
          <span className="ov-explain-icon">
            <InfoIcon size={17} />
          </span>
          How was this identified?
        </div>
        <p className="ov-explain-body">{explanation(biomarker, analysis)}</p>
        <p className="ov-proto-note">
          Prototype note: these calculations use simple statistical heuristics
          and are not clinically validated.
        </p>
      </section>

      {flagged && (
        <section className="ov-card ov-doctor-card">
          <div className="ov-doctor-head">
            <span className="ov-warn-icon">
              <WarnIcon size={17} />
            </span>
            <span className="ov-doctor-title">Prepare for your doctor</span>
          </div>
          <p className="ov-doctor-sub">
            {biomarker.name} was flagged{' '}
            {analysis.sudden.flagged
              ? 'for a sudden change'
              : `for a gradual ${analysis.drift.direction === 'down' ? 'downward' : 'upward'} drift`}
            . Bring note-ready context for your next visit.
          </p>
          <blockquote className="ov-prompt">
            &ldquo;{conversationPrompt(biomarker, analysis)}&rdquo;
          </blockquote>
          <span className="ov-prompt-label">
            Conversation prompt — not medical advice
          </span>
          <button type="button" className="ov-copy-btn" onClick={copySummary}>
            {copied ? 'Copied!' : 'Copy summary'}
          </button>
        </section>
      )}

      <button
        type="button"
        className="ov-primary"
        onClick={() => onAddResult(biomarker.id)}
      >
        <PlusIcon size={18} />
        Add new result
      </button>

      <DataCard />

      <MedicalNotice />
    </div>
  )
}

function HomeView({
  userName,
  tracked,
  records,
  stableCount,
  reviewCount,
  onAddResult,
  onOpenDetail,
}) {
  return (
    <div className="ov-screen">
      <header className="ov-header">
        <div className="ov-brand">
          <span className="ov-logo">
            <LeafLogo size={26} />
          </span>
          <span className="ov-brand-text">
            <span className="ov-wordmark">DriftCheck</span>
            <span className="ov-tagline">Personal lab trend companion</span>
          </span>
        </div>
        <div className="ov-header-actions">
          <button type="button" className="ov-icon-btn" aria-label="Notifications">
            <BellIcon size={20} />
          </button>
          <button type="button" className="ov-avatar" aria-label="Profile">
            {userName.slice(0, 2).toUpperCase()}
          </button>
        </div>
      </header>

      <span className="ov-proto">Privacy-first prototype</span>

      <section className="ov-greeting">
        <h1>Good morning, {userName}</h1>
        <p>
          Here is how your recent lab results compare with your own personal
          pattern.
        </p>
      </section>

<button
          type="button"
          className="ov-primary"
          onClick={() => onAddResult()}
        >
          <PlusIcon size={18} />
          Add new result
        </button>

      <section className="ov-section">
        <div className="ov-section-head">
          <h2>Your Overview</h2>
          <span className="ov-count">{records} total records</span>
        </div>
        <div className="ov-stats">
          <StatRow number={tracked.length} label="Biomarkers tracked" />
          <StatRow
            number={stableCount}
            label="Within personal pattern"
            tag="Stable"
          />
          <StatRow
            number={reviewCount}
            label="Discuss with doctor"
            tag="Review"
            tone="review"
          />
        </div>
      </section>

      {tracked.length > 0 && (
        <section className="ov-section">
          <div className="ov-section-head">
            <h2>Latest Lab Results</h2>
          </div>
          <div className="ov-results">
            {tracked.map((biomarker) => (
              <ResultCard
                key={biomarker.id}
                biomarker={biomarker}
                analysis={analyzeBiomarker(biomarker)}
                onOpen={() => onOpenDetail(biomarker.id)}
              />
            ))}
          </div>
        </section>
      )}

      <DataCard />

      <MedicalNotice />
    </div>
  )
}

function OverviewScreen({ userName = 'friend', onAddResult }) {
  const [detailId, setDetailId] = useState(null)

  const tracked = biomarkers.filter((biomarker) =>
    analyzeBiomarker(biomarker).hasData,
  )
  const records = tracked.length
  const stableCount = tracked.filter(
    (biomarker) => analyzeBiomarker(biomarker).status === 'stable',
  ).length
  const reviewCount = records - stableCount

  if (detailId) {
    const biomarker = getBiomarker(detailId)
    if (biomarker) {
      return (
        <DetailView
          biomarker={biomarker}
          analysis={analyzeBiomarker(biomarker)}
          onBack={() => setDetailId(null)}
          onAddResult={onAddResult}
        />
      )
    }
  }

  return (
    <HomeView
      userName={userName}
      tracked={tracked}
      records={records}
      stableCount={stableCount}
      reviewCount={reviewCount}
      onAddResult={onAddResult}
      onOpenDetail={(id) => setDetailId(id)}
    />
  )
}

export default OverviewScreen