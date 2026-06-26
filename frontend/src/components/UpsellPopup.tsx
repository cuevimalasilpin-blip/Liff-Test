/**
 * UpsellPopup — แสดงเมื่อ remaining_hours < threshold (default 2 ชม.)
 * ใช้: <UpsellPopup remainingHours={x} packageName="..." coachLineId="..." />
 */

interface UpsellPopupProps {
  remainingHours: number
  packageName?: string
  coachLineId?: string   // Line ID ของโค้ชเพื่อเปิด chat
  threshold?: number     // ชั่วโมงที่จะ trigger (default 2)
  onDismiss?: () => void
}

const PACKAGES = [
  { name: 'Starter Pack',    hours: 5,  price: '5,900',  tag: 'เหมาะสำหรับมือใหม่' },
  { name: 'Pro Pack',        hours: 10, price: '10,900', tag: 'ยอดนิยม', highlight: true },
  { name: 'Elite Pack',      hours: 20, price: '19,900', tag: 'คุ้มที่สุด' },
]

export default function UpsellPopup({ remainingHours, packageName, coachLineId, threshold = 2, onDismiss }: UpsellPopupProps) {
  if (remainingHours > threshold) return null

  const isAlmost = remainingHours > 0
  const lineUrl = coachLineId
    ? `https://line.me/ti/p/${coachLineId}`
    : 'https://line.me/ti/p/~underpargolf'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '22px 22px 0 0', width: '100%', maxWidth: 430, padding: '22px 18px 36px', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, background: isAlmost ? '#fff8e6' : '#fff0f0', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 28 }}>
            {isAlmost ? '⚠️' : '🏌️'}
          </div>
          <h2 style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 20, color: '#141414', margin: '0 0 6px', letterSpacing: -0.5 }}>
            {isAlmost ? `เหลือเพียง ${remainingHours.toFixed(1)} ชม.!` : 'Package หมดแล้ว'}
          </h2>
          <p style={{ fontSize: 14, color: '#666', margin: 0, lineHeight: 1.5 }}>
            {isAlmost
              ? `${packageName || 'Package ปัจจุบัน'} ใกล้หมดแล้ว — ต่อเนื่องก่อนที่จะพัก`
              : 'ต่อ package เพื่อจองคลาสเรียนต่อได้เลย'
            }
          </p>
        </div>

        {/* Package Options */}
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#999', margin: '0 0 10px', fontFamily: 'Archivo,sans-serif' }}>เลือก Package</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {PACKAGES.map(p => (
            <div key={p.name}
              style={{ border: p.highlight ? '2px solid #ED1C24' : '1.5px solid #e8e6e3', borderRadius: 14, padding: '14px 16px', background: p.highlight ? '#fff8f8' : '#fff', position: 'relative' }}>
              {p.highlight && (
                <span style={{ position: 'absolute', top: -10, right: 14, background: '#ED1C24', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 99, fontFamily: 'Archivo,sans-serif' }}>
                  แนะนำ
                </span>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 15, color: '#141414', margin: '0 0 3px' }}>{p.name}</p>
                  <p style={{ fontSize: 12, color: '#888', margin: 0, fontWeight: 600 }}>{p.hours} ชม. · {p.tag}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 16, color: p.highlight ? '#ED1C24' : '#141414', margin: 0 }}>฿{p.price}</p>
                  <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>฿{Math.round(parseInt(p.price.replace(',','')) / p.hours).toLocaleString()}/ชม.</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a href={lineUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#06C755', color: '#fff', border: 'none', borderRadius: 14, padding: '15px 0', textDecoration: 'none', fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 15, letterSpacing: 0.3, marginBottom: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.02 2 11c0 3.07 1.58 5.78 4 7.49V22l3.5-2c.82.23 1.63.35 2.5.35 5.52 0 10-4.02 10-9S17.52 2 12 2z"/>
          </svg>
          ติดต่อโค้ชทาง LINE
        </a>

        {onDismiss && (
          <button onClick={onDismiss}
            style={{ width: '100%', background: 'none', border: 'none', padding: '12px 0', color: '#aaa', fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            ปิด — จะต่อ package ทีหลัง
          </button>
        )}
      </div>
    </div>
  )
}
