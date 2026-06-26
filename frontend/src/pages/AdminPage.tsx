import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAdminDashboard, getAllStudents, getRevenue } from '../lib/api'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

type Tab = 'today' | 'students' | 'revenue'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('today')
  const [search, setSearch] = useState('')

  const { data: dash }     = useQuery({ queryKey: ['adminDash'],     queryFn: getAdminDashboard })
  const { data: studData } = useQuery({ queryKey: ['students', search], queryFn: () => getAllStudents(search) })
  const { data: rev }      = useQuery({ queryKey: ['revenue'],        queryFn: getRevenue })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'today',    label: '📅 วันนี้' },
    { key: 'students', label: '👥 นักเรียน' },
    { key: 'revenue',  label: '💰 Revenue' },
  ]

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <p className="section-label" style={{ fontSize: 11 }}>ADMIN · จัดการ</p>
          <h1 style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: -0.5, marginTop: 4 }}>Dashboard</h1>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 16px', background: '#fff', borderBottom: '1px solid #ececec', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 999, border: tab === t.key ? '2px solid #ED1C24' : '1.5px solid #e3e3e3', background: tab === t.key ? '#ED1C24' : '#fff', color: tab === t.key ? '#fff' : '#141414', fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {/* TODAY */}
        {tab === 'today' && (
          <>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#141414', borderRadius: 14, padding: '16px' }}>
                <p style={{ fontSize: 10, color: '#666', fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>นักเรียนวันนี้</p>
                <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 36, color: '#fff', letterSpacing: -1, marginTop: 4 }}>{dash?.todayBookings?.length || 0}</p>
              </div>
              <div style={{ background: '#141414', borderRadius: 14, padding: '16px' }}>
                <p style={{ fontSize: 10, color: '#666', fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>นักเรียนทั้งหมด</p>
                <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 36, color: '#fff', letterSpacing: -1, marginTop: 4 }}>{dash?.totalStudents || 0}</p>
              </div>
            </div>

            {/* Today Schedule */}
            <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>ตารางวันนี้</p>
            {dash?.todayBookings?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#888', background: '#f7f6f4', borderRadius: 14 }}>
                <p>ไม่มีนักเรียนวันนี้</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {dash?.todayBookings?.map((b: any) => (
                  <div key={b.id} className="card" style={{ padding: '14px 16px', border: '1px solid #f0eeec' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 16 }}>
                          {format(new Date(b.time_slots?.start_time), 'HH:mm')} น.
                        </p>
                        <p style={{ fontSize: 14, color: '#333', marginTop: 2 }}>{b.users?.display_name}</p>
                        <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{b.time_slots?.branch === 'ratchayothin' ? 'รัชโยธิน' : 'พระราม 3'}</p>
                      </div>
                      <span style={{ background: '#f0fff4', color: '#059669', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontFamily: 'Archivo,sans-serif', fontWeight: 700 }}>
                        Confirmed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Expiring Courses */}
            {dash?.expiringCourses?.length > 0 && (
              <>
                <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 10, color: '#ED1C24' }}>⚠️ Course ใกล้หมดอายุ (30 วัน)</p>
                {dash.expiringCourses.map((c: any) => (
                  <div key={c.id} style={{ background: '#fff8f8', border: '1px solid #ffc9c9', borderRadius: 14, padding: '14px 16px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{c.users?.display_name}</p>
                        <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{c.package_name} · เหลือ {c.remaining_hours?.toFixed(1)} ชม.</p>
                      </div>
                      <p style={{ fontSize: 12, color: '#c4171d', fontWeight: 700, textAlign: 'right' }}>
                        {format(new Date(c.expires_at), 'd MMM', { locale: th })}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* STUDENTS */}
        {tab === 'students' && (
          <>
            <input placeholder="🔍 ค้นหาชื่อนักเรียน..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 14 }} />
            {studData?.students?.map((s: any) => {
              const active = s.courses?.filter((c: any) => c.is_active) || []
              const totalHrs = active.reduce((sum: number, c: any) => sum + (c.remaining_hours || 0), 0)
              return (
                <div key={s.id} className="card" style={{ padding: '14px 16px', border: '1px solid #f0eeec', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {s.picture_url
                      ? <img src={s.picture_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0eeec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Archivo', fontWeight: 700, color: '#999', flexShrink: 0 }}>
                          {s.display_name?.[0]}
                        </div>
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{s.display_name}</p>
                        <span style={{ fontSize: 12, color: '#ED1C24', fontFamily: 'Archivo,sans-serif', fontWeight: 700 }}>
                          {totalHrs.toFixed(1)} ชม.
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                        {s.tier?.toUpperCase()} · {s.points} pts · {s.total_hours?.toFixed(1)} ชม.รวม
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* REVENUE */}
        {tab === 'revenue' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#141414', borderRadius: 14, padding: '18px' }}>
                <p style={{ fontSize: 10, color: '#666', fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>เดือนนี้</p>
                <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 26, color: '#fff', letterSpacing: -1, marginTop: 4 }}>
                  ฿{(rev?.monthlyRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div style={{ background: '#141414', borderRadius: 14, padding: '18px' }}>
                <p style={{ fontSize: 10, color: '#666', fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>ทั้งหมด</p>
                <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 26, color: '#ED1C24', letterSpacing: -1, marginTop: 4 }}>
                  ฿{(rev?.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="card" style={{ padding: '16px 18px', border: '1px solid #f0eeec', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 32, letterSpacing: -1 }}>{rev?.totalPackagesSold || 0}</p>
              <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>packages ที่ขายทั้งหมด</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
