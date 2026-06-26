import { Router, Response } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/loyalty/summary
router.get('/summary', authenticate, async (req: AuthRequest, res: Response) => {
  const { data: user } = await supabase
    .from('users')
    .select('points, tier, total_hours')
    .eq('id', req.userId!)
    .single()

  const { data: achievements } = await supabase
    .from('user_achievements')
    .select('*, achievements(*)')
    .eq('user_id', req.userId!)
    .order('earned_at', { ascending: false })

  const { data: transactions } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('user_id', req.userId!)
    .order('created_at', { ascending: false })
    .limit(20)

  // Calculate next tier progress
  const tierProgress = calculateTierProgress(user?.total_hours || 0)

  return res.json({
    points: user?.points || 0,
    tier: user?.tier || 'bronze',
    totalHours: user?.total_hours || 0,
    tierProgress,
    achievements: achievements || [],
    recentTransactions: transactions || [],
  })
})

// GET /api/loyalty/achievements/all — achievements ทั้งหมด
router.get('/achievements/all', authenticate, async (req: AuthRequest, res: Response) => {
  const [{ data: all }, { data: earned }] = await Promise.all([
    supabase.from('achievements').select('*').eq('is_active', true),
    supabase.from('user_achievements').select('achievement_id').eq('user_id', req.userId!),
  ])

  const earnedIds = new Set(earned?.map(e => e.achievement_id) || [])
  const withStatus = (all || []).map(a => ({
    ...a,
    earned: earnedIds.has(a.id),
  }))

  return res.json({ achievements: withStatus })
})

// POST /api/loyalty/redeem — แลกแต้ม
router.post('/redeem', authenticate, async (req: AuthRequest, res: Response) => {
  const { points, description } = req.body

  const { data: user } = await supabase
    .from('users')
    .select('points')
    .eq('id', req.userId!)
    .single()

  if (!user || user.points < points) {
    return res.status(400).json({ error: 'Insufficient points' })
  }

  await supabase.from('loyalty_transactions').insert({
    user_id: req.userId,
    type: 'redeem',
    points: -points,
    description,
  })

  await supabase.rpc('add_user_points', {
    p_user_id: req.userId,
    p_points: -points,
  })

  return res.json({ success: true, remainingPoints: user.points - points })
})

function calculateTierProgress(totalHours: number) {
  if (totalHours >= 50) {
    return { current: 'gold', next: null, progress: 100, hoursToNext: 0 }
  } else if (totalHours >= 20) {
    return { current: 'silver', next: 'gold', progress: ((totalHours - 20) / 30) * 100, hoursToNext: 50 - totalHours }
  } else {
    return { current: 'bronze', next: 'silver', progress: (totalHours / 20) * 100, hoursToNext: 20 - totalHours }
  }
}

export default router
