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

export default router
