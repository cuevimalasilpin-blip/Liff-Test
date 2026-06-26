/**
 * PageHeader — Standard header component used on every page
 *
 * Layout:
 *   Row 1: Underpar Club logo (SVG) | optional right element
 *   Row 2: Icon box (red) | Page title + subtitle
 */

interface PageHeaderProps {
  /** Page icon — pass an inline SVG element */
  icon: React.ReactNode
  /** Main heading text */
  title: string
  /** Subtitle / meta text below heading */
  subtitle?: string
  /** Optional element on the right side of logo row (e.g. back button, avatar) */
  rightElement?: React.ReactNode
}

const UnderparLogo = () => (
  <svg width="110" height="30" viewBox="0 0 260 80" xmlns="http://www.w3.org/2000/svg">
    <line x1="148" y1="8" x2="148" y2="52" stroke="#ED1C24" strokeWidth="5" strokeLinecap="round"/>
    <polygon points="148,8 148,30 172,19" fill="#ED1C24"/>
    <ellipse cx="148" cy="53" rx="8" ry="4" fill="#ED1C24" opacity="0.4"/>
    <text x="0" y="50" fontFamily="Archivo,sans-serif" fontWeight="800" fontSize="30" letterSpacing="2" fill="#141414">UNDER</text>
    <text x="160" y="50" fontFamily="Archivo,sans-serif" fontWeight="800" fontSize="30" letterSpacing="2" fill="#141414">AR</text>
    <text x="72" y="72" fontFamily="Archivo,sans-serif" fontWeight="500" fontSize="22" letterSpacing="4" fill="#141414">Club</text>
  </svg>
)

export default function PageHeader({ icon, title, subtitle, rightElement }: PageHeaderProps) {
  return (
    <div style={{
      background: '#fff',
      padding: '12px 18px 14px',
      borderBottom: '1px solid #e8e6e3',
    }}>
      {/* Logo row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <UnderparLogo />
        {rightElement}
      </div>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38,
          background: '#f0eeeb',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#ED1C24',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <h1 style={{
            fontFamily: 'Archivo,sans-serif',
            fontWeight: 900,
            fontSize: 20,
            letterSpacing: -0.5,
            color: '#141414',
            margin: 0,
            lineHeight: 1.1,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: 12,
              color: '#888',
              fontWeight: 600,
              margin: '2px 0 0',
              fontFamily: 'Archivo,sans-serif',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
