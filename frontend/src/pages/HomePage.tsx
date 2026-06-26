import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getMe, getMyCourses, getMyBookings } from '../lib/api'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const TIER_BADGE: Record<string, { label: string; cls: string }> = {
  bronze: { label: '🥉 BRONZE', cls: 'badge badge-bronze' },
  silver: { label: '🥈 SILVER', cls: 'badge badge-silver' },
  gold:   { label: '🥇 GOLD',   cls: 'badge badge-gold'   },
}

export default function HomePage() {
  const { data: meData }      = useQuery({ queryKey: ['me'],       queryFn: getMe })
  const { data: coursesData } = useQuery({ queryKey: ['courses'],  queryFn: getMyCourses })
  const { data: bookingsData }= useQuery({ queryKey: ['bookings'], queryFn: getMyBookings })

  const user            = meData?.user
  const activeCourses   = coursesData?.courses?.filter((c: any) => c.is_active) || []
  const totalRemaining  = activeCourses.reduce((s: number, c: any) => s + c.remaining_hours, 0)
  const totalHours      = activeCourses.reduce((s: number, c: any) => s + c.total_hours, 0)
  const pct             = totalHours > 0 ? (totalRemaining / totalHours) * 100 : 0
  const nextBooking     = bookingsData?.bookings?.find((b: any) => b.status === 'confirmed')
  const upsell          = pct < 20 && activeCourses.length > 0
  const tier            = user?.tier || 'bronze'

  return (
    <div className="fade-in">
      {/* ── Top Bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ececec', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'Archivo,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#ED1C24' }}>UNDERPAR CLUB</p>
          <h2 style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: -0.5, marginTop: 2 }}>
            สวัสดี, {user?.display_name?.split(' ')[0] || '...'}
          </h2>
        </div>
        {user?.picture_url
          ? <img src={user.picture_url} alt="avatar" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
          : <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#f0eeec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Archivo', fontWeight: 700, color: '#999' }}>
              {user?.display_name?.[0] || '?'}
            </div>
        }
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* Tier + Points */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span className={TIER_BADGE[tier].cls}>{TIER_BADGE[tier].label}</span>
            <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>{user.points?.toLocaleString()} pts</span>
          </div>
        )}

        {/* Upsell Alert */}
        {upsell && (
          <Link to="/courses" style={{ display: 'block', textDecoration: 'none', background: '#fff0f0', border: '1px solid #ffc9c9', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>⚠️</span>
              <div>
                <p style={{ fontWeight: 700, color: '#c4171d', fontSize: 14 }}>ชั่วโมงเรียนใกล้หมดแล้ว!</p>
                <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>เหลือ {totalRemaining.toFixed(1)} ชั่วโมง — แตะเพื่อต่อ package</p>
              </div>
            </div>
          </Link>
        )}

        {/* Hours Hero Card */}
        <div style={{ background: '#141414', borderRadius: 20, padding: 24, marginBottom: 14, color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(237,28,36,0.15)' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(237,28,36,0.08)' }} />
          <p style={{ fontSize: 11, fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 2, color: '#888', fontWeight: 600 }}>ชั่วโมงเรียนคงเหลือ</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 52, letterSpacing: -2, lineHeight: 1 }}>{totalRemaining.toFixed(1)}</span>
            <span style={{ color: '#888', fontSize: 16 }}>ชั่วโมง</span>
          </div>
          {/* progress bar */}
          <div style={{ marginTop: 16 }}>
            <div className="progress-bar" style={{ background: '#2a2a2a' }}>
              <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: pct < 20 ? '#ED1C24' : '#ED1C24' }} />
            </div>
            {activeCourses[0] && (
              <p style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
                หมดอายุ {format(new Date(activeCourses[0].expires_at), 'd MMM yyyy', { locale: th })}
              </p>
            )}
          </div>
        </div>

        {/* Next Booking */}
        {nextBooking ? (
          <div className="card" style={{ padding: '16px 18px', marginBottom: 14, border: '1px solid #f0eeec' }}>
            <p style={{ fontSize: 11, fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 2, color: '#888', fontWeight: 600 }}>การจองถัดไป</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
              <div style={{ width: 44, height: 44, background: '#fff0f0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📅</div>
              <div>
                <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 16 }}>
                  {format(new Date(nextBooking.time_slots?.start_time), 'EEEE d MMMM', { locale: th })}
                </p>
                <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>
                  {format(new Date(nextBooking.time_slots?.start_time), 'HH:mm')} น.
                  {nextBooking.time_slots?.users?.display_name && ` · ${nextBooking.time_slots.users.display_name}`}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Link to="/booking" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ border: '2px dashed #e3e3e3', borderRadius: 16, padding: '16px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, background: '#fff0f0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>➕</div>
              <div>
                <p style={{ fontWeight: 700, color: '#ED1C24', fontSize: 15 }}>จองเวลาเรียน</p>
                <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>เลือก time slot ที่ว่างได้เลย</p>
              </div>
            </div>
          </Link>
        )}

        {/* Quick Menu Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { to: '/courses',  emoji: '🎓', label: 'Course Hours',   sub: `${totalRemaining.toFixed(1)} ชม.คงเหลือ` },
            { to: '/lessons',  emoji: '📖', label: 'บันทึกการเรียน', sub: 'ย้อนดูเนื้อหา' },
            { to: '/progress', emoji: '📈', label: 'Swing Progress',  sub: 'ดู Stats ของคุณ' },
            { to: '/loyalty',  emoji: '⭐', label: 'Loyalty & Points', sub: `${user?.points || 0} pts` },
          ].map(item => (
            <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '16px 14px', border: '1px solid #f0eeec' }}>
                <span style={{ fontSize: 26 }}>{item.emoji}</span>
                <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 14, marginTop: 8, color: '#141414' }}>{item.label}</p>
                <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Referral Banner */}
        <Link to="/referral" style={{ textDecoration: 'none', display: 'block', marginTop: 10, marginBottom: 4 }}>
          <div style={{ background: '#141414', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#fff', fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 14 }}>แนะนำเพื่อน รับ 200 pts</p>
              <p style={{ color: '#666', fontSize: 12, marginTop: 2 }}>แชร์ link ชวนเพื่อนมาเรียน</p>
            </div>
            <span style={{ color: '#ED1C24', fontSize: 22 }}>🤝</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
