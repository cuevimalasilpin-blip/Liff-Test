import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { getLessonDetail } from '../lib/api'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export default function LessonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({ queryKey: ['lesson', id], queryFn: () => getLessonDetail(id!) })
  const lesson = data?.lesson

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div style={{ width: 28, height: 28, border: '3px solid #ED1C24', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
    </div>
  )

  if (!lesson) return (
    <div style={{ textAlign: 'center', padding: 48, color: '#888' }}>
      <p>ไม่พบบันทึกนี้</p>
      <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate(-1)}>← กลับ</button>
    </div>
  )

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 4 }}>←</button>
        <div>
          <p className="section-label" style={{ fontSize: 11 }}>LESSON RECORD</p>
          <h1 style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: -0.5, marginTop: 2 }}>
            {format(new Date(lesson.date), 'd MMMM yyyy', { locale: th })}
          </h1>
        </div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Meta */}
        <div className="card" style={{ padding: '16px 18px', border: '1px solid #f0eeec', display: 'flex', gap: 16 }}>
          <MetaStat label="ระยะเวลา" value={`${lesson.duration_hours} ชม.`} />
          <div style={{ width: 1, background: '#ececec' }} />
          <MetaStat label="โค้ช" value={lesson.users?.display_name || '—'} />
          <div style={{ width: 1, background: '#ececec' }} />
          <MetaStat label="วันที่" value={format(new Date(lesson.date), 'd/M/yy')} />
        </div>

        {/* Technical */}
        {lesson.technical_notes && (
          <Section title="🏌️ Technical" color="#ED1C24">
            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#333' }}>{lesson.technical_notes}</p>
          </Section>
        )}

        {/* Tactical */}
        {lesson.tactical_notes && (
          <Section title="🎯 Tactical" color="#141414">
            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#333' }}>{lesson.tactical_notes}</p>
          </Section>
        )}

        {/* Mental */}
        {lesson.mental_notes && (
          <Section title="🧠 Mental" color="#555">
            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#333' }}>{lesson.mental_notes}</p>
          </Section>
        )}

        {/* Drills */}
        {lesson.drills_assigned?.length > 0 && (
          <Section title="💪 Drills ที่ต้องฝึก" color="#ED1C24">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lesson.drills_assigned.map((drill: any, i: number) => (
                <div key={i} style={{ background: '#f7f6f4', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 14 }}>{i + 1}. {drill.name}</p>
                  {drill.description && <p style={{ fontSize: 13, color: '#555', marginTop: 4, lineHeight: 1.5 }}>{drill.description}</p>}
                  {drill.repetitions && <p style={{ fontSize: 12, color: '#ED1C24', fontWeight: 600, marginTop: 6 }}>🔁 {drill.repetitions}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Swing Stats */}
        {lesson.swing_stats && Object.keys(lesson.swing_stats).length > 0 && (
          <Section title="📊 Stats วันนี้" color="#141414">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {lesson.swing_stats.handicap !== undefined && <StatBox label="Handicap" value={lesson.swing_stats.handicap} unit="" />}
              {lesson.swing_stats.driving_distance && <StatBox label="Driving" value={lesson.swing_stats.driving_distance} unit="m" />}
              {lesson.swing_stats.putting_avg && <StatBox label="Putting Avg" value={lesson.swing_stats.putting_avg} unit="" />}
              {lesson.swing_stats.gir_percentage && <StatBox label="GIR" value={lesson.swing_stats.gir_percentage} unit="%" />}
            </div>
          </Section>
        )}

        {/* Media */}
        {lesson.media_urls?.length > 0 && (
          <Section title="🎥 วิดีโอ / รูปภาพ" color="#141414">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {lesson.media_urls.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', background: '#f7f6f4', borderRadius: 10, overflow: 'hidden', aspectRatio: '16/9', textDecoration: 'none' }}>
                  {url.match(/\.(jpg|jpeg|png|webp)$/i)
                    ? <img src={url} alt={`media-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 28 }}>🎥</div>
                  }
                </a>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '16px 18px', border: '1px solid #f0eeec' }}>
      <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color, marginBottom: 12 }}>{title}</p>
      {children}
    </div>
  )
}

function MetaStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <p style={{ fontSize: 11, color: '#888', fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{label}</p>
      <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 14, marginTop: 4, color: '#141414' }}>{value}</p>
    </div>
  )
}

function StatBox({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div style={{ background: '#f7f6f4', borderRadius: 10, padding: '12px 14px' }}>
      <p style={{ fontSize: 11, color: '#888', fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{label}</p>
      <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 24, letterSpacing: -0.5, marginTop: 4, color: '#141414' }}>{value}<span style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>{unit}</span></p>
    </div>
  )
}
