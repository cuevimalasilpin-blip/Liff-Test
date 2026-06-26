export type Branch = 'ratchayothin' | 'rama3'
export type Tier = 'bronze' | 'silver' | 'gold'
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed'
export type LoyaltyType = 'earn' | 'redeem' | 'referral_bonus' | 'expiry'

export interface User {
  id: string
  line_uid: string
  display_name: string
  picture_url?: string
  phone?: string
  branch?: Branch
  tier: Tier
  points: number
  total_hours: number
  referral_code: string
  referred_by?: string
  created_at: string
}

export interface Course {
  id: string
  user_id: string
  package_name: string
  total_hours: number
  used_hours: number
  remaining_hours: number
  purchased_at: string
  expires_at: string
  is_active: boolean
}

export interface TimeSlot {
  id: string
  coach_id: string
  branch: Branch
  start_time: string
  end_time: string
  duration_hours: number
  is_available: boolean
}

export interface Booking {
  id: string
  student_id: string
  slot_id: string
  course_id: string
  status: BookingStatus
  notes?: string
  created_at: string
  time_slots?: TimeSlot
}

export interface LessonRecord {
  id: string
  booking_id: string
  student_id: string
  coach_id: string
  date: string
  duration_hours: number
  technical_notes?: string
  tactical_notes?: string
  mental_notes?: string
  media_urls?: string[]
  drills_assigned?: Drill[]
  swing_stats?: SwingStats
  created_at: string
}

export interface SwingStats {
  handicap?: number
  driving_distance?: number
  putting_avg?: number
  gir_percentage?: number
  sand_save?: number
  [key: string]: number | undefined
}

export interface Drill {
  name: string
  description: string
  repetitions?: string
  video_url?: string
}

export interface Achievement {
  id: string
  code: string
  name: string
  description: string
  badge_icon: string
  points_reward: number
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  achievements?: Achievement
}

export interface LoyaltyTransaction {
  id: string
  user_id: string
  type: LoyaltyType
  points: number
  description: string
  reference_id?: string
  created_at: string
}

// Tier thresholds (total hours)
export const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 20,
  gold: 50,
} as const

// Points per hour
export const POINTS_PER_HOUR = 100

// Tier benefits
export const TIER_BENEFITS = {
  bronze: { label: 'Bronze', color: '#CD7F32', discount: 0 },
  silver: { label: 'Silver', color: '#C0C0C0', discount: 5 },
  gold: { label: 'Gold', color: '#FFD700', discount: 10 },
} as const
