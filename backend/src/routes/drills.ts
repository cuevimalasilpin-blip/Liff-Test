import { Router, Response } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate, requireCoach, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/drills — ดึง drill ทั้งหมด (พร้อม filter category)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { category, search } = req.query

  let query = supabase
    .from('drills')
    .select('*')
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category as string)
  }
  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  return res.json({ drills: data || [] })
})

// GET /api/drills/:id — รายละเอียด drill เดียว
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('drills')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (error || !data) return res.status(404).json({ error: 'Drill not found' })
  return res.json({ drill: data })
})

// POST /api/drills — โค้ชสร้าง drill ใหม่
router.post('/', authenticate, requireCoach, async (req: AuthRequest, res: Response) => {
  const { name, description, category, mediaUrl, mediaType, repetitions, tags } = req.body
  if (!name || !category) return res.status(400).json({ error: 'name and category required' })

  const { data, error } = await supabase
    .from('drills')
    .insert({
      name,
      description: description || '',
      category, // 'Technical' | 'Tactical' | 'Mental'
      media_url: mediaUrl || null,
      media_type: mediaType || null, // 'video' | 'image' | 'text'
      repetitions: repetitions || '',
      tags: tags || [],
      created_by: req.userId,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json({ drill: data })
})

// PATCH /api/drills/:id — แก้ไข drill
router.patch('/:id', authenticate, requireCoach, async (req: AuthRequest, res: Response) => {
  const { name, description, category, mediaUrl, mediaType, repetitions, tags } = req.body

  const { data, error } = await supabase
    .from('drills')
    .update({
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(category && { category }),
      ...(mediaUrl !== undefined && { media_url: mediaUrl }),
      ...(mediaType !== undefined && { media_type: mediaType }),
      ...(repetitions !== undefined && { repetitions }),
      ...(tags && { tags }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ drill: data })
})

// DELETE /api/drills/:id
router.delete('/:id', authenticate, requireCoach, async (req: AuthRequest, res: Response) => {
  const { error } = await supabase
    .from('drills')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ success: true })
})

// POST /api/drills/:id/upload-url — signed URL for drill media
router.post('/:id/upload-url', authenticate, requireCoach, async (req: AuthRequest, res: Response) => {
  const { fileName, contentType } = req.body
  if (!fileName || !contentType) return res.status(400).json({ error: 'fileName and contentType required' })

  const ext = fileName.split('.').pop()
  const path = `drills/${req.params.id}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('drill-media')
    .createSignedUploadUrl(path)

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ uploadUrl: data.signedUrl, path, token: data.token })
})

export default router
