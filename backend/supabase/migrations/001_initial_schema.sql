-- ============================================
-- Underpar Club — Initial Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  line_uid        text UNIQUE NOT NULL,
  display_name    text NOT NULL,
  picture_url     text,
  phone           text,
  branch          text CHECK (branch IN ('ratchayothin', 'rama3')),
  tier            text NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold')),
  points          integer NOT NULL DEFAULT 0,
  total_hours     numeric NOT NULL DEFAULT 0,
  referral_code   text UNIQUE,
  referred_by     uuid REFERENCES users(id),
  is_coach        boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Auto-generate referral_code on insert
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := upper(substring(replace(NEW.id::text, '-', ''), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- ============================================
-- COURSES (packages ที่ลูกค้าซื้อ)
-- ============================================
CREATE TABLE courses (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_name    text NOT NULL,
  total_hours     numeric NOT NULL,
  used_hours      numeric NOT NULL DEFAULT 0,
  purchased_at    timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  price           numeric,
  notes           text,
  created_by      uuid REFERENCES users(id),  -- coach ที่เพิ่ม package
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Virtual column: remaining_hours
CREATE VIEW courses_with_remaining AS
SELECT *, (total_hours - used_hours) AS remaining_hours FROM courses;

-- ============================================
-- TIME SLOTS (โค้ชกำหนดล่วงหน้า)
-- ============================================
CREATE TABLE time_slots (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id        uuid NOT NULL REFERENCES users(id),
  branch          text NOT NULL CHECK (branch IN ('ratchayothin', 'rama3')),
  start_time      timestamptz NOT NULL,
  end_time        timestamptz NOT NULL,
  duration_hours  numeric GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time)) / 3600
  ) STORED,
  is_available    boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- ============================================
-- BOOKINGS
-- ============================================
CREATE TABLE bookings (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      uuid NOT NULL REFERENCES users(id),
  slot_id         uuid NOT NULL REFERENCES time_slots(id),
  course_id       uuid NOT NULL REFERENCES courses(id),
  status          text NOT NULL DEFAULT 'confirmed'
                    CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slot_id, status) -- prevent double booking (exclude cancelled)
);

-- Mark slot as unavailable when booked
CREATE OR REPLACE FUNCTION update_slot_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE time_slots SET is_available = false WHERE id = NEW.slot_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
    UPDATE time_slots SET is_available = true WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_slot_availability
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_slot_availability();

-- ============================================
-- LESSON RECORDS (เนื้อหาการเรียน)
-- ============================================
CREATE TABLE lesson_records (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      uuid REFERENCES bookings(id),
  student_id      uuid NOT NULL REFERENCES users(id),
  coach_id        uuid NOT NULL REFERENCES users(id),
  date            date NOT NULL,
  duration_hours  numeric NOT NULL DEFAULT 1,
  technical_notes text,
  tactical_notes  text,
  mental_notes    text,
  media_urls      jsonb DEFAULT '[]',
  drills_assigned jsonb DEFAULT '[]',
  swing_stats     jsonb DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- SWING PROGRESS (for charts)
-- ============================================
CREATE TABLE swing_progress (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id        uuid NOT NULL REFERENCES users(id),
  lesson_record_id  uuid REFERENCES lesson_records(id),
  recorded_at       date NOT NULL,
  handicap          numeric,
  driving_distance  numeric,
  putting_avg       numeric,
  gir_percentage    numeric,
  sand_save         numeric,
  custom_metrics    jsonb DEFAULT '{}',
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- LOYALTY TRANSACTIONS
-- ============================================
CREATE TABLE loyalty_transactions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL REFERENCES users(id),
  type            text NOT NULL CHECK (type IN ('earn', 'redeem', 'referral_bonus', 'expiry')),
  points          integer NOT NULL,
  description     text NOT NULL,
  reference_id    uuid,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- ACHIEVEMENTS
-- ============================================
CREATE TABLE achievements (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            text UNIQUE NOT NULL,
  name            text NOT NULL,
  description     text NOT NULL,
  badge_icon      text NOT NULL,
  points_reward   integer NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true
);

CREATE TABLE user_achievements (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL REFERENCES users(id),
  achievement_id  uuid NOT NULL REFERENCES achievements(id),
  earned_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

-- ============================================
-- REFERRALS
-- ============================================
CREATE TABLE referrals (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id     uuid NOT NULL REFERENCES users(id),
  referred_id     uuid NOT NULL REFERENCES users(id),
  bonus_given     boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (referred_id)  -- คนนึงถูก refer ได้ครั้งเดียว
);

-- ============================================
-- SEED: Default Achievements
-- ============================================
INSERT INTO achievements (code, name, description, badge_icon, points_reward) VALUES
  ('first_lesson',    'ก้าวแรก',           'เรียนครั้งแรกกับ Underpar Club',     '🏌️', 50),
  ('five_hours',      'นักกอล์ฟตัวจริง',   'สะสมชั่วโมงเรียนครบ 5 ชั่วโมง',     '⭐', 100),
  ('ten_hours',       'มือโปร',            'สะสมชั่วโมงเรียนครบ 10 ชั่วโมง',     '🌟', 200),
  ('twenty_hours',    'แชมเปี้ยน',         'สะสมชั่วโมงเรียนครบ 20 ชั่วโมง',    '🏆', 500),
  ('fifty_hours',     'ตำนาน Underpar',    'สะสมชั่วโมงเรียนครบ 50 ชั่วโมง',    '👑', 1000),
  ('handicap_20',     'Handicap 20',       'Handicap ลดเหลือ 20 หรือต่ำกว่า',    '📉', 200),
  ('handicap_10',     'Single Digit',      'Handicap ลดเหลือ 10 หรือต่ำกว่า',    '💎', 500),
  ('first_referral',  'Ambassador',        'แนะนำเพื่อนมาสมัครสำเร็จ 1 คน',       '🤝', 150),
  ('five_referrals',  'Super Ambassador',  'แนะนำเพื่อนมาสมัครสำเร็จ 5 คน',      '🚀', 500),
  ('consistent',      'นักเรียนขยัน',      'จองเรียนทุกสัปดาห์ติดต่อกัน 4 สัปดาห์', '📅', 200);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE swing_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users: ดูตัวเองได้, service role ดูทุกคนได้
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Service role full access users" ON users
  USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_slot ON bookings(slot_id);
CREATE INDEX idx_courses_user ON courses(user_id);
CREATE INDEX idx_lesson_records_student ON lesson_records(student_id);
CREATE INDEX idx_swing_progress_student ON swing_progress(student_id, recorded_at);
CREATE INDEX idx_loyalty_user ON loyalty_transactions(user_id, created_at);
CREATE INDEX idx_time_slots_available ON time_slots(is_available, start_time);
