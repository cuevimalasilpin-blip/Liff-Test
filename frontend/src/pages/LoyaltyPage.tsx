import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getLoyaltySummary, getAllAchievements } from '../lib/api'
import PageHeader from '../components/PageHeader'

const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; next: string; hours: number }> = {
  bronze: { label: 'Bronze', color: '#a0540a', bg: '#fdf3e7', next: 'Silver', hours: 20 },
  silver: { label: 'Silver', color: '#4b5563', bg: '#f3f4f6', next: 'Gold',   hours: 50 },
  gold:   { label: 'Gold',   color: '#92400e', bg: '#fefce8', next: '—',      hours: 999 },
}

export default function LoyaltyPage() {
  const { data: summary }      = useQuery({ queryKey: ['loyalty'],       queryFn: getLoyaltySummary })
  const { data: achData }      = useQuery({ queryKey: ['achievements'],   queryFn: getAllAchievements })

  const tier         = summary?.tier || 'bronze'
  const tierCfg      = TIER_CONFIG[tier]
  const points       = summary?.points || 0
  const tp           = summary?.tierProgress
  const achievements = achData?.achievements || []
  const earned       = achievements.filter((a: any) => a.earned)
  const locked       = achievements.filter((a: any) => !a.earned)

  return (
    <div style={{ background: '#f0eeeb', minHeight: '100vh', paddingBottom: 90 }}>
      <PageHeader
        icon={<IconStar />}
        title="Loyalty & Points"
        subtitle={`${points.toLocaleString()} pts สะสม`}
      />

      <div style={{ padding: '12px 12px 0' }}>
        {/* Points Hero */}
        <div style={{ background: '#141414', borderRadius: 14, padding: 24, marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(237,28,36,0.12)' }} />
          <p style={{ fontSize: 11, fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 2, color: '#666', fontWeight: 600 }}>Points สะสม</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
            <span style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 52, letterSpacing: -2, color: '#fff', lineHeight: 1 }}>
              {points.toLocaleString()}
            </span>
            <span style={{ color: '#888', fontSize: 15 }}>pts</span>
          </div>
          <p style={{ color: '#666', fontSize: 13, marginTop: 6 }}>100 pts ต่อชั่วโมงที่เรียน</p>
        </div>

        {/* Tier Status */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e8e6e3', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 11, fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 2, color: '#888', fontWeight: 600 }}>ระดับปัจจุบัน</p>
              <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 26, letterSpacing: -0.5, marginTop: 4, color: tierCfg.color }}>
                {tierCfg.label}
              </p>
            </div>
            {tp?.next && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: '#888', fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>อีก</p>
                <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 18, color: '#141414' }}>{tp.hoursToNext?.toFixed(1)} ชม.</p>
                <p style={{ fontSize: 12, color: '#888' }}>สู่ {tp.next}</p>
              </div>
            )}
          </div>

          {tp?.next && (
            <>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(tp.progress, 100)}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: '#888' }}>{tierCfg.label}</span>
                <span style={{ fontSize: 11, color: '#888' }}>{tp.next}</span>
              </div>
            </>
          )}

          {tier === 'gold' && (
            <div style={{ background: '#fefce8', borderRadius: 10, padding: '10px 14px', marginTop: 8 }}>
              <p style={{ fontSize: 13, color: '#92400e', fontWeight: 700, fontFamily: 'Archivo,sans-serif' }}>คุณอยู่ที่ระดับสูงสุดแล้ว! ขอบคุณที่ไว้วางใจ Underpar Club</p>
            </div>
          )}
        </div>

        {/* Tier Benefits */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid #e8e6e3', marginBottom: 10 }}>
          <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: '#ED1C24', marginBottom: 12 }}>สิทธิประโยชน์ Tier</p>
          {[
            { tier: 'Bronze', benefit: 'เริ่มต้น · สะสม 100 pts/ชม.' },
            { tier: 'Silver', benefit: 'ส่วนลด 5% + Priority Booking (20+ ชม.)' },
            { tier: 'Gold',   benefit: 'ส่วนลด 10% + VIP Slot + Free Analysis (50+ ชม.)' },
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', paddingBottom: i < 2 ? 10 : 0, borderBottom: i < 2 ? '1px solid #f0eeeb' : 'none', marginBottom: i < 2 ? 10 : 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ED1C24', flexShrink: 0, marginTop: 5 }} />
              <div>
                <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 13 }}>{b.tier}</p>
                <p style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{b.benefit}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Referral CTA */}
        <Link to="/referral" style={{ textDecoration: 'none', display: 'block', marginBottom: 10 }}>
          <div style={{ background: '#ED1C24', borderRadius: 16, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#fff', fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 15 }}>แนะนำเพื่อน รับ 200 pts</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>แตะเพื่อดู Referral Code</p>
            </div>
            <span style={{ color: '#fff', fontSize: 24 }}>🤝</span>
          </div>
        </Link>

        {/* Achievements */}
        <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 15, letterSpacing: -0.3, marginBottom: 12 }}>
          Achievements ({earned.length}/{achievements.length})
        </p>

        {earned.length > 0 && (
          <>
            <p style={{ fontSize: 11, color: '#888', fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600, marginBottom: 8 }}>ปลดล็อคแล้ว</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {earned.map((a: any) => (
                <div key={a.id} className="card" style={{ padding: '14px 14px', border: '1px solid #f0eeec', textAlign: 'center' }}>
                  <div style={{ fontSize: 28 }}>{a.badge_icon}</div>
                  <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 12, marginTop: 6 }}>{a.name}</p>
                  {a.points_reward > 0 && <p style={{ fontSize: 11, color: '#ED1C24', fontWeight: 600, marginTop: 3 }}>+{a.points_reward} pts</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {locked.length > 0 && (
          <>
            <p style={{ fontSize: 11, color: '#888', fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600, marginBottom: 8 }}>ยังไม่ได้รับ</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {locked.map((a: any) => (
                <div key={a.id} style={{ background: '#f7f6f4', border: '1px solid #e3e3e3', borderRadius: 14, padding: '14px 14px', textAlign: 'center', opacity: 0.6 }}>
                  <div style={{ fontSize: 28, filter: 'grayscale(1)' }}>{a.badge_icon}</div>
                  <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 12, marginTop: 6, color: '#888' }}>{a.name}</p>
                  <p style={{ fontSize: 11, color: '#aaa', marginTop: 3 }}>{a.description}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
