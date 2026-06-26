import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMyProgress, getLatestStats } from '../lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const MONTHS_OPTIONS = [3, 6, 12]

export default function ProgressPage() {
  const [months, setMonths] = useState(6)
  const { data: progressData } = useQuery({ queryKey: ['progress', months], queryFn: () => getMyProgress(months) })
  const { data: latestData }   = useQuery({ queryKey: ['latestStats'],       queryFn: getLatestStats })

  const progress = progressData?.progress || []
  const latest   = latestData?.latest
  const chartData = progress.map((p: any) => ({
    date: format(new Date(p.recorded_at), 'd MMM', { locale: th }),
    handicap: p.handicap,
    driving: p.driving_distance,
    putting: p.putting_avg,
    gir: p.gir_percentage,
  }))

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <p className="section-label" style={{ fontSize: 11 }}>PROGRESS · พัฒนาการ</p>
          <h1 style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: -0.5, marginTop: 4 }}>Swing Progress</h1>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Latest Stats */}
        {latest ? (
          <div style={{ background: '#141414', borderRadius: 20, padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 2, color: '#666', fontWeight: 600, marginBottom: 14 }}>Stats ล่าสุด</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {latest.handicap !== null && <DarkStat label="Handicap" value={latest.handicap} unit="" />}
              {latest.driving_distance && <DarkStat label="Driving" value={latest.driving_distance} unit="m" />}
              {latest.putting_avg && <DarkStat label="Putting Avg" value={latest.putting_avg} unit="" />}
              {latest.gir_percentage && <DarkStat label="GIR" value={latest.gir_percentage} unit="%" />}
            </div>
          </div>
        ) : (
          <div style={{ background: '#f7f6f4', borderRadius: 16, padding: 20, marginBottom: 16, textAlign: 'center', color: '#888' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>📊</p>
            <p style={{ fontWeight: 600, color: '#141414' }}>ยังไม่มีข้อมูล Stats</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>โค้ชจะบันทึก stats หลังเรียนแต่ละครั้ง</p>
          </div>
        )}

        {/* Month Selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {MONTHS_OPTIONS.map(m => (
            <button key={m} onClick={() => setMonths(m)}
              style={{
                padding: '7px 16px', borderRadius: 999, border: months === m ? '2px solid #ED1C24' : '1.5px solid #e3e3e3',
                background: months === m ? '#ED1C24' : '#fff', color: months === m ? '#fff' : '#141414',
                fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>
              {m} เดือน
            </button>
          ))}
        </div>

        {/* Charts */}
        {chartData.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center', color: '#888', border: '1px solid #f0eeec' }}>
            <p style={{ fontSize: 13 }}>ยังไม่มีข้อมูลใน {months} เดือนที่ผ่านมา</p>
          </div>
        ) : (
          <>
            {/* Handicap Trend */}
            {chartData.some((d: any) => d.handicap !== null) && (
              <ChartCard title="Handicap Trend" subtitle="ยิ่งน้อยยิ่งดี">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0eeec" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#999' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#999' }} reversed />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e3e3e3', fontSize: 13 }} />
                    <Line type="monotone" dataKey="handicap" stroke="#ED1C24" strokeWidth={2.5} dot={{ fill: '#ED1C24', r: 4 }} name="Handicap" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* Driving Distance */}
            {chartData.some((d: any) => d.driving !== null) && (
              <ChartCard title="Driving Distance" subtitle="เมตร">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0eeec" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#999' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#999' }} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e3e3e3', fontSize: 13 }} />
                    <Line type="monotone" dataKey="driving" stroke="#141414" strokeWidth={2.5} dot={{ fill: '#141414', r: 4 }} name="Driving (m)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* GIR */}
            {chartData.some((d: any) => d.gir !== null) && (
              <ChartCard title="Greens In Regulation" subtitle="%">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0eeec" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#999' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#999' }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e3e3e3', fontSize: 13 }} />
                    <Line type="monotone" dataKey="gir" stroke="#ED1C24" strokeWidth={2.5} dot={{ fill: '#ED1C24', r: 4 }} name="GIR %" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function DarkStat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div style={{ background: '#1e1e1e', borderRadius: 12, padding: '12px 14px' }}>
      <p style={{ fontSize: 10, color: '#666', fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>{label}</p>
      <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: -1, color: '#fff', marginTop: 4, lineHeight: 1 }}>
        {value}<span style={{ fontSize: 13, fontWeight: 500, color: '#666', marginLeft: 2 }}>{unit}</span>
      </p>
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '16px 18px', border: '1px solid #f0eeec', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 14 }}>{title}</p>
        <p style={{ fontSize: 12, color: '#888' }}>{subtitle}</p>
      </div>
      {children}
    </div>
  )
}
