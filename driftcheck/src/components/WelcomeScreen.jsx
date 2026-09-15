import { useState } from 'react'
import { biomarkers } from '../config/biomarkers'
import PrivacyNoticeModal from './PrivacyNoticeModal'
import {
  ArrowRightIcon,
  BiomarkerGlyph,
  CalmIcon,
  LeafLogo,
  ProfileIcon,
} from './icons'
import './WelcomeScreen.css'

function SectionEyebrow() {
  return (
    <div className="eyebrow-row">
      <span className="eyebrow-pill">First-Time Setup</span>
      <span className="eyebrow-text">Warm Baseline</span>
    </div>
  )
}

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

function PrivacyBannerCard({ onOpenPrivacy }) {
  return (
    <section className="privacy-banner-card" aria-label="Privacy Architecture">
      <div className="privacy-banner-body">
        <div className="privacy-banner-pill">
          <span>🛡️</span>
          <span>Privacy Protected</span>
        </div>
        <h3>Defense-in-depth medical data privacy</h3>
        <p>
          Tokenized patient identifiers, scrubbed AI extraction, and zero
          differential privacy noise on individual records.
        </p>
      </div>
      <button
        type="button"
        className="privacy-banner-btn"
        onClick={onOpenPrivacy}
      >
        View Architecture &rarr;
      </button>
    </section>
  )
}

function LogFirstCard({ onManualEntry, onOpenPrivacy }) {
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
      <button
        type="button"
        className="private-note-btn"
        onClick={onOpenPrivacy}
      >
        <span>🛡️</span>
        <span>Privacy Protected · Learn how</span>
      </button>
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
  const [showPrivacy, setShowPrivacy] = useState(false)

  return (
    <div className="welcome-screen">
      <header className="app-header">
        <span className="wordmark">
          <span className="wordmark-icon">
            <LeafLogo />
          </span>
          DriftCheck
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="privacy-header-pill"
            onClick={() => setShowPrivacy(true)}
          >
            🛡️ Privacy Protected
          </button>
          <span className="profile-icon" aria-label="Profile">
            <ProfileIcon />
          </span>
        </div>
      </header>

      <div className="welcome-body">
        <SectionEyebrow />

        <section className="welcome-hero">
          <h1>Welcome to DriftCheck, {userName}</h1>
          <p>
            You don&rsquo;t have any logged readings yet. Establish your
            personalized baseline today to track subtle biological drift and
            longitudinal trends calmly over time.
          </p>
        </section>

        <InfoCard />
        <LogFirstCard
          onManualEntry={onManualEntry}
          onOpenPrivacy={() => setShowPrivacy(true)}
        />
        <PrivacyBannerCard onOpenPrivacy={() => setShowPrivacy(true)} />

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
          <p className="closing-privacy-title">
            <strong>Privacy Protected</strong>
          </p>
          <p>
            Your laboratory data is protected using secure data handling,
            tokenized patient identifiers, access controls, and encryption. Only
            the information required to process your laboratory results is used.
          </p>
          <p className="closing-disclaimer">
            DriftCheck is a hackathon prototype — not a certified clinical
            production system.
          </p>
          <button
            type="button"
            className="privacy-footer-link"
            onClick={() => setShowPrivacy(true)}
          >
            Review Full Privacy &amp; Security Architecture &rarr;
          </button>
        </footer>
      </div>

      <PrivacyNoticeModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />
    </div>
  )
}

export default WelcomeScreen