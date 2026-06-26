import { Router, Response } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate, requireCoach, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/bookings/slots?date=2024-01-15&branch=ratchayothin
// ดู available slots
router.get('/slots', authenticate, async (req: AuthRequest, res: Response) => {
  const { date, branch } = req.query

  let query = supabase
    .from('time_slots')
    .select('*, users!coach_id(display_name, picture_url)')
    .eq('is_available', true)
    .gte('start_time', `${date}T00:00:00`)
    .lte('start_time', `${date}T23:59:59`)
    .order('start_time')

  if (branch) query = query.eq('branch', branch)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  return res.json({ slots: data })
})

// GET /api/bookings/mine — การจองของลูกค้า
router.get('/mine', authenticate, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`*, time_slots(*, users!coach_id(display_name))`)
    .eq('student_id', req.userId!)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ bookings: data })
})

// POST /api/bookings — จอง slot
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { slotId, courseId, notes } = req.body

  if (!slotId || !courseId) {
    return res.status(400).json({ error: 'slotId and courseId required' })
  }

  // Check slot is still available
  const { data: slot } = await supabase
    .from('time_slots')
    .select('is_available, duration_hours')
    .eq('id', slotId)
    .single()

  if (!slot?.is_available) {
    return res.status(409).json({ error: 'Slot no longer available' })
  }

  // Check course has enough hours
  const { data: course } = await supabase
    .from('courses_with_remaining')
    .select('remaining_hours, is_active, expires_at')
    .eq('id', courseId)
    .eq('user_id', req.userId!)
    .single()

  if (!course?.is_active) {
    return res.status(400).json({ error: 'Course is not active' })
  }
  if (course.remaining_hours < slot.duration_hours) {
    return res.status(400).json({ error: 'Insufficient hours in course' })
  }
  if (new Date(course.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Course has expired' })
  }

  // Create booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      student_id: req.userId,
      slot_id: slotId,
      course_id: courseId,
      notes,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json({ booking })
})

// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('student_id', req.userId!)
    .eq('status', 'confirmed')
    .select()
    .single()

  if (error || !data) {
    return res.status(404).json({ error: 'Booking not found or cannot be cancelled' })
  }
  return res.json({ booking: data })
})

// POST /api/bookings/slots — โค้ชสร้าง time slot
router.post('/slots', authenticate, requireCoach, async (req: AuthRequest, res: Response) => {
  const { branch, startTime, endTime } = req.body

  const { data, error } = await supabase
    .from('time_slots')
    .insert({
      coach_id: req.userId,
      branch,
      start_time: startTime,
      end_time: endTime,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json({ slot: data })
})

// DELETE /api/bookings/slots/:id — โค้ชลบ slot
router.delete('/slots/:id', authenticate, requireCoach, async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const { error } = await supabase
    .from('time_slots')
    .delete()
    .eq('id', id)
    .eq('coach_id', req.userId!)
    .eq('is_available', true)  // ลบได้เฉพาะที่ยังไม่มีคนจอง

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ success: true })
})

export default router
