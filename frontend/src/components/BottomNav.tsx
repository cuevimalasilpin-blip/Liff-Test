import { Link, useLocation } from 'react-router-dom'

interface Props { isCoach: boolean }

const IconHome = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconBook = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
)
const IconTrend = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
)
const IconStar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconSettings = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
)

export default function BottomNav({ isCoach }: Props) {
  const { pathname } = useLocation()

  const navItems = [
    { to: '/',         Icon: IconHome,     label: 'HOME' },
    { to: '/booking',  Icon: IconCalendar, label: 'BOOK' },
    { to: '/lessons',  Icon: IconBook,     label: 'LOG' },
    { to: '/progress', Icon: IconTrend,    label: 'PROGRESS' },
    { to: '/loyalty',  Icon: IconStar,     label: 'LOYALTY' },
    ...(isCoach ? [{ to: '/admin', Icon: IconSettings, label: 'ADMIN' }] : []),
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)',
      borderTop: '1px solid #e8e8e8',
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 0 calc(10px + env(safe-area-inset-bottom))', zIndex: 50,
    }}>
      {navItems.map(({ to, Icon, label }) => {
        const active = pathname === to
        return (
          <Link key={to} to={to} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 48, position: 'relative' }}>
            <span style={{ color: active ? '#ED1C24' : '#c0bfbd', transition: 'color 0.2s' }}>
              <Icon />
            </span>
            <span style={{
              fontSize: 9, fontFamily: 'Archivo,sans-serif', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 0.8,
              color: active ? '#ED1C24' : '#c0bfbd',
              transition: 'color 0.2s',
            }}>{label}</span>
            {active && (
              <div style={{
                position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                width: 24, height: 2, borderRadius: 2, background: '#ED1C24',
              }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
