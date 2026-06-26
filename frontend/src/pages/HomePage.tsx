import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getMe, getMyCourses, getMyBookings } from '../lib/api'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const TIER_COLORS: Record<string, { bg: string; color: string }> = {
  bronze: { bg: '#f5ede4', color: '#9c6e3c' },
  silver: { bg: '#f0f0f0', color: '#6b6b6b' },
  gold:   { bg: '#fdf4dc', color: '#9a7710' },
}

const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconBook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
)
const IconTrend = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
)
const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconAlert = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
)

export default function HomePage() {
  const { data: meData }       = useQuery({ queryKey: ['me'],       queryFn: getMe })
  const { data: coursesData }  = useQuery({ queryKey: ['courses'],  queryFn: getMyCourses })
  const { data: bookingsData } = useQuery({ queryKey: ['bookings'], queryFn: getMyBookings })

  const user           = meData?.user
  const activeCourses  = coursesData?.courses?.filter((c: any) => c.is_active) || []
  const totalRemaining = activeCourses.reduce((s: number, c: any) => s + c.remaining_hours, 0)
  const totalHours     = activeCourses.reduce((s: number, c: any) => s + c.total_hours, 0)
  const pct            = totalHours > 0 ? (totalRemaining / totalHours) * 100 : 0
  const nextBooking    = bookingsData?.bookings?.find((b: any) => b.status === 'confirmed')
  const upsell         = pct < 20 && activeCourses.length > 0
  const tier           = user?.tier || 'bronze'
  const tierStyle      = TIER_COLORS[tier] || TIER_COLORS.bronze

  return (
    <div style={{ background: '#f7f6f4', minHeight: '100vh', paddingBottom: 90 }}>

      {/* ── Header ── */}
      <div style={{ background: '#fff', padding: '16px 20px 14px', borderBottom: '1px solid #efefef' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'Archivo,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#ED1C24', marginBottom: 3 }}>
              UNDERPAR CLUB
            </p>
            <h1 style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: -0.5, color: '#141414', lineHeight: 1.1 }}>
              สวัสดี, {user?.display_name?.split(' ')[0] || '—'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user && (
              <span style={{
                background: tierStyle.bg, color: tierStyle.color,
                fontFamily: 'Archivo,sans-serif', fontSize: 10, fontWeight: 800,
                letterSpacing: 1.5, textTransform: 'uppercase',
                padding: '4px 10px', borderRadius: 20,
              }}>
                {tier}
              </span>
            )}
            {user?.picture_url
              ? <img src={user.picture_url} alt="avatar" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f0f0f0' }} />
              : <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Archivo', fontWeight: 800, fontSize: 16, color: '#fff' }}>
                  {user?.display_name?.[0] || '?'}
                </div>
            }
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Upsell Alert ── */}
        {upsell && (
          <Link to="/courses" style={{ textDecoration: 'none', display: 'block', marginBottom: 12 }}>
            <div style={{ background: '#fff', border: '1.5px solid #ED1C24', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ color: '#ED1C24', flexShrink: 0 }}><IconAlert /></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 14, color: '#141414' }}>ชั่วโมงเรียนใกล้หมดแล้ว</p>
                <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>เหลือ {totalRemaining.toFixed(1)} ชม. — ต่อแพ็กเกจได้เลย</p>
              </div>
              <div style={{ color: '#ED1C24', flexShrink: 0 }}><IconArrow /></div>
            </div>
          </Link>
        )}

        {/* ── Hours Hero ── */}
        <div style={{ background: '#141414', borderRadius: 20, padding: '24px 24px 20px', marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(237,28,36,0.12)' }} />
          <div style={{ position: 'absolute', bottom: -20, right: 30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(237,28,36,0.07)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666', marginBottom: 8 }}>
            <IconClock />
            <p style={{ fontFamily: 'Archivo,sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#666' }}>ชั่วโมงเรียนคงเหลือ</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 56, letterSpacing: -3, lineHeight: 1, color: '#fff' }}>
              {totalRemaining.toFixed(1)}
            </span>
            <span style={{ color: '#555', fontSize: 18, fontFamily: 'Archivo,sans-serif', fontWeight: 500 }}>ชั่วโมง</span>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ background: '#2a2a2a', borderRadius: 99, height: 4, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: '#ED1C24', borderRadius: 99, transition: 'width 0.6s ease' }} />
            </div>
            {activeCourses[0] && (
              <p style={{ fontSize: 12, color: '#555', marginTop: 8, fontFamily: 'Archivo,sans-serif' }}>
                หมดอายุ {format(new Date(activeCourses[0].expires_at), 'd MMM yyyy', { locale: th })}
              </p>
            )}
          </div>
        </div>

        {/* ── Next Booking ── */}
        {nextBooking ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', marginBottom: 12, border: '1px solid #efefef' }}>
            <p style={{ fontFamily: 'Archivo,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#bbb', marginBottom: 10 }}>การจองถัดไป</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, background: '#f7f6f4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ED1C24' }}>
                <IconCalendar />
              </div>
              <div>
                <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 16, color: '#141414' }}>
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
          <Link to="/booking" style={{ textDecoration: 'none', display: 'block', marginBottom: 12 }}>
            <div style={{ background: '#fff', border: '1.5px dashed #ddd', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, background: '#fff0f0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ED1C24' }}>
                <IconPlus />
              </div>
              <div>
                <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 15, color: '#ED1C24' }}>จองเวลาเรียน</p>
                <p style={{ color: '#aaa', fontSize: 13, marginTop: 2 }}>เลือก time slot ที่ว่างได้เลย</p>
              </div>
            </div>
          </Link>
        )}

        {/* ── Quick Menu ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {[
            { to: '/courses',  Icon: IconClock,  label: 'Course Hours',    sub: `${totalRemaining.toFixed(1)} ชม.คงเหลือ` },
            { to: '/lessons',  Icon: IconBook,   label: 'บันทึกการเรียน',  sub: 'ย้อนดูเนื้อหา' },
            { to: '/progress', Icon: IconTrend,  label: 'Swing Progress',   sub: 'ดู Stats ของคุณ' },
            { to: '/loyalty',  Icon: IconStar,   label: 'Loyalty & Points', sub: `${user?.points?.toLocaleString() || 0} pts` },
          ].map(({ to, Icon, label, sub }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: '18px 16px', border: '1px solid #efefef', height: '100%' }}>
                <div style={{ color: '#141414', marginBottom: 10 }}><Icon /></div>
                <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 14, color: '#141414', marginBottom: 3 }}>{label}</p>
                <p style={{ fontSize: 12, color: '#aaa' }}>{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Referral Banner ── */}
        <Link to="/referral" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ background: '#141414', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: 'rgba(237,28,36,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ED1C24' }}>
                <IconUsers />
              </div>
              <div>
                <p style={{ color: '#fff', fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 14 }}>แนะนำเพื่อน รับ 200 pts</p>
                <p style={{ color: '#555', fontSize: 12, marginTop: 2 }}>แชร์ลิงก์ชวนเพื่อนมาเรียน</p>
              </div>
            </div>
            <div style={{ color: '#555' }}><IconArrow /></div>
          </div>
        </Link>

      </div>
    </div>
  )
}
