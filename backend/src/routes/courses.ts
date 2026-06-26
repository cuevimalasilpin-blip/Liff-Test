import { Router, Response } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate, requireCoach, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/courses/mine — course ของลูกค้า
router.get('/mine', authenticate, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('courses_with_remaining')
    .select('*')
    .eq('user_id', req.userId!)
    .order('is_active', { ascending: false })
    .order('expires_at')

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ courses: data })
})

// POST /api/courses — โค้ชเพิ่ม package ให้ลูกค้า
router.post('/', authenticate, requireCoach, async (req: AuthRequest, res: Response) => {
  const { userId, packageName, totalHours, expiresAt, price, notes } = req.body

  const { data, error } = await supabase
    .from('courses')
    .insert({
      user_id: userId,
      package_name: packageName,
      total_hours: totalHours,
      expires_at: expiresAt,
      price,
      notes,
      created_by: req.userId,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json({ course: data })
})

// PATCH /api/courses/:id/deactivate — ปิด course
router.patch('/:id/deactivate', authenticate, requireCoach, async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const { error } = await supabase
    .from('courses')
    .update({ is_active: false })
    .eq('id', id)

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ success: true })
})

export default router
