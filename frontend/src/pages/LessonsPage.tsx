import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getMyLessons } from '../lib/api'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import PageHeader from '../components/PageHeader'

// ── Icon: ti-trending-up ─────────────────────────────────────────
const IconTrend = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
)

const IconVideo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
)

const IconPhoto = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

const IconMessage = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
)

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  Technical: { bg: '#f0eeeb', color: '#141414' },
  Tactical:  { bg: '#eef4ff', color: '#1d4ed8' },
  Mental:    { bg: '#fff0f0', color: '#c0171d' },
}

const FILTERS = ['ทั้งหมด', 'Technical', 'Tactical', 'Mental']

export default function LessonsPage() {
  const [filter, setFilter] = useState('ทั้งหมด')
  const { data, isLoading } = useQuery({ queryKey: ['lessons'], queryFn: () => getMyLessons(1) })
  const lessons: any[] = data?.lessons || []

  const filtered = filter === 'ทั้งหมด'
    ? lessons
    : lessons.filter((l: any) => {
        if (filter === 'Technical') return !!l.technical_notes
        if (filter === 'Tactical')  return !!l.tactical_notes
        if (filter === 'Mental')    return !!l.mental_notes
        return true
      })

  // Derive primary category label for each lesson
  const getCategory = (lesson: any) => {
    if (lesson.technical_notes) return 'Technical'
    if (lesson.tactical_notes)  return 'Tactical'
    if (lesson.mental_notes)    return 'Mental'
    return null
  }

  return (
    <div style={{ background: '#f0eeeb', minHeight: '100vh', paddingBottom: 90 }}>

      <PageHeader
        icon={<IconTrend />}
        title="Progress"
        subtitle={`${lessons.length} sessions ทั้งหมด`}
      />

      <div style={{ padding: '12px 12px 0' }}>

        {/* ── Filter tabs ── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 2 }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#141414' : '#fff',
                color: filter === f ? '#fff' : '#555',
                border: filter === f ? 'none' : '1px solid #e8e6e3',
                borderRadius: 99, padding: '7px 16px',
                fontSize: 11, fontWeight: 800, fontFamily: 'Archivo,sans-serif',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                letterSpacing: 0.5,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #ED1C24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ width: 56, height: 56, background: '#fff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#ccc' }}>
              <IconTrend />
            </div>
            <p style={{ fontWeight: 800, color: '#141414', fontFamily: 'Archivo,sans-serif', fontSize: 16 }}>ยังไม่มี session</p>
            <p style={{ fontSize: 13, color: '#888', marginTop: 6 }}>โค้ชจะบันทึกหลังเรียนแต่ละครั้ง</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((lesson: any, idx: number) => {
              const cat = getCategory(lesson)
              const catStyle = cat ? CATEGORY_COLORS[cat] : { bg: '#f0eeeb', color: '#555' }
              const sessionNum = lessons.length - lessons.indexOf(lesson)
              const mediaCount = lesson.media_urls?.length || 0
              const commentCount = lesson.comments?.length || 0
              const preview = lesson.technical_notes || lesson.tactical_notes || lesson.mental_notes || ''

              return (
                <Link key={lesson.id} to={`/lessons/${lesson.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #e8e6e3' }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 15, color: '#141414', margin: 0 }}>
                          Session #{sessionNum}
                        </p>
                        <p style={{ fontSize: 12, color: '#888', fontWeight: 600, margin: '3px 0 0' }}>
                          {format(new Date(lesson.date), 'd MMM yyyy', { locale: th })} · {lesson.users?.display_name || 'โค้ช'}
                        </p>
                      </div>
                      {cat && (
                        <span style={{
                          background: catStyle.bg, color: catStyle.color,
                          fontSize: 10, fontWeight: 800, padding: '4px 10px',
                          borderRadius: 99, fontFamily: 'Archivo,sans-serif',
                          letterSpacing: 0.3,
                        }}>{cat}</span>
                      )}
                    </div>

                    {/* Preview text */}
                    {preview && (
                      <p style={{
                        fontSize: 13, color: '#555', fontWeight: 600, lineHeight: 1.5,
                        margin: '0 0 10px',
                        display: '-webkit-box' as any,
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as any,
                        overflow: 'hidden',
                      }}>
                        {preview}
                      </p>
                    )}

                    {/* Media thumbnails */}
                    {mediaCount > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                        {lesson.media_urls.slice(0, 3).map((url: string, i: number) => (
                          <div key={i} style={{ width: 48, height: 48, background: '#f0eeeb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', overflow: 'hidden', flexShrink: 0 }}>
                            {url.match(/\.(jpg|jpeg|png|webp)$/i)
                              ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <IconVideo />
                            }
                          </div>
                        ))}
                        {mediaCount > 3 && (
                          <div style={{ width: 48, height: 48, background: '#f0eeeb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 11, fontWeight: 700 }}>
                            +{mediaCount - 3}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid #f0eeeb', paddingTop: 10 }}>
                      <span style={{ color: commentCount > 0 ? '#ED1C24' : '#bbb' }}><IconMessage /></span>
                      <span style={{ fontSize: 12, color: commentCount > 0 ? '#ED1C24' : '#bbb', fontWeight: commentCount > 0 ? 800 : 600 }}>
                        {commentCount > 0 ? `${commentCount} ความเห็น` : 'ยังไม่มีความเห็น'}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* spinner keyframes */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
