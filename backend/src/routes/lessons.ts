import { Router, Response } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate, requireCoach, AuthRequest } from '../middleware/auth'
import { POINTS_PER_HOUR, TIER_THRESHOLDS } from '../types'
import type { Tier } from '../types'

const router = Router()

// GET /api/lessons/mine — ประวัติการเรียน
router.get('/mine', authenticate, async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '10' } = req.query
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string)

  const { data, error, count } = await supabase
    .from('lesson_records')
    .select('*, users!coach_id(display_name, picture_url)', { count: 'exact' })
    .eq('student_id', req.userId!)
    .order('date', { ascending: false })
    .range(offset, offset + parseInt(limit as string) - 1)

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ lessons: data, total: count })
})

// GET /api/lessons/:id — รายละเอียด session
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('lesson_records')
    .select('*, users!coach_id(display_name, picture_url)')
    .eq('id', req.params.id)
    .eq('student_id', req.userId!)
    .single()

  if (error || !data) return res.status(404).json({ error: 'Lesson not found' })
  return res.json({ lesson: data })
})

// POST /api/lessons — โค้ชบันทึกเนื้อหาหลังสอน
router.post('/', authenticate, requireCoach, async (req: AuthRequest, res: Response) => {
  const {
    bookingId, studentId, date, durationHours,
    technicalNotes, tacticalNotes, mentalNotes,
    mediaUrls, drillsAssigned, swingStats,
  } = req.body

  // Create lesson record
  const { data: lesson, error } = await supabase
    .from('lesson_records')
    .insert({
      booking_id: bookingId,
      student_id: studentId,
      coach_id: req.userId,
      date,
      duration_hours: durationHours,
      technical_notes: technicalNotes,
      tactical_notes: tacticalNotes,
      mental_notes: mentalNotes,
      media_urls: mediaUrls || [],
      drills_assigned: drillsAssigned || [],
      swing_stats: swingStats || {},
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  // Update course used_hours
  if (bookingId) {
    const { data: booking } = await supabase
      .from('bookings')
      .select('course_id')
      .eq('id', bookingId)
      .single()

    if (booking) {
      await supabase.rpc('increment_course_hours', {
        p_course_id: booking.course_id,
        p_hours: durationHours,
      })
      await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId)
    }
  }

  // Award loyalty points
  const pointsEarned = Math.round(durationHours * POINTS_PER_HOUR)
  await supabase.from('loyalty_transactions').insert({
    user_id: studentId,
    type: 'earn',
    points: pointsEarned,
    description: `เรียน ${durationHours} ชั่วโมง เมื่อ ${date}`,
    reference_id: lesson.id,
  })

  // Update user total_hours and points
  const { data: updatedUser } = await supabase.rpc('update_user_after_lesson', {
    p_user_id: studentId,
    p_hours: durationHours,
    p_points: pointsEarned,
  })

  // Save swing progress if stats provided
  if (swingStats && Object.keys(swingStats).length > 0) {
    await supabase.from('swing_progress').insert({
      student_id: studentId,
      lesson_record_id: lesson.id,
      recorded_at: date,
      ...swingStats,
    })
  }

  // Check achievements
  await checkAndAwardAchievements(studentId, durationHours)

  return res.status(201).json({ lesson, pointsEarned })
})

// PATCH /api/lessons/:id — แก้ไข lesson record
router.patch('/:id', authenticate, requireCoach, async (req: AuthRequest, res: Response) => {
  const { technicalNotes, tacticalNotes, mentalNotes, drillsAssigned, mediaUrls } = req.body

  const { data, error } = await supabase
    .from('lesson_records')
    .update({
      technical_notes: technicalNotes,
      tactical_notes: tacticalNotes,
      mental_notes: mentalNotes,
      drills_assigned: drillsAssigned,
      media_urls: mediaUrls,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .eq('coach_id', req.userId!)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ lesson: data })
})

// POST /api/lessons/:id/media — upload media (signed upload URL)
router.post('/:id/media/upload-url', authenticate, async (req: AuthRequest, res: Response) => {
  const { fileName, contentType } = req.body
  if (!fileName || !contentType) return res.status(400).json({ error: 'fileName and contentType required' })

  const ext = fileName.split('.').pop()
  const path = `lessons/${req.params.id}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('lesson-media')
    .createSignedUploadUrl(path)

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ uploadUrl: data.signedUrl, path, token: data.token })
})

// PATCH /api/lessons/:id/media — เพิ่ม media_url เข้า lesson record
router.patch('/:id/media', authenticate, async (req: AuthRequest, res: Response) => {
  const { publicUrl } = req.body
  if (!publicUrl) return res.status(400).json({ error: 'publicUrl required' })

  // ดึง lesson เดิม
  const { data: lesson, error: fetchErr } = await supabase
    .from('lesson_records')
    .select('media_urls, student_id, coach_id')
    .eq('id', req.params.id)
    .single()

  if (fetchErr || !lesson) return res.status(404).json({ error: 'Lesson not found' })

  // อนุญาตแค่ student เจ้าของ หรือ coach เจ้าของ
  if (lesson.student_id !== req.userId && lesson.coach_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const existing: string[] = lesson.media_urls || []
  const updated = [...existing, publicUrl]

  const { data, error } = await supabase
    .from('lesson_records')
    .update({ media_urls: updated, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ lesson: data })
})

// GET /api/lessons/:id/comments — ดึง comments
router.get('/:id/comments', authenticate, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('lesson_comments')
    .select('*, users!sender_id(display_name, picture_url, is_coach)')
    .eq('lesson_record_id', req.params.id)
    .order('created_at', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ comments: data || [] })
})

// POST /api/lessons/:id/comments — ส่ง comment
router.post('/:id/comments', authenticate, async (req: AuthRequest, res: Response) => {
  const { message, mediaUrl } = req.body
  if (!message?.trim() && !mediaUrl) return res.status(400).json({ error: 'message or mediaUrl required' })

  // check access
  const { data: lesson } = await supabase
    .from('lesson_records')
    .select('student_id, coach_id')
    .eq('id', req.params.id)
    .single()

  if (!lesson) return res.status(404).json({ error: 'Lesson not found' })
  if (lesson.student_id !== req.userId && lesson.coach_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { data: user } = await supabase
    .from('users')
    .select('is_coach, display_name')
    .eq('id', req.userId!)
    .single()

  const { data, error } = await supabase
    .from('lesson_comments')
    .insert({
      lesson_record_id: req.params.id,
      sender_id: req.userId,
      sender_role: user?.is_coach ? 'coach' : 'student',
      sender_name: user?.display_name,
      message: message?.trim() || '',
      media_url: mediaUrl || null,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json({ comment: data })
})

// Helper: check and award achievements
async function checkAndAwardAchievements(studentId: string, _newHours: number) {
  const { data: user } = await supabase
    .from('users')
    .select('total_hours, id')
    .eq('id', studentId)
    .single()

  if (!user) return

  const totalHours = user.total_hours
  const milestones: Array<{ code: string; threshold: number }> = [
    { code: 'first_lesson', threshold: 0.5 },
    { code: 'five_hours', threshold: 5 },
    { code: 'ten_hours', threshold: 10 },
    { code: 'twenty_hours', threshold: 20 },
    { code: 'fifty_hours', threshold: 50 },
  ]

  for (const milestone of milestones) {
    if (totalHours >= milestone.threshold) {
      const { data: achievement } = await supabase
        .from('achievements')
        .select('id, points_reward')
        .eq('code', milestone.code)
        .single()

      if (!achievement) continue

      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert({ user_id: studentId, achievement_id: achievement.id })

      if (!insertError && achievement.points_reward > 0) {
        await supabase.from('loyalty_transactions').insert({
          user_id: studentId,
          type: 'earn',
          points: achievement.points_reward,
          description: `🏆 Achievement unlocked!`,
          reference_id: achievement.id,
        })
        await supabase.rpc('add_user_points', {
          p_user_id: studentId,
          p_points: achievement.points_reward,
        })
      }
    }
  }

  // Update tier
  let newTier: Tier = 'bronze'
  if (totalHours >= TIER_THRESHOLDS.gold) newTier = 'gold'
  else if (totalHours >= TIER_THRESHOLDS.silver) newTier = 'silver'

  await supabase
    .from('users')
    .update({ tier: newTier })
    .eq('id', studentId)
}

export default router
