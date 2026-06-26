import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { getLessonDetail } from '../lib/api'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

// ── Inline SVG Logo ──────────────────────────────────────────────
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

// ── Icons ────────────────────────────────────────────────────────
const IconTrend = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
)
const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconVideo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
)
const IconPlay = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)
const IconPhoto = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const IconUpload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
  </svg>
)
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const IconImage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

const SECTION_ICONS: Record<string, JSX.Element> = {
  Technical: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  ),
  Tactical: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Mental: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>
  ),
}

export default function LessonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [comment, setComment] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => getLessonDetail(id!),
  })
  const lesson = data?.lesson

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div style={{ width: 28, height: 28, border: '3px solid #ED1C24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!lesson) return (
    <div style={{ textAlign: 'center', padding: 48, color: '#888' }}>
      <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700 }}>ไม่พบ session นี้</p>
      <button onClick={() => navigate(-1)} style={{ marginTop: 16, background: 'none', border: '1px solid #ddd', borderRadius: 10, padding: '8px 20px', cursor: 'pointer', fontFamily: 'Archivo,sans-serif', fontWeight: 700 }}>
        ← กลับ
      </button>
    </div>
  )

  const preview = lesson.technical_notes || lesson.tactical_notes || lesson.mental_notes || ''
  const cat = lesson.technical_notes ? 'Technical' : lesson.tactical_notes ? 'Tactical' : lesson.mental_notes ? 'Mental' : null
  const comments: any[] = lesson.comments || []

  return (
    <div style={{ background: '#f0eeeb', minHeight: '100vh', paddingBottom: 90 }}>

      {/* ── Header ── */}
      <div style={{ background: '#fff', padding: '12px 18px 14px', borderBottom: '1px solid #e8e6e3' }}>
        {/* Logo + back button row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <UnderparLogo />
          <button
            onClick={() => navigate(-1)}
            style={{ background: '#f0eeeb', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#141414' }}
          >
            <IconArrowLeft />
          </button>
        </div>
        {/* Title row with icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, background: '#f0eeeb', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ED1C24',
          }}>
            <IconTrend />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 18, letterSpacing: -0.5, color: '#141414', margin: 0, lineHeight: 1.1 }}>
              {format(new Date(lesson.date), 'd MMM yyyy', { locale: th })}
            </h1>
            <p style={{ fontSize: 12, color: '#888', fontWeight: 600, margin: '2px 0 0', fontFamily: 'Archivo,sans-serif' }}>
              {cat && <span style={{ color: '#ED1C24', marginRight: 4 }}>{cat} ·</span>}
              {lesson.duration_hours} ชม. · {lesson.users?.display_name || 'โค้ช'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* ── Media ── */}
        {(lesson.media_urls?.length > 0 || true) && (
          <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #e8e6e3' }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#999', margin: '0 0 10px', fontFamily: 'Archivo,sans-serif' }}>
              สื่อการสอน
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(lesson.media_urls || []).map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  style={{ width: 80, height: 80, borderRadius: 10, background: '#f0eeeb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', textDecoration: 'none', color: '#888', position: 'relative', flexShrink: 0 }}>
                  {url.match(/\.(jpg|jpeg|png|webp)$/i)
                    ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (
                      <>
                        <div style={{ background: '#141414', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                          <IconPlay />
                        </div>
                      </>
                    )
                  }
                </a>
              ))}
              {/* Upload slot */}
              <button
                onClick={() => fileRef.current?.click()}
                style={{ width: 80, height: 80, borderRadius: 10, border: '1.5px dashed #ddd', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', color: '#bbb', flexShrink: 0 }}
              >
                <IconUpload />
                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'Archivo,sans-serif' }}>เพิ่ม</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} />
            </div>
          </div>
        )}

        {/* ── Notes sections ── */}
        {(['Technical', 'Tactical', 'Mental'] as const).map(key => {
          const noteKey = `${key.toLowerCase()}_notes` as keyof typeof lesson
          const note = lesson[noteKey] as string | undefined
          if (!note) return null
          return (
            <div key={key} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #e8e6e3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span style={{ color: '#ED1C24' }}>{SECTION_ICONS[key]}</span>
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#999', margin: 0, fontFamily: 'Archivo,sans-serif' }}>
                  {key}
                </p>
              </div>
              <p style={{ fontSize: 14, color: '#333', lineHeight: 1.7, fontWeight: 600, margin: 0 }}>{note}</p>
            </div>
          )
        })}

        {/* ── Drills ── */}
        {lesson.drills_assigned?.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #e8e6e3' }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#999', margin: '0 0 10px', fontFamily: 'Archivo,sans-serif' }}>
              Drills ที่ต้องฝึก
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lesson.drills_assigned.map((drill: any, i: number) => (
                <div key={i} style={{ background: '#f7f6f4', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 14, color: '#141414', margin: 0 }}>{i + 1}. {drill.name}</p>
                  {drill.description && <p style={{ fontSize: 13, color: '#555', marginTop: 4, lineHeight: 1.5, fontWeight: 600 }}>{drill.description}</p>}
                  {drill.repetitions && <p style={{ fontSize: 12, color: '#ED1C24', fontWeight: 700, marginTop: 6 }}>{drill.repetitions}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Swing Stats ── */}
        {lesson.swing_stats && Object.keys(lesson.swing_stats).length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #e8e6e3' }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#999', margin: '0 0 10px', fontFamily: 'Archivo,sans-serif' }}>
              Stats วันนี้
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {lesson.swing_stats.handicap !== undefined && <StatBox label="Handicap" value={lesson.swing_stats.handicap} unit="" />}
              {lesson.swing_stats.driving_distance && <StatBox label="Driving" value={lesson.swing_stats.driving_distance} unit="m" />}
              {lesson.swing_stats.putting_avg && <StatBox label="Putting Avg" value={lesson.swing_stats.putting_avg} unit="" />}
              {lesson.swing_stats.gir_percentage && <StatBox label="GIR" value={lesson.swing_stats.gir_percentage} unit="%" />}
            </div>
          </div>
        )}

        {/* ── Comments ── */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #e8e6e3' }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#999', margin: '0 0 12px', fontFamily: 'Archivo,sans-serif' }}>
            ความเห็น
          </p>

          {comments.length === 0 && (
            <p style={{ fontSize: 13, color: '#bbb', textAlign: 'center', padding: '16px 0', fontWeight: 600 }}>ยังไม่มีความเห็น</p>
          )}

          {comments.map((c: any, i: number) => {
            const isCoach = c.sender_role === 'coach'
            return (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14, flexDirection: isCoach ? 'row' : 'row-reverse' }}>
                {/* Avatar */}
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: isCoach ? '#141414' : '#e8e6e3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: isCoach ? '#fff' : '#555',
                  flexShrink: 0, fontFamily: 'Archivo,sans-serif',
                }}>
                  {c.sender_name?.[0] || (isCoach ? 'K' : 'ค')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, justifyContent: isCoach ? 'flex-start' : 'flex-end' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#141414', fontFamily: 'Archivo,sans-serif' }}>
                      {c.sender_name || (isCoach ? 'โปรคิว' : 'คุณ')}
                    </span>
                    {isCoach && (
                      <span style={{ background: '#fff0f0', color: '#ED1C24', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 99, fontFamily: 'Archivo,sans-serif' }}>
                        Coach
                      </span>
                    )}
                  </div>
                  <div style={{
                    background: isCoach ? '#f7f6f4' : '#fff0f0',
                    borderRadius: 10, padding: '10px 12px',
                  }}>
                    <p style={{ fontSize: 13, color: '#333', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>{c.message}</p>
                    {c.media_url && (
                      <img src={c.media_url} alt="" style={{ width: '100%', borderRadius: 8, marginTop: 8 }} />
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Input */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', borderTop: '1px solid #f0eeeb', paddingTop: 12 }}>
            <div style={{ flex: 1, background: '#f7f6f4', borderRadius: 99, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#aaa', display: 'flex' }}>
                <IconImage />
              </button>
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="พิมพ์ความเห็น..."
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#333', fontFamily: 'Archivo,sans-serif', fontWeight: 600 }}
              />
            </div>
            <button
              style={{
                width: 36, height: 36, background: comment.trim() ? '#ED1C24' : '#e8e6e3',
                borderRadius: '50%', border: 'none', cursor: comment.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: comment.trim() ? '#fff' : '#bbb', flexShrink: 0,
                transition: 'background 0.2s',
              }}
            >
              <IconSend />
            </button>
          </div>
        </div>

      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function StatBox({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div style={{ background: '#f7f6f4', borderRadius: 10, padding: '12px 14px' }}>
      <p style={{ fontSize: 11, color: '#888', fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase' as const, letterSpacing: 1, fontWeight: 600, margin: 0 }}>{label}</p>
      <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 24, letterSpacing: -0.5, marginTop: 4, color: '#141414' }}>
        {value}<span style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>{unit}</span>
      </p>
    </div>
  )
}
