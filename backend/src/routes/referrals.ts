import { Router, Response } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const REFERRAL_BONUS_POINTS = 200

// GET /api/referrals/mine
router.get('/mine', authenticate, async (req: AuthRequest, res: Response) => {
  const { data: user } = await supabase
    .from('users')
    .select('referral_code')
    .eq('id', req.userId!)
    .single()

  const { data: referrals } = await supabase
    .from('referrals')
    .select('*, users!referred_id(display_name, created_at)')
    .eq('referrer_id', req.userId!)
    .order('created_at', { ascending: false })

  return res.json({
    referralCode: user?.referral_code,
    referrals: referrals || [],
    totalReferrals: referrals?.length || 0,
  })
})

// POST /api/referrals/complete — เรียกเมื่อ referred user ซื้อ course แรก
// (เรียกโดย coach ผ่าน admin)
router.post('/complete', authenticate, async (req: AuthRequest, res: Response) => {
  const { referredUserId } = req.body

  const { data: referral } = await supabase
    .from('referrals')
    .select('*')
    .eq('referred_id', referredUserId)
    .eq('bonus_given', false)
    .single()

  if (!referral) {
    return res.status(404).json({ error: 'Referral not found or bonus already given' })
  }

  // Give bonus to referrer
  await supabase.from('loyalty_transactions').insert({
    user_id: referral.referrer_id,
    type: 'referral_bonus',
    points: REFERRAL_BONUS_POINTS,
    description: 'Referral bonus — เพื่อนสมัครและซื้อ course แล้ว!',
    reference_id: referral.id,
  })

  await supabase.rpc('add_user_points', {
    p_user_id: referral.referrer_id,
    p_points: REFERRAL_BONUS_POINTS,
  })

  await supabase
    .from('referrals')
    .update({ bonus_given: true })
    .eq('id', referral.id)

  // Check referral achievements
  const { count } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', referral.referrer_id)
    .eq('bonus_given', true)

  const referralAchievements = [
    { count: 1, code: 'first_referral' },
    { count: 5, code: 'five_referrals' },
  ]

  for (const ra of referralAchievements) {
    if (count === ra.count) {
      const { data: ach } = await supabase
        .from('achievements')
        .select('id, points_reward')
        .eq('code', ra.code)
        .single()
      if (ach) {
        await supabase.from('user_achievements').upsert({
          user_id: referral.referrer_id,
          achievement_id: ach.id,
        }, { onConflict: 'user_id,achievement_id', ignoreDuplicates: true })
      }
    }
  }

  return res.json({ success: true, pointsAwarded: REFERRAL_BONUS_POINTS })
})

export default router
