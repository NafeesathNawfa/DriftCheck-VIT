import './BottomTabBar.css'

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'add', label: 'Add result' },
]

function HomeIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

function AddIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function ProfileIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1.2-3.6 4-5.4 7-5.4s5.8 1.8 7 5.4" />
    </svg>
  )
}

const ICONS = { home: HomeIcon, add: AddIcon, profile: ProfileIcon }

function BottomTabBar({ active, onSelect }) {
  const activeIndex = Math.max(
    TABS.findIndex((tab) => tab.id === active),
    0,
  )

  return (
    <nav className="tab-bar" aria-label="Primary">
      <div className="tab-bar-track" data-count={TABS.length}>
        <span
          className="tab-bar-indicator"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {TABS.map((tab) => {
          const Icon = ICONS[tab.id]
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              className={`tab${isActive ? ' is-active' : ''}`}
              onClick={() => onSelect(tab.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomTabBar