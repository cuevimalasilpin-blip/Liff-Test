import { Router, Response } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate, requireCoach, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/admin/dashboard — overview
router.get('/dashboard', authenticate, requireCoach, async (_req: AuthRequest, res: Response) => {
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: todayBookings },
    { data: expiringCourses },
    { data: activeStudents },
    { count: totalStudents },
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, time_slots(*), users!student_id(display_name)')
      .eq('status', 'confirmed')
      .gte('time_slots.start_time', `${today}T00:00:00`)
      .lte('time_slots.start_time', `${today}T23:59:59`),

    supabase
      .from('courses_with_remaining')
      .select('*, users(display_name, phone)')
      .eq('is_active', true)
      .lte('expires_at', thirtyDaysLater)
      .order('expires_at'),

    supabase
      .from('bookings')
      .select('student_id', { count: 'exact' })
      .eq('status', 'confirmed'),

    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_coach', false),
  ])

  return res.json({
    todayBookings: todayBookings || [],
    expiringCourses: expiringCourses || [],
    activeStudentsToday: activeStudents?.length || 0,
    totalStudents: totalStudents || 0,
  })
})

// GET /api/admin/students — รายชื่อนักเรียนทั้งหมด
router.get('/students', authenticate, requireCoach, async (req: AuthRequest, res: Response) => {
  const { search, branch } = req.query

  let query = supabase
    .from('users')
    .select(`
      *,
      courses(id, package_name, remaining_hours:total_hours-used_hours, expires_at, is_active)
    `)
    .eq('is_coach', false)
    .order('created_at', { ascending: false })

  if (search) query = query.ilike('display_name', `%${search}%`)
  if (branch) query = query.eq('branch', branch)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  return res.json({ students: data })
})

// GET /api/admin/revenue — revenue summary
router.get('/revenue', authenticate, requireCoach, async (_req: AuthRequest, res: Response) => {
  const { data: courses } = await supabase
    .from('courses')
    .select('price, total_hours, purchased_at')
    .not('price', 'is', null)
    .order('purchased_at', { ascending: false })

  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const monthlyRevenue = courses
    ?.filter(c => new Date(c.purchased_at) >= thisMonth)
    .reduce((sum, c) => sum + (c.price || 0), 0) || 0

  const totalRevenue = courses?.reduce((sum, c) => sum + (c.price || 0), 0) || 0

  return res.json({
    monthlyRevenue,
    totalRevenue,
    totalPackagesSold: courses?.length || 0,
  })
})

// ── SLOTS MANAGEMENT ──────────────────────────────────────────────

// GET /api/admin/slots — ดู slots ทั้งหมด (filter by date/branch)
router.get('/slots', authenticate, requireCoach, async (req: AuthRequest, res: Response) => {
  const { date, branch } = req.query

  let query = supabase
    .from('time_slots')
    .select('*, bookings(id, status, users!student_id(display_name, picture_url))')
    .order('start_time', { ascending: true })

  if (date) {
    query = query
      .gte('start_time', `${date}T00:00:00`)
      .lte('start_time', `${date}T23:59:59`)
  }
  if (branch) query = query.eq('branch', branch as string)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  return res.json({ slots: data || [] })
})

// POST /api/admin/slots — สร้าง slot ใหม่
router.post('/slots', authenticate, requireCoach, async (req: AuthRequest, res: Response) => {
  const { branch, startTime, endTime, room, notes } = req.body
  if (!branch || !startTime || !endTime) return res.status(400).json({ error: 'branch, startTime, endTime required' })

  const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime()
  const durationHours = durationMs / (1000 * 60 * 60)

  const { data, error } = await supabase
    .from('time_slots')
    .insert({
      branch,
      start_time: startTime,
      end_time: endTime,
      duration_hours: durationHours,
      room: room || null,
      notes: notes || null,
      is_available: true,
      coach_id: req.userId,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json({ slot: data })
})

// PATCH /api/admin/slots/:id — อัปเดต slot (block/unblock, แก้เวลา)
router.patch('/slots/:id', authenticate, requireCoach, async (req: AuthRequest, res: Response) => {
  const { isAvailable, startTime, endTime, room, notes } = req.body

  const { data, error } = await supabase
    .from('time_slots')
    .update({
      ...(isAvailable !== undefined && { is_available: isAvailable }),
      ...(startTime && { start_time: startTime }),
      ...(endTime && { end_time: endTime }),
      ...(room !== undefined && { room }),
      ...(notes !== undefined && { notes }),
    })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ slot: data })
})

// DELETE /api/admin/slots/:id — ลบ slot (ถ้าไม่มี booking)
router.delete('/slots/:id', authenticate, requireCoach, async (req: AuthRequest, res: Response) => {
  const { data: slot } = await supabase
    .from('time_slots')
    .select('bookings(id)')
    .eq('id', req.params.id)
    .single()

  const bookings = (slot as any)?.bookings || []
  if (bookings.length > 0) return res.status(409).json({ error: 'ไม่สามารถลบ slot ที่มีการจองแล้ว' })

  const { error } = await supabase.from('time_slots').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  return res.json({ success: true })
})

// POST /api/admin/slots/bulk — สร้าง slots หลายอัน (recurring)
router.post('/slots/bulk', authenticate, requireCoach, async (req: AuthRequest, res: Response) => {
  const { branch, slots, room } = req.body
  // slots = [{ startTime, endTime }]
  if (!branch || !slots?.length) return res.status(400).json({ error: 'branch and slots required' })

  const rows = slots.map((s: { startTime: string; endTime: string }) => {
    const durationMs = new Date(s.endTime).getTime() - new Date(s.startTime).getTime()
    return {
      branch,
      start_time: s.startTime,
      end_time: s.endTime,
      duration_hours: durationMs / (1000 * 60 * 60),
      room: room || null,
      is_available: true,
      coach_id: req.userId,
    }
  })

  const { data, error } = await supabase.from('time_slots').insert(rows).select()
  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json({ slots: data, created: data?.length || 0 })
})

export default router
