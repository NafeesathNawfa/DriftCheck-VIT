import { useState } from 'react'
import { biomarkers } from '../config/biomarkers'
import { supabase } from '../lib/supabaseClient'
import PrivacyNoticeModal from './PrivacyNoticeModal'
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

function WelcomeScreen({
  session,
  userName = 'friend',
  onManualEntry,
  onSelectBiomarker,
}) {
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(
    session?.user.user_metadata?.name || '',
  )
  const [savingName, setSavingName] = useState(false)

  const displayName = session?.user.user_metadata?.name || userName
  const email = session?.user.email || ''

  const startEditingName = () => {
    setNameDraft(displayName === 'friend' ? '' : displayName)
    setEditingName(true)
  }

  const cancelEditingName = () => {
    setEditingName(false)
    setProfileOpen(false)
  }

  const saveName = async () => {
    const trimmed = nameDraft.trim()
    if (!trimmed) return
    setSavingName(true)
    const { error } = await supabase.auth.updateUser({ data: { name: trimmed } })
    setSavingName(false)
    if (!error) {
      setEditingName(false)
      setProfileOpen(false)
    }
  }

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
          <div className="welcome-profile-menu">
            <button
              type="button"
              className="profile-icon"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((open) => !open)}
            >
              <ProfileIcon />
            </button>
            {profileOpen && (
              <div className="welcome-profile-dropdown" role="menu">
                <div className="welcome-profile-summary">
                  <strong>{displayName}</strong>
                  <span>{email}</span>
                </div>
                {editingName ? (
                  <div className="welcome-profile-edit">
                    <label htmlFor="welcome-profile-name">Your name</label>
                    <input
                      id="welcome-profile-name"
                      type="text"
                      value={nameDraft}
                      onChange={(event) => setNameDraft(event.target.value)}
                      placeholder="Your name"
                      autoFocus
                    />
                    <div className="welcome-profile-actions">
                      <button type="button" onClick={saveName} disabled={savingName}>
                        {savingName ? '...' : 'Save'}
                      </button>
                      <button type="button" onClick={cancelEditingName}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="welcome-profile-item"
                      role="menuitem"
                      onClick={startEditingName}
                    >
                      Edit name
                    </button>
                    <button
                      type="button"
                      className="welcome-profile-item is-danger"
                      role="menuitem"
                      onClick={() => supabase.auth.signOut()}
                    >
                      Sign out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
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