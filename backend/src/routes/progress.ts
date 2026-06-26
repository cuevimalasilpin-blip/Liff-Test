import { Router, Response } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/progress/mine?months=6
router.get('/mine', authenticate, async (req: AuthRequest, res: Response) => {
  const months = parseInt(req.query.months as string) || 6
  const fromDate = new Date()
  fromDate.setMonth(fromDate.getMonth() - months)

  const { data, error } = await supabase
    .from('swing_progress')
    .select('*')
    .eq('student_id', req.userId!)
    .gte('recorded_at', fromDate.toISOString().split('T')[0])
    .order('recorded_at')

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ progress: data })
})

// GET /api/progress/latest — stats ล่าสุด
router.get('/latest', authenticate, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('swing_progress')
    .select('*')
    .eq('student_id', req.userId!)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return res.status(404).json({ latest: null })
  return res.json({ latest: data })
})

export default router
