import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAvailableSlots, getMyCourses, createBooking } from '../lib/api'
import { format, addDays } from 'date-fns'
import { th } from 'date-fns/locale'
import PageHeader from '../components/PageHeader'

const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

export default function BookingPage() {
  const qc = useQueryClient()
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(format(today, 'yyyy-MM-dd'))
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [success, setSuccess] = useState(false)

  const { data: slotsData, isLoading: loadingSlots } = useQuery({
    queryKey: ['slots', selectedDate],
    queryFn: () => getAvailableSlots(selectedDate),
  })
  const { data: coursesData } = useQuery({ queryKey: ['courses'], queryFn: getMyCourses })

  const activeCourse = coursesData?.courses?.find((c: any) => c.is_active && c.remaining_hours > 0)

  const mutation = useMutation({
    mutationFn: () => createBooking(selectedSlot.id, activeCourse.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['courses'] })
      setSuccess(true)
      setSelectedSlot(null)
    },
  })

  // Calendar: 14 days
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i))

  if (success) return (
    <div className="fade-in" style={{ padding: 24, textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 24, letterSpacing: -0.5 }}>จองเรียบร้อยแล้ว!</h2>
      <p style={{ color: '#888', marginTop: 8, fontSize: 15 }}>รอพบกันในคลาสนะครับ 🏌️</p>
      <button className="btn-primary" style={{ marginTop: 32 }} onClick={() => setSuccess(false)}>จองอีกครั้ง</button>
    </div>
  )

  return (
    <div style={{ background: '#f0eeeb', minHeight: '100vh', paddingBottom: 90 }}>
      <PageHeader
        icon={<IconCalendar />}
        title="จองเวลาเรียน"
        subtitle="เลือก time slot ที่ว่าง"
      />

      <div style={{ padding: '12px 12px 0' }}>
        {/* No active course warning */}
        {!activeCourse && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffc9c9', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
            <p style={{ color: '#c4171d', fontWeight: 600, fontSize: 14 }}>⚠️ ไม่มี course ที่ active</p>
            <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>กรุณาติดต่อโค้ชเพื่อซื้อ package ก่อนจอง</p>
          </div>
        )}

        {/* Course Hours Remaining */}
        {activeCourse && (
          <div style={{ background: '#141414', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#666', fontSize: 11, fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 1.5 }}>ชั่วโมงคงเหลือ</p>
              <p style={{ color: '#fff', fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: -0.5, marginTop: 2 }}>
                {activeCourse.remaining_hours.toFixed(1)} ชม.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#666', fontSize: 11, fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 1.5 }}>Package</p>
              <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginTop: 2 }}>{activeCourse.package_name}</p>
            </div>
          </div>
        )}

        {/* Date Picker */}
        <p style={{ fontFamily: 'Archivo,sans-serif', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#888', fontWeight: 600, marginBottom: 10 }}>เลือกวันที่</p>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
          {days.map(d => {
            const val = format(d, 'yyyy-MM-dd')
            const isSelected = val === selectedDate
            return (
              <button key={val} onClick={() => { setSelectedDate(val); setSelectedSlot(null) }}
                style={{
                  flexShrink: 0, width: 54, padding: '10px 0', borderRadius: 12,
                  border: isSelected ? '2px solid #ED1C24' : '1.5px solid #e3e3e3',
                  background: isSelected ? '#ED1C24' : '#fff',
                  color: isSelected ? '#fff' : '#141414',
                  cursor: 'pointer', textAlign: 'center',
                }}>
                <div style={{ fontFamily: 'Archivo,sans-serif', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', opacity: 0.75 }}>
                  {format(d, 'EEE', { locale: th })}
                </div>
                <div style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 18, lineHeight: 1.2, marginTop: 2 }}>{format(d, 'd')}</div>
              </button>
            )
          })}
        </div>

        {/* Time Slots */}
        <p style={{ fontFamily: 'Archivo,sans-serif', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#888', fontWeight: 600, marginBottom: 10 }}>
          เวลาว่าง — {format(new Date(selectedDate), 'd MMMM yyyy', { locale: th })}
        </p>

        {loadingSlots ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #ED1C24', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
          </div>
        ) : slotsData?.slots?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>😔</p>
            <p style={{ fontWeight: 600 }}>ไม่มี slot ว่างวันนี้</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>ลองเลือกวันอื่นครับ</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {slotsData?.slots?.map((slot: any) => {
              const isSelected = selectedSlot?.id === slot.id
              return (
                <button key={slot.id} onClick={() => setSelectedSlot(isSelected ? null : slot)}
                  style={{
                    border: isSelected ? '2px solid #ED1C24' : '1.5px solid #e3e3e3',
                    borderRadius: 14, padding: '14px 16px', background: isSelected ? '#fff0f0' : '#fff',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 17, color: isSelected ? '#ED1C24' : '#141414' }}>
                        {format(new Date(slot.start_time), 'HH:mm')} – {format(new Date(slot.end_time), 'HH:mm')} น.
                      </p>
                      <p style={{ fontSize: 13, color: '#888', marginTop: 3 }}>
                        {slot.users?.display_name} · {slot.branch === 'ratchayothin' ? 'รัชโยธิน' : 'พระราม 3'} · {slot.duration_hours} ชม.
                      </p>
                    </div>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      border: isSelected ? 'none' : '2px solid #e3e3e3',
                      background: isSelected ? '#ED1C24' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {isSelected && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Confirm Button */}
        {selectedSlot && activeCourse && (
          <div style={{ position: 'sticky', bottom: 80, padding: '12px 0' }}>
            <button className="btn-primary" style={{ width: '100%', gap: 8 }}
              onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? 'กำลังจอง...' : `ยืนยันจองเวลา ${format(new Date(selectedSlot.start_time), 'HH:mm')} น. →`}
            </button>
            {mutation.isError && <p style={{ color: '#c4171d', textAlign: 'center', fontSize: 13, marginTop: 8 }}>เกิดข้อผิดพลาด ลองใหม่อีกครั้ง</p>}
          </div>
        )}
      </div>
    </div>
  )
}
