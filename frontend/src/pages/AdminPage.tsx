import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdminDashboard, getAllStudents, getRevenue,
  getAdminSlots, createAdminSlot, updateAdminSlot, deleteAdminSlot,
  createLesson,
} from '../lib/api'
import { format, addDays } from 'date-fns'
import { th } from 'date-fns/locale'
import PageHeader from '../components/PageHeader'

// ── Icons ─────────────────────────────────────────
const IconAdmin = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
)
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'Archivo,sans-serif', display: 'block', marginBottom: 5 }
const inputStyle: React.CSSProperties = { width: '100%', background: '#f7f6f4', border: '1.5px solid #e8e6e3', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'Archivo,sans-serif', fontWeight: 600, color: '#141414', outline: 'none', boxSizing: 'border-box' }

type Tab = 'today' | 'students' | 'revenue' | 'slots' | 'lesson'

// ── Add Slot Modal ────────────────────────────────
function AddSlotModal({ onClose, onSave, isSaving }: { onClose: () => void; onSave: (d: any) => void; isSaving: boolean }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [form, setForm] = useState({ branch: 'ratchayothin', date: today, startH: '09', startM: '00', endH: '10', endM: '00', room: '' })
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = () => {
    const startTime = `${form.date}T${form.startH}:${form.startM}:00`
    const endTime   = `${form.date}T${form.endH}:${form.endM}:00`
    onSave({ branch: form.branch, startTime, endTime, room: form.room || undefined })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 430, margin: '0 auto', padding: '20px 18px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 18, margin: 0 }}>เพิ่ม Time Slot</h2>
          <button onClick={onClose} style={{ background: '#f0eeeb', border: 'none', borderRadius: 99, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><IconX /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>สาขา</label>
            <select value={form.branch} onChange={set('branch')} style={inputStyle}>
              <option value="ratchayothin">รัชโยธิน</option>
              <option value="rama3">พระราม 3</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>วันที่</label>
            <input type="date" value={form.date} onChange={set('date')} style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={labelStyle}>เวลาเริ่ม</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <select value={form.startH} onChange={set('startH')} style={{ ...inputStyle, padding: '10px 8px' }}>
                  {Array.from({ length: 16 }, (_, i) => i + 7).map(h => (
                    <option key={h} value={String(h).padStart(2,'0')}>{String(h).padStart(2,'0')}</option>
                  ))}
                </select>
                <select value={form.startM} onChange={set('startM')} style={{ ...inputStyle, padding: '10px 8px' }}>
                  {['00','30'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>เวลาสิ้นสุด</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <select value={form.endH} onChange={set('endH')} style={{ ...inputStyle, padding: '10px 8px' }}>
                  {Array.from({ length: 16 }, (_, i) => i + 7).map(h => (
                    <option key={h} value={String(h).padStart(2,'0')}>{String(h).padStart(2,'0')}</option>
                  ))}
                </select>
                <select value={form.endM} onChange={set('endM')} style={{ ...inputStyle, padding: '10px 8px' }}>
                  {['00','30'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <label style={labelStyle}>ห้อง / Simulator (ไม่บังคับ)</label>
            <input value={form.room} onChange={set('room')} placeholder="เช่น Sim A, Sim B" style={inputStyle} />
          </div>
        </div>
        <button onClick={handleSave} disabled={isSaving}
          style={{ marginTop: 18, width: '100%', background: '#141414', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0', fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
          {isSaving ? 'กำลังบันทึก...' : 'บันทึก Slot'}
        </button>
      </div>
    </div>
  )
}

// ── Create Lesson Modal ────────────────────────────
function CreateLessonModal({ students, onClose, onSave, isSaving }: { students: any[]; onClose: () => void; onSave: (d: any) => void; isSaving: boolean }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [form, setForm] = useState({
    studentId: students[0]?.id || '',
    date: today,
    durationHours: '1',
    technicalNotes: '',
    tacticalNotes: '',
    mentalNotes: '',
    handicap: '',
    drivingDistance: '',
  })
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = () => {
    const swingStats: Record<string, number> = {}
    if (form.handicap)       swingStats.handicap = parseFloat(form.handicap)
    if (form.drivingDistance) swingStats.driving_distance = parseFloat(form.drivingDistance)

    onSave({
      studentId: form.studentId,
      date: form.date,
      durationHours: parseFloat(form.durationHours),
      technicalNotes: form.technicalNotes || undefined,
      tacticalNotes:  form.tacticalNotes  || undefined,
      mentalNotes:    form.mentalNotes    || undefined,
      swingStats: Object.keys(swingStats).length ? swingStats : undefined,
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 430, margin: '0 auto', padding: '20px 18px 32px', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 18, margin: 0 }}>บันทึก Lesson Session</h2>
          <button onClick={onClose} style={{ background: '#f0eeeb', border: 'none', borderRadius: 99, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><IconX /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>นักเรียน *</label>
            <select value={form.studentId} onChange={set('studentId')} style={inputStyle}>
              {students.map((s: any) => (
                <option key={s.id} value={s.id}>{s.display_name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={labelStyle}>วันที่</label>
              <input type="date" value={form.date} onChange={set('date')} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>ระยะเวลา (ชม.)</label>
              <select value={form.durationHours} onChange={set('durationHours')} style={inputStyle}>
                {['0.5','1','1.5','2','2.5','3'].map(v => <option key={v} value={v}>{v} ชม.</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Technical Notes</label>
            <textarea value={form.technicalNotes} onChange={set('technicalNotes')} placeholder="Swing mechanics, setup, ball flight..." rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
          </div>
          <div>
            <label style={labelStyle}>Tactical Notes</label>
            <textarea value={form.tacticalNotes} onChange={set('tacticalNotes')} placeholder="Course management, shot selection..." rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
          </div>
          <div>
            <label style={labelStyle}>Mental Notes</label>
            <textarea value={form.mentalNotes} onChange={set('mentalNotes')} placeholder="Focus, confidence, pre-shot routine..." rows={2} style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
          </div>

          {/* Swing Stats */}
          <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1.5, margin: '4px 0 -4px' }}>Swing Stats (ไม่บังคับ)</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={labelStyle}>Handicap</label>
              <input type="number" value={form.handicap} onChange={set('handicap')} placeholder="เช่น 18.5" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Driving (m)</label>
              <input type="number" value={form.drivingDistance} onChange={set('drivingDistance')} placeholder="เช่น 230" style={inputStyle} />
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={isSaving || !form.studentId}
          style={{ marginTop: 20, width: '100%', background: '#ED1C24', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0', fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
          {isSaving ? 'กำลังบันทึก...' : '💾 บันทึก Session'}
        </button>
      </div>
    </div>
  )
}

// ── Main AdminPage ─────────────────────────────────
export default function AdminPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('today')
  const [search, setSearch] = useState('')
  const [slotDate, setSlotDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [slotBranch, setSlotBranch] = useState<string>('')
  const [showAddSlot, setShowAddSlot] = useState(false)
  const [showCreateLesson, setShowCreateLesson] = useState(false)
  const [lessonSuccess, setLessonSuccess] = useState(false)

  const { data: dash }     = useQuery({ queryKey: ['adminDash'],     queryFn: getAdminDashboard })
  const { data: studData } = useQuery({ queryKey: ['students', search], queryFn: () => getAllStudents(search) })
  const { data: rev }      = useQuery({ queryKey: ['revenue'],        queryFn: getRevenue })
  const { data: slotsData } = useQuery({
    queryKey: ['adminSlots', slotDate, slotBranch],
    queryFn: () => getAdminSlots(slotDate, slotBranch || undefined),
    enabled: tab === 'slots',
  })

  const addSlotMutation = useMutation({
    mutationFn: createAdminSlot,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminSlots'] }); setShowAddSlot(false) },
  })

  const toggleSlotMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) => updateAdminSlot(id, { isAvailable }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminSlots'] }),
  })

  const deleteSlotMutation = useMutation({
    mutationFn: deleteAdminSlot,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminSlots'] }),
  })

  const createLessonMutation = useMutation({
    mutationFn: createLesson,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminDash'] })
      setShowCreateLesson(false)
      setLessonSuccess(true)
      setTimeout(() => setLessonSuccess(false), 3000)
    },
  })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'today',   label: 'วันนี้' },
    { key: 'lesson',  label: '📝 Lesson' },
    { key: 'slots',   label: '🕐 Slots' },
    { key: 'students',label: '👥 นักเรียน' },
    { key: 'revenue', label: '💰 Revenue' },
  ]

  const slots: any[] = slotsData?.slots || []
  const students: any[] = studData?.students || []

  // Date selector for slots (7 days)
  const days7 = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))

  return (
    <div style={{ background: '#f0eeeb', minHeight: '100vh', paddingBottom: 90 }}>
      <PageHeader icon={<IconAdmin />} title="Admin" subtitle="จัดการระบบ Underpar Club" />

      {/* Success toast */}
      {lessonSuccess && (
        <div style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', background: '#059669', color: '#fff', borderRadius: 12, padding: '10px 20px', fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 14, zIndex: 300, whiteSpace: 'nowrap' }}>
          ✅ บันทึก session เรียบร้อย!
        </div>
      )}

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 12px', background: '#fff', borderBottom: '1px solid #ececec', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 99, border: tab === t.key ? '2px solid #ED1C24' : '1.5px solid #e3e3e3', background: tab === t.key ? '#ED1C24' : '#fff', color: tab === t.key ? '#fff' : '#141414', fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 12 }}>

        {/* ── TODAY ── */}
        {tab === 'today' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <StatCard label="นักเรียนวันนี้" value={dash?.todayBookings?.length || 0} />
              <StatCard label="นักเรียนทั้งหมด" value={dash?.totalStudents || 0} />
            </div>

            <p style={sectionLabel}>ตารางวันนี้</p>
            {(!dash?.todayBookings?.length) ? (
              <EmptyCard text="ไม่มีนักเรียนวันนี้" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dash.todayBookings.map((b: any) => (
                  <div key={b.id} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid #e8e6e3' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 16, margin: 0 }}>
                          {format(new Date(b.time_slots?.start_time), 'HH:mm')} น.
                        </p>
                        <p style={{ fontSize: 14, color: '#333', marginTop: 2 }}>{b.users?.display_name}</p>
                        <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{b.time_slots?.branch === 'ratchayothin' ? 'รัชโยธิน' : 'พระราม 3'}</p>
                      </div>
                      <span style={{ background: '#f0fff4', color: '#059669', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontFamily: 'Archivo,sans-serif', fontWeight: 700 }}>Confirmed</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {dash?.expiringCourses?.length > 0 && (
              <>
                <p style={{ ...sectionLabel, color: '#ED1C24', marginTop: 18 }}>⚠️ Course ใกล้หมดอายุ</p>
                {dash.expiringCourses.map((c: any) => (
                  <div key={c.id} style={{ background: '#fff8f8', border: '1px solid #ffc9c9', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{c.users?.display_name}</p>
                        <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{c.package_name} · เหลือ {c.remaining_hours?.toFixed(1)} ชม.</p>
                      </div>
                      <p style={{ fontSize: 12, color: '#c4171d', fontWeight: 700 }}>{format(new Date(c.expires_at), 'd MMM', { locale: th })}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* ── LESSON ── */}
        {tab === 'lesson' && (
          <>
            <button onClick={() => setShowCreateLesson(true)}
              style={{ width: '100%', background: '#ED1C24', color: '#fff', border: 'none', borderRadius: 14, padding: '15px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 15, cursor: 'pointer', marginBottom: 16 }}>
              <IconPlus /> บันทึก Lesson Session ใหม่
            </button>
            <div style={{ background: '#fff', borderRadius: 12, padding: '16px', border: '1px solid #e8e6e3' }}>
              <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 13, color: '#888', margin: '0 0 8px' }}>ข้อมูลจะถูกบันทึกไปยัง:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['lesson_records (บันทึก session)', 'swing_progress (ติดตาม stats)', 'loyalty_transactions (แต้มสะสม)', 'ชั่วโมงคอร์สถูกหักอัตโนมัติ'].map(item => (
                  <div key={item} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ED1C24', flexShrink: 0 }} />
                    <p style={{ fontSize: 13, color: '#555', fontWeight: 600, margin: 0 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── SLOTS ── */}
        {tab === 'slots' && (
          <>
            {/* Date + Branch selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, overflowX: 'auto', paddingBottom: 2 }}>
              {days7.map(d => {
                const val = format(d, 'yyyy-MM-dd')
                const active = val === slotDate
                return (
                  <button key={val} onClick={() => setSlotDate(val)}
                    style={{ flexShrink: 0, width: 50, padding: '8px 0', borderRadius: 10, border: active ? '2px solid #ED1C24' : '1.5px solid #e3e3e3', background: active ? '#ED1C24' : '#fff', color: active ? '#fff' : '#141414', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Archivo,sans-serif', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', opacity: 0.75 }}>{format(d, 'EEE', { locale: th })}</div>
                    <div style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 17, lineHeight: 1.3, marginTop: 1 }}>{format(d, 'd')}</div>
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {['', 'ratchayothin', 'rama3'].map(b => (
                <button key={b} onClick={() => setSlotBranch(b)}
                  style={{ padding: '7px 14px', borderRadius: 99, border: slotBranch === b ? '2px solid #141414' : '1.5px solid #e3e3e3', background: slotBranch === b ? '#141414' : '#fff', color: slotBranch === b ? '#fff' : '#555', fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  {b === '' ? 'ทุกสาขา' : b === 'ratchayothin' ? 'รัชโยธิน' : 'พระราม 3'}
                </button>
              ))}
            </div>

            <button onClick={() => setShowAddSlot(true)}
              style={{ width: '100%', background: '#141414', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 13, cursor: 'pointer', marginBottom: 12 }}>
              <IconPlus /> เพิ่ม Time Slot
            </button>

            {slots.length === 0 ? (
              <EmptyCard text={`ไม่มี slot วันที่ ${format(new Date(slotDate), 'd MMM', { locale: th })}`} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {slots.map((slot: any) => {
                  const booked = slot.bookings?.some((b: any) => b.status === 'confirmed')
                  return (
                    <div key={slot.id} style={{ background: '#fff', borderRadius: 12, padding: '13px 14px', border: `1px solid ${!slot.is_available ? '#ffc9c9' : booked ? '#c3f0d8' : '#e8e6e3'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 15, margin: 0, color: '#141414' }}>
                            {format(new Date(slot.start_time), 'HH:mm')} – {format(new Date(slot.end_time), 'HH:mm')} น.
                          </p>
                          <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                            {slot.branch === 'ratchayothin' ? 'รัชโยธิน' : 'พระราม 3'}
                            {slot.room ? ` · ${slot.room}` : ''}
                            {booked && ` · ${slot.bookings[0]?.users?.display_name || 'จองแล้ว'}`}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ background: booked ? '#f0fff4' : slot.is_available ? '#f7f6f4' : '#fff0f0', color: booked ? '#059669' : slot.is_available ? '#888' : '#ED1C24', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 99, fontFamily: 'Archivo,sans-serif' }}>
                            {booked ? 'จองแล้ว' : slot.is_available ? 'ว่าง' : 'ปิด'}
                          </span>
                          {!booked && (
                            <button
                              onClick={() => toggleSlotMutation.mutate({ id: slot.id, isAvailable: !slot.is_available })}
                              style={{ background: slot.is_available ? '#fff0f0' : '#f0fff4', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: slot.is_available ? '#ED1C24' : '#059669', fontFamily: 'Archivo,sans-serif' }}>
                              {slot.is_available ? 'ปิด' : 'เปิด'}
                            </button>
                          )}
                          {!booked && (
                            <button onClick={() => { if (confirm('ลบ slot นี้?')) deleteSlotMutation.mutate(slot.id) }}
                              style={{ background: '#f7f6f4', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#aaa' }}>
                              <IconX />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── STUDENTS ── */}
        {tab === 'students' && (
          <>
            <input placeholder="🔍 ค้นหาชื่อนักเรียน..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, marginBottom: 12 }} />
            {students.map((s: any) => {
              const active = s.courses?.filter((c: any) => c.is_active) || []
              const totalHrs = active.reduce((sum: number, c: any) => sum + (c.remaining_hours || 0), 0)
              return (
                <div key={s.id} style={{ background: '#fff', borderRadius: 12, padding: '13px 14px', border: '1px solid #e8e6e3', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {s.picture_url
                      ? <img src={s.picture_url} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#f0eeec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Archivo', fontWeight: 700, color: '#999', flexShrink: 0 }}>{s.display_name?.[0]}</div>
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{s.display_name}</p>
                        <span style={{ fontSize: 12, color: '#ED1C24', fontFamily: 'Archivo,sans-serif', fontWeight: 700 }}>{totalHrs.toFixed(1)} ชม.</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{s.tier?.toUpperCase()} · {s.points} pts</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* ── REVENUE ── */}
        {tab === 'revenue' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <StatCard label="เดือนนี้" value={`฿${(rev?.monthlyRevenue || 0).toLocaleString()}`} red />
              <StatCard label="ทั้งหมด"  value={`฿${(rev?.totalRevenue || 0).toLocaleString()}`} />
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: '18px', border: '1px solid #e8e6e3', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 36, letterSpacing: -1, margin: 0, color: '#141414' }}>{rev?.totalPackagesSold || 0}</p>
              <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>packages ที่ขายทั้งหมด</p>
            </div>
          </>
        )}
      </div>

      {showAddSlot && (
        <AddSlotModal
          onClose={() => setShowAddSlot(false)}
          onSave={(d) => addSlotMutation.mutate(d)}
          isSaving={addSlotMutation.isPending}
        />
      )}
      {showCreateLesson && (
        <CreateLessonModal
          students={students}
          onClose={() => setShowCreateLesson(false)}
          onSave={(d) => createLessonMutation.mutate(d)}
          isSaving={createLessonMutation.isPending}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, red }: { label: string; value: string | number; red?: boolean }) {
  return (
    <div style={{ background: '#141414', borderRadius: 14, padding: '16px' }}>
      <p style={{ fontSize: 10, color: '#666', fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600, margin: 0 }}>{label}</p>
      <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: typeof value === 'string' ? 22 : 36, color: red ? '#ED1C24' : '#fff', letterSpacing: -1, marginTop: 4 }}>{value}</p>
    </div>
  )
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div style={{ background: '#f7f6f4', borderRadius: 12, padding: 28, textAlign: 'center', color: '#aaa' }}>
      <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 600 }}>{text}</p>
    </div>
  )
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 11,
  textTransform: 'uppercase', letterSpacing: 2, color: '#888',
  marginBottom: 8,
}
