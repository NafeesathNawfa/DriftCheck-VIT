import {
  InsightsIcon,
  LogIcon,
  OverviewIcon,
  ProfileTabIcon,
  TrendsIcon,
} from './icons'
import './BottomTabBar.css'

const tabs = [
  { id: 'overview', label: 'Overview', Icon: OverviewIcon },
  { id: 'trends', label: 'Trends', Icon: TrendsIcon },
  { id: 'log', label: 'Log', Icon: LogIcon },
  { id: 'insights', label: 'Insights', Icon: InsightsIcon },
  { id: 'profile', label: 'Profile', Icon: ProfileTabIcon },
]

function BottomTabBar({ active = '', onSelect }) {
  return (
    <nav className="tab-bar" aria-label="Primary">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`tab ${id === 'log' ? 'tab-log' : ''} ${
            active === id ? 'is-active' : ''
          }`}
          onClick={() => onSelect?.(id)}
          aria-current={active === id ? 'page' : undefined}
        >
          {id === 'log' ? <Icon size={24} /> : <Icon size={22} />}
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

export default BottomTabBar