import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getMyLessons } from '../lib/api'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export default function LessonsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['lessons'], queryFn: () => getMyLessons(1) })
  const lessons = data?.lessons || []

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <p className="section-label" style={{ fontSize: 11 }}>LESSONS · บันทึกการเรียน</p>
          <h1 style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: -0.5, marginTop: 4 }}>ประวัติการเรียน</h1>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #ED1C24', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto' }} className="animate-spin" />
          </div>
        ) : lessons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#888' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📖</p>
            <p style={{ fontWeight: 600, color: '#141414' }}>ยังไม่มีบันทึกการเรียน</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>หลังเรียนแต่ละครั้ง โค้ชจะบันทึกเนื้อหาไว้ที่นี่</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lessons.map((lesson: any) => (
              <Link key={lesson.id} to={`/lessons/${lesson.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '16px 18px', border: '1px solid #f0eeec' }}>
                  {/* Date + Duration */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 16, letterSpacing: -0.3 }}>
                        {format(new Date(lesson.date), 'd MMMM yyyy', { locale: th })}
                      </p>
                      <p style={{ fontSize: 13, color: '#888', marginTop: 3 }}>
                        โดย {lesson.users?.display_name || 'โค้ช'}
                      </p>
                    </div>
                    <span style={{ background: '#fff0f0', color: '#ED1C24', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontFamily: 'Archivo,sans-serif', fontWeight: 700 }}>
                      {lesson.duration_hours} ชม.
                    </span>
                  </div>

                  {/* Preview */}
                  <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {lesson.technical_notes && <Tag label="Technical" />}
                    {lesson.tactical_notes  && <Tag label="Tactical" />}
                    {lesson.mental_notes    && <Tag label="Mental" />}
                    {lesson.drills_assigned?.length > 0 && <Tag label={`${lesson.drills_assigned.length} Drills`} />}
                    {lesson.media_urls?.length > 0 && <Tag label={`${lesson.media_urls.length} ไฟล์`} />}
                  </div>

                  {lesson.technical_notes && (
                    <p style={{ fontSize: 13, color: '#555', marginTop: 10, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {lesson.technical_notes}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <span style={{ fontSize: 12, color: '#ED1C24', fontWeight: 600 }}>ดูรายละเอียด →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Tag({ label }: { label: string }) {
  return (
    <span style={{ background: '#f7f6f4', border: '1px solid #e3e3e3', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: '#555', fontFamily: 'Archivo,sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </span>
  )
}
