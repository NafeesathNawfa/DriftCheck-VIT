import { biomarkers } from '../config/biomarkers'
import { evaluateDrift } from '../lib/driftLogic'
import { BiomarkerGlyph } from './icons'
import './OverviewScreen.css'

function OverviewScreen({ userName }) {
  const tracked = biomarkers.filter((b) => {
    const readings = evaluateDrift(b)
    return readings.status !== 'baseline' || b.ready
  })
  const logged = biomarkers.filter((b) => evaluateDrift(b).status !== 'baseline')

  return (
    <div className="overview-screen">
      <header className="app-header">
        <span className="wordmark">DriftCheck</span>
        <span className="profile-icon" aria-label="Profile" />
      </header>

      <div className="overview-body">
        <h1>Welcome back, {userName}</h1>
        <p className="overview-sub">
          You&rsquo;re tracking {logged.length} of {biomarkers.length} biomarker
          categories so far. Keep the calm rhythm going.
        </p>

        <div className="overview-list">
          {tracked.map((biomarker) => {
            const result = evaluateDrift(biomarker)
            return (
              <div className="overview-card" key={biomarker.id}>
                <span className="overview-icon">
                  <BiomarkerGlyph id={biomarker.id} />
                </span>
                <span className="overview-main">
                  <span className="overview-title">{biomarker.category}</span>
                  <span className="overview-meta">
                    {result.label} · {biomarker.rangeLabel}
                  </span>
                </span>
              </div>
            )
          })}
        </div>

        <p className="overview-note">
          Full trend views and calm insights arrive with the next build.
        </p>
      </div>
    </div>
  )
}

export default OverviewScreen