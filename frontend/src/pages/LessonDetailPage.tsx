import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { getLessonDetail, getLessonComments, postLessonComment, getLessonMediaUploadUrl, addLessonMediaUrl } from '../lib/api'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import PageHeader from '../components/PageHeader'

const IconTrend = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
)
const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconPlay = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)
const IconUpload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
  </svg>
)
const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const IconImage = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
)

const SECTION_ICONS: Record<string, React.ReactNode> = {
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
      <line x1="12" y1="17" x2="12.01" y2="17"/><circle cx="12" cy="12" r="10"/>
    </svg>
  ),
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

export default function LessonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [comment, setComment] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => getLessonDetail(id!),
  })
  const { data: commentsData, isLoading: loadingComments } = useQuery({
    queryKey: ['lesson-comments', id],
    queryFn: () => getLessonComments(id!),
    refetchInterval: 10000,
  })

  const commentMutation = useMutation({
    mutationFn: (msg: string) => postLessonComment(id!, msg),
    onSuccess: () => {
      setComment('')
      qc.invalidateQueries({ queryKey: ['lesson-comments', id] })
    },
  })

  const lesson = data?.lesson
  const comments: any[] = commentsData?.comments || []

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length || !id) return
    setUploading(true)
    try {
      for (const file of files) {
        const { uploadUrl, path } = await getLessonMediaUploadUrl(id, file.name, file.type)
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        })
        if (!uploadRes.ok) throw new Error('Upload failed')
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/lesson-media/${path}`
        await addLessonMediaUrl(id, publicUrl)
      }
      qc.invalidateQueries({ queryKey: ['lesson', id] })
    } catch (err) {
      console.error('Upload error:', err)
      alert('อัปโหลดไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div style={{ width: 28, height: 28, border: '3px solid #ED1C24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!lesson) return (
    <div style={{ textAlign: 'center', padding: 48, color: '#888' }}>
      <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700 }}>ไม่พบ session นี้</p>
      <button onClick={() => navigate(-1)} style={{ marginTop: 16, background: 'none', border: '1px solid #ddd', borderRadius: 10, padding: '8px 20px', cursor: 'pointer' }}>← กลับ</button>
    </div>
  )

  const cat = lesson.technical_notes ? 'Technical' : lesson.tactical_notes ? 'Tactical' : lesson.mental_notes ? 'Mental' : null

  return (
    <div style={{ background: '#f0eeeb', minHeight: '100vh', paddingBottom: 90 }}>

      <PageHeader
        icon={<IconTrend />}
        title={format(new Date(lesson.date), 'd MMM yyyy', { locale: th })}
        subtitle={`${cat ? cat + ' · ' : ''}${lesson.duration_hours} ชม. · ${lesson.users?.display_name || 'โค้ช'}`}
        leftElement={
          <button onClick={() => navigate(-1)}
            style={{ background: '#f0eeeb', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#141414' }}>
            <IconArrowLeft />
          </button>
        }
      />

      <div style={{ padding: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Media */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #e8e6e3' }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#999', margin: '0 0 10px', fontFamily: 'Archivo,sans-serif' }}>สื่อการสอน</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {(lesson.media_urls || []).map((url: string, i: number) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                style={{ width: 80, height: 80, borderRadius: 10, background: '#f0eeeb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', textDecoration: 'none', flexShrink: 0 }}>
                {url.match(/\.(jpg|jpeg|png|webp|gif)$/i)
                  ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ background: '#141414', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><IconPlay /></div>
                }
              </a>
            ))}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ width: 80, height: 80, borderRadius: 10, border: '1.5px dashed #ddd', background: 'none', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 4, cursor: uploading ? 'default' : 'pointer', color: uploading ? '#ED1C24' : '#bbb', flexShrink: 0 }}>
              {uploading
                ? <div style={{ width: 20, height: 20, border: '2.5px solid #ED1C24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                : <><IconUpload /><span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'Archivo,sans-serif' }}>เพิ่ม</span></>
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={handleFileSelect} />
          </div>
        </div>

        {/* Notes */}
        {(['Technical', 'Tactical', 'Mental'] as const).map(key => {
          const note = lesson[`${key.toLowerCase()}_notes` as keyof typeof lesson] as string | undefined
          if (!note) return null
          return (
            <div key={key} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #e8e6e3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span style={{ color: '#ED1C24' }}>{SECTION_ICONS[key]}</span>
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#999', margin: 0, fontFamily: 'Archivo,sans-serif' }}>{key}</p>
              </div>
              <p style={{ fontSize: 14, color: '#333', lineHeight: 1.7, fontWeight: 600, margin: 0 }}>{note}</p>
            </div>
          )
        })}

        {/* Drills */}
        {lesson.drills_assigned?.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #e8e6e3' }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#999', margin: '0 0 10px', fontFamily: 'Archivo,sans-serif' }}>Drills ที่ต้องฝึก</p>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
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

        {/* Swing Stats */}
        {lesson.swing_stats && Object.keys(lesson.swing_stats).length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #e8e6e3' }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#999', margin: '0 0 10px', fontFamily: 'Archivo,sans-serif' }}>Stats วันนี้</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {lesson.swing_stats.handicap !== undefined && <StatBox label="Handicap" value={lesson.swing_stats.handicap} unit="" />}
              {lesson.swing_stats.driving_distance && <StatBox label="Driving" value={lesson.swing_stats.driving_distance} unit="m" />}
              {lesson.swing_stats.putting_avg && <StatBox label="Putting Avg" value={lesson.swing_stats.putting_avg} unit="" />}
              {lesson.swing_stats.gir_percentage && <StatBox label="GIR" value={lesson.swing_stats.gir_percentage} unit="%" />}
            </div>
          </div>
        )}

        {/* Comments */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #e8e6e3' }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#999', margin: '0 0 12px', fontFamily: 'Archivo,sans-serif' }}>
            ความเห็น{comments.length > 0 && <span style={{ color: '#ED1C24', marginLeft: 6 }}>({comments.length})</span>}
          </p>

          {loadingComments && (
            <p style={{ fontSize: 13, color: '#bbb', textAlign: 'center', padding: '12px 0', fontWeight: 600 }}>กำลังโหลด...</p>
          )}
          {!loadingComments && comments.length === 0 && (
            <p style={{ fontSize: 13, color: '#bbb', textAlign: 'center', padding: '16px 0', fontWeight: 600 }}>ยังไม่มีความเห็น</p>
          )}

          <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column' as const, gap: 10, marginBottom: 12 }}>
            {comments.map((c: any) => {
              const isCoachMsg = c.sender_role === 'coach'
              return (
                <div key={c.id} style={{ display: 'flex', gap: 8, flexDirection: isCoachMsg ? 'row' : 'row-reverse' as const }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: isCoachMsg ? '#141414' : '#e8e6e3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: isCoachMsg ? '#fff' : '#555', flexShrink: 0, fontFamily: 'Archivo,sans-serif', overflow: 'hidden' }}>
                    {c.users?.picture_url
                      ? <img src={c.users.picture_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (c.sender_name?.[0] || (isCoachMsg ? 'K' : 'ค'))
                    }
                  </div>
                  <div style={{ flex: 1, maxWidth: '80%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3, justifyContent: isCoachMsg ? 'flex-start' : 'flex-end' }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#141414', fontFamily: 'Archivo,sans-serif' }}>
                        {c.sender_name || (isCoachMsg ? 'โปรคิว' : 'คุณ')}
                      </span>
                      {isCoachMsg && <span style={{ background: '#fff0f0', color: '#ED1C24', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 99 }}>Coach</span>}
                    </div>
                    <div style={{ background: isCoachMsg ? '#f7f6f4' : '#fff0f0', borderRadius: isCoachMsg ? '4px 12px 12px 12px' : '12px 4px 12px 12px', padding: '9px 12px' }}>
                      {c.message && <p style={{ fontSize: 13, color: '#333', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>{c.message}</p>}
                      {c.media_url && <img src={c.media_url} alt="" style={{ width: '100%', borderRadius: 8, marginTop: c.message ? 8 : 0 }} />}
                    </div>
                    <p style={{ fontSize: 10, color: '#bbb', margin: '3px 4px 0', textAlign: isCoachMsg ? 'left' : 'right' as const }}>
                      {format(new Date(c.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', borderTop: '1px solid #f0eeeb', paddingTop: 12 }}>
            <div style={{ flex: 1, background: '#f7f6f4', borderRadius: 14, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#aaa', display: 'flex', flexShrink: 0 }}>
                <IconImage />
              </button>
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && comment.trim()) { e.preventDefault(); commentMutation.mutate(comment) } }}
                placeholder="พิมพ์ความเห็น..."
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#333', fontFamily: 'Archivo,sans-serif', fontWeight: 600 }}
              />
            </div>
            <button
              disabled={!comment.trim() || commentMutation.isPending}
              onClick={() => commentMutation.mutate(comment)}
              style={{ width: 36, height: 36, background: comment.trim() && !commentMutation.isPending ? '#ED1C24' : '#e8e6e3', borderRadius: '50%', border: 'none', cursor: comment.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: comment.trim() ? '#fff' : '#bbb', flexShrink: 0, transition: 'background 0.2s' }}>
              {commentMutation.isPending
                ? <div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                : <IconSend />
              }
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
