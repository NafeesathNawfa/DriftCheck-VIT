export function LeafLogo({ size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 20C4 10.5 11 5 20 4c1 9-.5 15-9 16-1.7.2-3.5-.2-5-1.5" />
      <path d="M4 20c1.5-6 5-11 12-13" />
    </svg>
  )
}

export function ProfileIcon({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="14" cy="11" r="4" />
      <path d="M6.5 23c1.6-3.4 4.2-5 7.5-5s5.9 1.6 7.5 5" />
    </svg>
  )
}

export function CalmIcon({ size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M13 2.5c4 3.2 8 4 11 4v6.6c0 4.8-4.4 8.4-11 10.4C6.4 21.5 2 17.9 2 13.1V6.5c3 0 7-.8 11-4Z" />
      <path d="M8.5 13.5l3 3 6.5-6.5" />
    </svg>
  )
}

export function DropIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5c3.4 4 5.5 7 5.5 10a5.5 5.5 0 0 1-11 0c0-3 2.1-6 5.5-10Z" />
      <path d="M9.5 15.5c0 1 1 2 2 2.5" />
    </svg>
  )
}

export function ThyroidIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 7.5c-2.6 0-4.5 2.8-3.9 5.6.4 1.9 1 3.6 1.6 5l.5 1.4h3.6l.5-1.4c.6-1.4 1.1-3.1 1.6-5 .5-2.8-1.5-5.6-3.9-5.6Z" />
      <path d="M9 8.5c-.5-1.4 0-2.8 1-3.5M12 7.5c0-1 0-2 .4-2.8M12 7.5c1-1.6 2.6-2.2 3.6-1.7" />
    </svg>
  )
}

export function SugarIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5c4 3 6.5 6 6.5 9.5a6.5 6.5 0 0 1-13 0c0-3.5 2.5-6.5 6.5-9.5Z" />
      <path d="M12 6v12" />
    </svg>
  )
}

export function KidneyIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5c-3.8.5-5.6 3.4-5.6 6.6 0 2.5.8 4 2.3 6l1.6 2.9c-1-2 .9-3.6 2.3-5 1-1 1.6-2.1 1.8-3.5.4-2.7-.6-6.3-2.4-7Z" />
      <path d="M12 3.5c3.8.5 5.6 3.4 5.6 6.6 0 2.5-.8 4-2.3 6l-1.6 2.9c1-2-.9-3.6-2.3-5-1-1-1.6-2.1-1.8-3.5-.4-2.7.6-6.3 2.4-7Z" />
    </svg>
  )
}

export function BiomarkerGlyph({ id, size = 22 }) {
  switch (id) {
    case 'hemoglobin':
      return <DropIcon size={size} />
    case 'tsh':
      return <ThyroidIcon size={size} />
    case 'hba1c':
      return <SugarIcon size={size} />
    case 'creatinine':
      return <KidneyIcon size={size} />
    default:
      return <DropIcon size={size} />
  }
}

export function OverviewIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4h7v7H4V4ZM13 4h7v4h-7V4ZM13 11h7v9h-7v-9ZM4 14h7v6H4v-6Z" />
    </svg>
  )
}

export function TrendsIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 17l5.5-6 4 3.5L20 6" />
      <path d="M15 6h5v5" />
    </svg>
  )
}

export function LogIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function InsightsIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a7 7 0 0 0-4.2 12.6c.7.6 1.2 1.4 1.2 2.4h6c0-1 .5-1.8 1.2-2.4A7 7 0 0 0 12 3Z" />
      <path d="M9 21h6" />
    </svg>
  )
}

export function ProfileTabIcon({ size = 22 }) {
  return <ProfileIcon size={size} />
}

export function ArrowRightIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}

export function BackIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 12H5M11 6l-6 6 6 6" />
    </svg>
  )
}