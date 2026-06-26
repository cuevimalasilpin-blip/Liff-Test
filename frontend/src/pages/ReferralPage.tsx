import { useQuery } from '@tanstack/react-query'
import { getMyReferrals } from '../lib/api'
import { shareMessage } from '../lib/liff'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const APP_URL = import.meta.env.VITE_APP_URL || 'https://liff.line.me/YOUR_LIFF_ID'

export default function ReferralPage() {
  const { data } = useQuery({ queryKey: ['referrals'], queryFn: getMyReferrals })
  const code      = data?.referralCode || '...'
  const referrals = data?.referrals || []
  const total     = data?.totalReferrals || 0

  const shareLink = `${APP_URL}?ref=${code}`

  function handleShare() {
    shareMessage(`🏌️ มาเรียนกอล์ฟกับ Underpar Club กันเถอะ!\n\nสถาบันสอนกอล์ฟที่เรียนแล้วพัฒนาจริง สมัครผ่าน link นี้รับ 200 pts เลยนะ!\n👉 ${shareLink}`)
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareLink)
      .then(() => alert('คัดลอก link แล้ว!'))
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <p className="section-label" style={{ fontSize: 11 }}>REFERRAL · แนะนำเพื่อน</p>
          <h1 style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: -0.5, marginTop: 4 }}>แนะนำเพื่อน</h1>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Hero */}
        <div style={{ background: '#141414', borderRadius: 20, padding: 24, marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🤝</div>
          <h2 style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 28, color: '#fff', letterSpacing: -1 }}>
            แนะนำเพื่อน<br /><span style={{ color: '#ED1C24' }}>รับ 200 pts</span>
          </h2>
          <p style={{ color: '#666', fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
            เพื่อนซื้อ package แรก → คุณได้รับ 200 pts<br />ไม่จำกัดจำนวนครั้ง!
          </p>
        </div>

        {/* Referral Code */}
        <div className="card" style={{ padding: '20px', border: '1px solid #f0eeec', marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontFamily: 'Archivo,sans-serif', textTransform: 'uppercase', letterSpacing: 2, color: '#888', fontWeight: 600, marginBottom: 10 }}>Referral Code ของคุณ</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, background: '#f7f6f4', borderRadius: 12, padding: '14px 16px', border: '1.5px solid #e3e3e3' }}>
              <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: 4, color: '#141414', textAlign: 'center' }}>{code}</p>
            </div>
            <button onClick={handleCopy} style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 12, border: '1.5px solid #e3e3e3', background: '#fff', cursor: 'pointer', fontSize: 20 }}>📋</button>
          </div>
        </div>

        {/* Share Buttons */}
        <button className="btn-primary" style={{ width: '100%', marginBottom: 10, gap: 10 }} onClick={handleShare}>
          <span>📤</span> แชร์ผ่าน Line
        </button>
        <button className="btn-secondary" style={{ width: '100%', marginBottom: 20, gap: 10 }} onClick={handleCopy}>
          <span>🔗</span> คัดลอก Link
        </button>

        {/* How it works */}
        <div className="card" style={{ padding: '18px 20px', border: '1px solid #f0eeec', marginBottom: 16 }}>
          <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: '#ED1C24', marginBottom: 14 }}>วิธีรับ Bonus</p>
          {[
            { num: '01', text: 'แชร์ link หรือ code ให้เพื่อน' },
            { num: '02', text: 'เพื่อนสมัครและซื้อ package แรก' },
            { num: '03', text: 'คุณได้รับ 200 pts ทันที!' },
          ].map(s => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
              <span style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 800, fontSize: 13, color: '#ED1C24', flexShrink: 0, marginTop: 1 }}>{s.num}</span>
              <p style={{ fontSize: 14, color: '#333', lineHeight: 1.5 }}>{s.text}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div className="card" style={{ padding: '16px', border: '1px solid #f0eeec', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 32, letterSpacing: -1, color: '#ED1C24' }}>{total}</p>
            <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>เพื่อนที่ชวนได้</p>
          </div>
          <div className="card" style={{ padding: '16px', border: '1px solid #f0eeec', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 900, fontSize: 32, letterSpacing: -1, color: '#141414' }}>{total * 200}</p>
            <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>pts ที่ได้รับ</p>
          </div>
        </div>

        {/* Referral List */}
        {referrals.length > 0 && (
          <div>
            <p style={{ fontFamily: 'Archivo,sans-serif', fontWeight: 700, fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>รายชื่อเพื่อนที่ชวนมาได้</p>
            {referrals.map((r: any) => (
              <div key={r.id} className="card" style={{ padding: '14px 16px', border: '1px solid #f0eeec', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{r.users?.display_name || 'เพื่อน'}</p>
                  <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {format(new Date(r.created_at), 'd MMM yyyy', { locale: th })}
                  </p>
                </div>
                {r.bonus_given
                  ? <span style={{ background: '#f0fff4', color: '#059669', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontFamily: 'Archivo,sans-serif', fontWeight: 700 }}>+200 pts ✓</span>
                  : <span style={{ background: '#f7f6f4', color: '#888', padding: '4px 10px', borderRadius: 999, fontSize: 12 }}>รอ purchase</span>
                }
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
