import { Link, useLocation } from 'react-router-dom'

interface Props { isCoach: boolean }

export default function BottomNav({ isCoach }: Props) {
  const { pathname } = useLocation()

  const navItems = [
    { to: '/',        emoji: '🏠', label: 'หน้าหลัก' },
    { to: '/booking', emoji: '📅', label: 'จองเรียน' },
    { to: '/lessons', emoji: '📖', label: 'บันทึก' },
    { to: '/progress',emoji: '📈', label: 'Progress' },
    { to: '/loyalty', emoji: '⭐', label: 'Loyalty' },
    ...(isCoach ? [{ to: '/admin', emoji: '⚙️', label: 'Admin' }] : []),
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid #ececec', display: 'flex', justifyContent: 'space-around',
      padding: '8px 0 calc(8px + env(safe-area-inset-bottom))', zIndex: 50,
    }}>
      {navItems.map(item => {
        const active = pathname === item.to
        return (
          <Link key={item.to} to={item.to} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 48 }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>{item.emoji}</span>
            <span style={{
              fontSize: 10, fontFamily: 'Archivo,sans-serif', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 0.5,
              color: active ? '#ED1C24' : '#aaa',
            }}>{item.label}</span>
            {active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#ED1C24', marginTop: 1 }} />}
          </Link>
        )
      })}
    </nav>
  )
}
