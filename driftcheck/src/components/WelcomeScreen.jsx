import { biomarkers } from '../config/biomarkers'
import {
  ArrowRightIcon,
  BiomarkerGlyph,
  CalmIcon,
  LeafLogo,
  ProfileIcon,
} from './icons'
import './WelcomeScreen.css'

function InfoCard() {
  return (
    <section className="info-card" aria-label="Zero alarmist metrics">
      <span className="info-card-icon">
        <CalmIcon />
      </span>
      <div className="info-card-body">
        <h2>Zero alarmist metrics</h2>
        <p>
          Standard lab ranges often vary widely. DriftCheck organizes your
          values into clear, calm corridors so you see genuine trajectory, not
          false panic.
        </p>
      </div>
    </section>
  )
}

function LogFirstCard({ onManualEntry }) {
  return (
    <section className="log-first-card" aria-label="Log your first reading">
      <span className="log-first-tag">Manual Entry</span>
      <h2>Log Your First Reading</h2>
      <p>
        Enter your last 4 readings and a new one for any biomarker below.
        We&rsquo;ll check it against your own pattern, not just the general
        range.
      </p>
      <button type="button" className="btn btn-accent" onClick={onManualEntry}>
        Manual Entry
        <ArrowRightIcon />
      </button>
      <span className="private-note">Private by design</span>
    </section>
  )
}

function CategoryCard({ biomarker, onSelect }) {
  return (
    <button
      type="button"
      className="category-card"
      onClick={() => onSelect(biomarker)}
    >
      <span className="category-icon">
        <BiomarkerGlyph id={biomarker.id} />
      </span>
      <span className="category-main">
        <span className="category-title">{biomarker.category}</span>
        <span className="category-sub">Tracks {biomarker.name}</span>
        <span
          className={`category-status ${biomarker.ready ? 'is-ready' : ''}`}
        >
          <span className="dot" />
          {biomarker.status}
        </span>
      </span>
      <span className="category-side">
        <span className="category-range">{biomarker.rangeLabel}</span>
        <span className="category-add">+ Add Baseline</span>
      </span>
    </button>
  )
}

function WelcomeScreen({ userName = 'friend', onManualEntry, onSelectBiomarker }) {
  return (
    <div className="welcome-screen">
      <header className="app-header">
        <span className="wordmark">
          <span className="wordmark-icon">
            <LeafLogo />
          </span>
          DriftCheck
        </span>
        <span className="profile-icon" aria-label="Profile">
          <ProfileIcon />
        </span>
      </header>

      <div className="welcome-body">
        <section className="welcome-hero">
          <h1>Welcome to DriftCheck, {userName}</h1>
          <p>
            You don&rsquo;t have any logged readings yet. Establish your
            personalized baseline today to track subtle biological drift and
            longitudinal trends calmly over time.
          </p>
        </section>

        <InfoCard />
        <LogFirstCard onManualEntry={onManualEntry} />

        <section className="categories">
          <div className="categories-head">
            <h2>Biomarker Categories</h2>
            <p>
              Select a biomarker to start your personalized tracking profile.
            </p>
          </div>
          <div className="category-list">
            {biomarkers.map((biomarker) => (
              <CategoryCard
                key={biomarker.id}
                biomarker={biomarker}
                onSelect={onSelectBiomarker}
              />
            ))}
          </div>
        </section>

        <footer className="closing-note">
          Grounded in preventive awareness. Your health data stays yours —
          DriftCheck tracks your biomarkers longitudinally without selling your
          data or prompting medical panic.
        </footer>
      </div>
    </div>
  )
}

export default WelcomeScreen