import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'

export interface AuthRequest extends Request {
  userId?: string
  lineUid?: string
  isCoach?: boolean
}

// Verify Line UID from header (sent by frontend after LIFF.init())
export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const lineUid = req.headers['x-line-uid'] as string

  if (!lineUid) {
    return res.status(401).json({ error: 'Unauthorized — missing Line UID' })
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, is_coach')
    .eq('line_uid', lineUid)
    .single()

  if (error || !user) {
    return res.status(401).json({ error: 'User not found' })
  }

  req.userId = user.id
  req.lineUid = lineUid
  req.isCoach = user.is_coach
  next()
}

export function requireCoach(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.isCoach) {
    return res.status(403).json({ error: 'Forbidden — coach only' })
  }
  next()
}
