/**
 * PageHeader — Design 001
 * Row 1: logo ชิดขวา + optional left element (e.g. back button)
 * Row 2: icon box (red, ซ้าย) + title + subtitle
 */

interface PageHeaderProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  leftElement?: React.ReactNode
}

const UnderparLogo = () => (
  <svg width="88" height="26" viewBox="0 0 260 80" xmlns="http://www.w3.org/2000/svg">
    <line x1="148" y1="8" x2="148" y2="52" stroke="#ED1C24" strokeWidth="5" strokeLinecap="round"/>
    <polygon points="148,8 148,30 172,19" fill="#ED1C24"/>
    <ellipse cx="148" cy="53" rx="8" ry="4" fill="#ED1C24" opacity="0.4"/>
    <text x="0" y="50" fontFamily="Archivo,sans-serif" fontWeight="800" fontSize="30" letterSpacing="2" fill="#141414">UNDER</text>
    <text x="160" y="50" fontFamily="Archivo,sans-serif" fontWeight="800" fontSize="30" letterSpacing="2" fill="#141414">AR</text>
    <text x="72" y="72" fontFamily="Archivo,sans-serif" fontWeight="500" fontSize="22" letterSpacing="4" fill="#141414">Club</text>
  </svg>
)

export default function PageHeader({ icon, title, subtitle, leftElement }: PageHeaderProps) {
  return (
    <div style={{ background: '#fff', padding: '10px 16px 12px', borderBottom: '1px solid #e8e6e3' }}>
      {/* Row 1: logo ชิดขวา */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        {leftElement ?? <span />}
        <UnderparLogo />
      </div>
      {/* Row 2: icon + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38,
          background: '#f0eeeb',
          borderRadius: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#ED1C24', flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <h1 style={{
            fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 19,
            letterSpacing: -0.4, color: '#141414', margin: 0, lineHeight: 1.1,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 12, color: '#888', fontWeight: 600, margin: '2px 0 0', fontFamily: 'Archivo,sans-serif' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
