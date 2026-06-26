import { Router, Request, Response } from 'express'
import { supabase } from '../lib/supabase'

const router = Router()

// POST /api/auth/login
// Called after LIFF.init() — upsert user from Line profile
router.post('/login', async (req: Request, res: Response) => {
  const { lineUid, displayName, pictureUrl, referralCode } = req.body

  if (!lineUid || !displayName) {
    return res.status(400).json({ error: 'lineUid and displayName required' })
  }

  // Find referrer if code provided
  let referredBy: string | null = null
  if (referralCode) {
    const { data: referrer } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', referralCode)
      .single()
    if (referrer) referredBy = referrer.id
  }

  // Upsert user
  const { data: user, error } = await supabase
    .from('users')
    .upsert({
      line_uid: lineUid,
      display_name: displayName,
      picture_url: pictureUrl,
      ...(referredBy && { referred_by: referredBy }),
    }, { onConflict: 'line_uid' })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  // If first time with referral, record referral
  if (referredBy && user) {
    await supabase.from('referrals').insert({
      referrer_id: referredBy,
      referred_id: user.id,
    }).onConflict('referred_id').ignore()
  }

  return res.json({ user })
})

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  const lineUid = req.headers['x-line-uid'] as string
  if (!lineUid) return res.status(401).json({ error: 'Unauthorized' })

  const { data: user, error } = await supabase
    .from('users')
    .select(`
      *,
      courses (id, package_name, remaining_hours:total_hours-used_hours, expires_at, is_active),
      user_achievements (*, achievements (*))
    `)
    .eq('line_uid', lineUid)
    .eq('courses.is_active', true)
    .single()

  if (error) return res.status(404).json({ error: 'User not found' })
  return res.json({ user })
})

export default router
