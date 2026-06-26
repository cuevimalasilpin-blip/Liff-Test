import { useQuery } from '@tanstack/react-query'
import { getMyCourses } from '../lib/api'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export default function CoursesPage() {
  const { data, isLoading } = useQuery({ queryKey: ['courses'], queryFn: getMyCourses })
  const courses = data?.courses || []
  const active  = courses.filter((c: any) => c.is_active)
  const expired = courses.filter((c: any) => !c.is_active)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <p className="section-label" style={{ fontSize: 11 }}>COURSES · คอร์สเรียน</p>
          <h1 style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: -0.5, marginTop: 4 }}>ชั่วโมงเรียน</h1>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #ED1C24', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto' }} className="animate-spin" />
          </div>
        ) : active.length === 0 ? (
          <div style={{ background: '#f7f6f4', borderRadius: 16, padding: 32, textAlign: 'center', color: '#888' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🎓</p>
            <p style={{ fontWeight: 600, color: '#141414' }}>ยังไม่มี Course</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>ติดต่อโค้ชเพื่อซื้อ package</p>
          </div>
        ) : (
          <>
            {active.map((course: any) => {
              const pct = Math.max(0, Math.min(100, (course.remaining_hours / course.total_hours) * 100))
              const daysLeft = Math.ceil((new Date(course.expires_at).getTime() - Date.now()) / 86400000)
              const warn = pct < 20 || daysLeft < 30

              return (
                <div key={course.id} className="card" style={{ padding: '20px', border: `1px solid ${warn ? '#ffc9c9' : '#f0eeec'}`, background: warn ? '#fff8f8' : '#fff', marginBottom: 14 }}>
                  {warn && <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff0f0', borderRadius: 8, padding: '7px 10px', marginBottom: 14 }}>
                    <span style={{ fontSize: 14 }}>⚠️</span>
                    <span style={{ fontSize: 12, color: '#c4171d', fontWeight: 600 }}>ใกล้หมด — ต่อ package เร็วๆ นี้</span>
                  </div>}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 16, letterSpacing: -0.3 }}>{course.package_name}</p>
                      <p style={{ fontSize: 12, color: '#888', marginTop: 3 }}>หมดอายุ {format(new Date(course.expires_at), 'd MMM yyyy', { locale: th })}</p>
                    </div>
                    <span style={{ background: daysLeft < 30 ? '#fff0f0' : '#f0fff4', color: daysLeft < 30 ? '#ED1C24' : '#059669', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontFamily: 'Archivo,sans-serif', fontWeight: 700 }}>
                      {daysLeft} วัน
                    </span>
                  </div>

                  {/* Hours Display */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 16 }}>
                    <span style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 44, letterSpacing: -2, lineHeight: 1 }}>
                      {course.remaining_hours.toFixed(1)}
                    </span>
                    <span style={{ color: '#888', fontSize: 15 }}>/ {course.total_hours} ชั่วโมง</span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginTop: 12 }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: pct < 20 ? '#ED1C24' : '#141414' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                      <span style={{ fontSize: 12, color: '#888' }}>ใช้ไป {course.used_hours.toFixed(1)} ชม.</span>
                      <span style={{ fontSize: 12, color: pct < 20 ? '#ED1C24' : '#888', fontWeight: pct < 20 ? 700 : 400 }}>{pct.toFixed(0)}% คงเหลือ</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* Contact Coach */}
        <div style={{ background: '#141414', borderRadius: 16, padding: '18px 20px', marginTop: 8 }}>
          <p style={{ color: '#fff', fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 15 }}>ต้องการซื้อ Package เพิ่ม?</p>
          <p style={{ color: '#666', fontSize: 13, marginTop: 4, marginBottom: 14 }}>ติดต่อโค้ชโดยตรงผ่าน Line</p>
          <a href="https://line.me/ti/p/~underparclub" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', gap: 8, fontSize: 14 }}>
            <span>💬</span> ติดต่อโค้ช
          </a>
        </div>

        {/* Expired Courses */}
        {expired.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Course ที่ใช้แล้ว</p>
            {expired.map((course: any) => (
              <div key={course.id} style={{ background: '#f7f6f4', border: '1px solid #e3e3e3', borderRadius: 14, padding: '14px 16px', marginBottom: 8, opacity: 0.7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 600, fontSize: 14, color: '#888' }}>{course.package_name}</p>
                  <span style={{ fontSize: 12, color: '#aaa' }}>{course.total_hours} ชม.</span>
                </div>
                <p style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>หมดอายุ {format(new Date(course.expires_at), 'd MMM yyyy', { locale: th })}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
