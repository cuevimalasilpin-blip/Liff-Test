import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDrills, createDrill, deleteDrill } from '../lib/api'
import PageHeader from '../components/PageHeader'

const IconDrill = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconVideo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
  </svg>
)
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const CATS = ['all', 'Technical', 'Tactical', 'Mental'] as const
const CAT_COLOR: Record<string, string> = {
  Technical: '#3b82f6',
  Tactical:  '#10b981',
  Mental:    '#8b5cf6',
}

// ── Add Drill Modal ────────────────────────────────
function AddDrillModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ name: '', description: '', category: 'Technical', repetitions: '', mediaUrl: '', mediaType: 'text' })
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 430, margin: '0 auto', padding: '20px 18px 32px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 18, color: '#141414', margin: 0 }}>เพิ่ม Drill ใหม่</h2>
          <button onClick={onClose} style={{ background: '#f0eeeb', border: 'none', borderRadius: 99, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><IconX /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>ชื่อ Drill *</label>
            <input value={form.name} onChange={set('name')} placeholder="เช่น Hip Rotation Drill" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Category *</label>
            <select value={form.category} onChange={set('category')} style={inputStyle}>
              <option>Technical</option>
              <option>Tactical</option>
              <option>Mental</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>รายละเอียด</label>
            <textarea value={form.description} onChange={set('description')} placeholder="อธิบายวิธีทำ drill..." rows={3}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
          </div>
          <div>
            <label style={labelStyle}>Repetitions / เป้าหมาย</label>
            <input value={form.repetitions} onChange={set('repetitions')} placeholder="เช่น 20 ครั้ง × 3 sets" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>URL วิดีโอ/รูป (ถ้ามี)</label>
            <input value={form.mediaUrl} onChange={set('mediaUrl')} placeholder="https://..." style={inputStyle} />
          </div>
          {form.mediaUrl && (
            <div>
              <label style={labelStyle}>ประเภท Media</label>
              <select value={form.mediaType} onChange={set('mediaType')} style={inputStyle}>
                <option value="video">Video</option>
                <option value="image">Image</option>
              </select>
            </div>
          )}
        </div>

        <button
          onClick={() => onSave({ name: form.name, category: form.category, description: form.description, repetitions: form.repetitions, mediaUrl: form.mediaUrl || undefined, mediaType: form.mediaUrl ? form.mediaType : undefined })}
          disabled={!form.name}
          style={{ marginTop: 20, width: '100%', background: form.name ? '#141414' : '#e8e6e3', color: form.name ? '#fff' : '#bbb', border: 'none', borderRadius: 14, padding: '14px 0', fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 15, cursor: form.name ? 'pointer' : 'default', letterSpacing: 0.5 }}>
          บันทึก Drill
        </button>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'Archivo,sans-serif', display: 'block', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', background: '#f7f6f4', border: '1.5px solid #e8e6e3', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'Archivo,sans-serif', fontWeight: 600, color: '#141414', outline: 'none', boxSizing: 'border-box' }

// ── Main Page ─────────────────────────────────────
export default function DrillLibraryPage() {
  const qc = useQueryClient()
  const [cat, setCat] = useState<typeof CATS[number]>('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [isCoach] = useState(() => {
    // ดูจาก localStorage ที่ App.tsx เก็บไว้ หรือ default false
    return localStorage.getItem('is_coach') === 'true'
  })

  const { data, isLoading } = useQuery({
    queryKey: ['drills', cat, search],
    queryFn: () => getDrills(cat === 'all' ? undefined : cat, search || undefined),
  })

  const createMutation = useMutation({
    mutationFn: createDrill,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['drills'] })
      setShowAdd(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDrill,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drills'] }),
  })

  const drills: any[] = data?.drills || []

  return (
    <div style={{ background: '#f0eeeb', minHeight: '100vh', paddingBottom: 90 }}>
      <PageHeader
        icon={<IconDrill />}
        title="Drill Library"
        subtitle="คลัง drill ทั้งหมด"
      />

      <div style={{ padding: '12px 12px 0' }}>
        {/* Search */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, border: '1.5px solid #e8e6e3' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา drill..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, fontFamily: 'Archivo,sans-serif', fontWeight: 600, color: '#333' }} />
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 99, border: cat === c ? '2px solid #141414' : '1.5px solid #e3e3e3', background: cat === c ? '#141414' : '#fff', color: cat === c ? '#fff' : '#555', fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer', letterSpacing: 0.5 }}>
              {c === 'all' ? 'ทั้งหมด' : c}
            </button>
          ))}
        </div>

        {/* Add button (coach only) */}
        {isCoach && (
          <button onClick={() => setShowAdd(true)}
            style={{ width: '100%', background: '#ED1C24', color: '#fff', border: 'none', borderRadius: 14, padding: '13px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 14, cursor: 'pointer', marginBottom: 14, letterSpacing: 0.5 }}>
            <IconPlus /> เพิ่ม Drill ใหม่
          </button>
        )}

        {/* Drill list */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #ED1C24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        ) : drills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#bbb' }}>
            <div style={{ width: 48, height: 48, background: '#f0eeeb', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#ccc' }}>
              <IconDrill />
            </div>
            <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 15 }}>ยังไม่มี drill</p>
            {isCoach && <p style={{ fontSize: 13, marginTop: 4 }}>กด "เพิ่ม Drill ใหม่" เพื่อเริ่มต้น</p>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {drills.map((d: any) => (
              <div key={d.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #e8e6e3' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ background: `${CAT_COLOR[d.category]}18`, color: CAT_COLOR[d.category], fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 99, fontFamily: 'Archivo,sans-serif', letterSpacing: 0.8 }}>
                        {d.category}
                      </span>
                      {d.media_type === 'video' && (
                        <span style={{ color: '#888', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <IconVideo /><span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'Archivo,sans-serif' }}>Video</span>
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 15, color: '#141414', margin: '0 0 4px' }}>{d.name}</p>
                    {d.description && <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{d.description}</p>}
                    {d.repetitions && (
                      <p style={{ fontSize: 12, color: '#ED1C24', fontWeight: 700, margin: '6px 0 0', fontFamily: 'Archivo,sans-serif' }}>
                        🎯 {d.repetitions}
                      </p>
                    )}
                  </div>
                  {isCoach && (
                    <button onClick={() => { if (confirm('ลบ drill นี้?')) deleteMutation.mutate(d.id) }}
                      style={{ background: '#fff0f0', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ED1C24', flexShrink: 0 }}>
                      <IconX />
                    </button>
                  )}
                </div>

                {/* Media preview */}
                {d.media_url && d.media_type === 'image' && (
                  <img src={d.media_url} alt="" style={{ width: '100%', borderRadius: 10, marginTop: 10, maxHeight: 160, objectFit: 'cover' }} />
                )}
                {d.media_url && d.media_type === 'video' && (
                  <a href={d.media_url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, background: '#141414', borderRadius: 10, padding: '10px 14px', textDecoration: 'none', color: '#fff' }}>
                    <IconVideo />
                    <span style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 13 }}>ดูวิดีโอ</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <AddDrillModal
          onClose={() => setShowAdd(false)}
          onSave={(data) => createMutation.mutate(data)}
        />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
