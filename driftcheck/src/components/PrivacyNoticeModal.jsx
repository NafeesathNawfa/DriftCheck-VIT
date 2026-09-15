import { useEffect } from 'react'
import './PrivacyNoticeModal.css'

function ShieldCheckIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function CloseIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function PrivacyNoticeModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="privacy-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="privacy-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
      >
        <header className="privacy-modal-header">
          <div className="privacy-modal-title-row">
            <span className="privacy-icon-pill">
              <ShieldCheckIcon size={20} />
            </span>
            <h2 id="privacy-modal-title">Privacy Protected</h2>
          </div>
          <button
            type="button"
            className="privacy-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon size={20} />
          </button>
        </header>

        <div className="privacy-modal-body">
          {/* Primary Required Notice */}
          <div className="privacy-primary-notice">
            <p>
              <strong>Your laboratory data is protected</strong> using secure data
              handling, tokenized patient identifiers, access controls, and
              encryption.
            </p>
            <p className="privacy-secondary-text">
              Only the information required to process your laboratory results is used.
            </p>
          </div>

          {/* Defense-in-Depth Pillars */}
          <div className="privacy-pillars-grid">
            <div className="privacy-pillar">
              <span className="pillar-tag">1. Data Minimization</span>
              <h3>Targeted AI Extraction</h3>
              <p>
                Before analysis, names, dates of birth, phone numbers, and physician
                details are redacted. AI extraction only processes test names,
                results, units, ranges, and dates.
              </p>
            </div>

            <div className="privacy-pillar">
              <span className="pillar-tag">2. Patient Tokenization</span>
              <h3>Identity Vault Separation</h3>
              <p>
                Laboratory entries are identified by an internal random token (e.g.{' '}
                <code>PAT_7F3A91B2</code>) rather than repeating your name. Identity
                mappings are logically isolated.
              </p>
            </div>

            <div className="privacy-pillar">
              <span className="pillar-tag">3. Robust Encryption</span>
              <h3>In-Transit &amp; Rest Controls</h3>
              <p>
                TLS 1.3 encrypts data in transit. Supabase database volumes use
                AES-256 at rest with Row Level Security (RLS). Secret keys are
                never accessible to the frontend.
              </p>
            </div>

            <div className="privacy-pillar">
              <span className="pillar-tag">4. Clinical Integrity</span>
              <h3>No Noise on Your Data</h3>
              <p>
                Differential privacy noise is <strong>never</strong> added to your
                individual lab results so your longitudinal corridor remains
                accurate. DP is reserved strictly for aggregate population stats.
              </p>
            </div>

            <div className="privacy-pillar">
              <span className="pillar-tag">5. Data Retention</span>
              <h3>Immediate Purge</h3>
              <p>
                Uploaded laboratory PDFs are purged immediately once structured
                values are validated and stored. Documents are not retained indefinitely.
              </p>
            </div>

            <div className="privacy-pillar">
              <span className="pillar-tag">6. Audit Logging</span>
              <h3>Forensic Traceability</h3>
              <p>
                Access and update events are logged for security oversight without
                ever recording raw medical text or personal identifiers in log sinks.
              </p>
            </div>
          </div>

          {/* Explicit Non-Clinical Hackathon Disclaimer */}
          <div className="privacy-disclaimer-box">
            <h4>Hackathon Prototype Notice</h4>
            <p>
              DriftCheck is an educational and preventive health hackathon prototype.
              It is <strong>not</strong> a certified clinical production system and
              does not provide medical diagnoses or emergency healthcare advice.
              While we implement defense-in-depth principles, we do not claim that
              the application is &ldquo;100% anonymous&rdquo; or &ldquo;100%
              secure.&rdquo;
            </p>
          </div>
        </div>

        <footer className="privacy-modal-footer">
          <button type="button" className="btn btn-accent btn-block" onClick={onClose}>
            Understood
          </button>
        </footer>
      </div>
    </div>
  )
}

export default PrivacyNoticeModal
