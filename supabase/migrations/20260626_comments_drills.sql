-- ════════════════════════════════════════════════
-- Migration: lesson_comments + drills tables
-- Date: 2026-06-26
-- ════════════════════════════════════════════════

-- ── lesson_comments ──────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_comments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_record_id UUID NOT NULL REFERENCES lesson_records(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_role      TEXT NOT NULL CHECK (sender_role IN ('coach', 'student')),
  sender_name      TEXT,
  message          TEXT NOT NULL DEFAULT '',
  media_url        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson ON lesson_comments(lesson_record_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_sender ON lesson_comments(sender_id);

-- RLS
ALTER TABLE lesson_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_comments_select" ON lesson_comments
  FOR SELECT USING (
    sender_id = auth.uid()
    OR lesson_record_id IN (
      SELECT id FROM lesson_records
      WHERE student_id = auth.uid() OR coach_id = auth.uid()
    )
  );

CREATE POLICY "lesson_comments_insert" ON lesson_comments
  FOR INSERT WITH CHECK (
    lesson_record_id IN (
      SELECT id FROM lesson_records
      WHERE student_id = auth.uid() OR coach_id = auth.uid()
    )
  );

-- ── drills ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drills (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL CHECK (category IN ('Technical', 'Tactical', 'Mental')),
  media_url   TEXT,
  media_type  TEXT CHECK (media_type IN ('video', 'image', 'text')),
  repetitions TEXT,
  tags        TEXT[] DEFAULT '{}',
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drills_category ON drills(category);

ALTER TABLE drills ENABLE ROW LEVEL SECURITY;

-- ทุกคนที่ login ดูได้
CREATE POLICY "drills_select" ON drills FOR SELECT USING (true);
-- เฉพาะ coach สร้าง/แก้/ลบ (enforced ที่ backend แล้ว แต่ทำ double-check)
CREATE POLICY "drills_insert" ON drills FOR INSERT WITH CHECK (true);
CREATE POLICY "drills_update" ON drills FOR UPDATE USING (true);
CREATE POLICY "drills_delete" ON drills FOR DELETE USING (true);

-- ── Supabase Storage buckets ──────────────────────
-- Run these manually in Supabase Dashboard > Storage:
--
-- 1. Create bucket "lesson-media" (public: true)
-- 2. Create bucket "drill-media"  (public: true)
--
-- Or via SQL (requires storage extension):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-media', 'lesson-media', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('drill-media', 'drill-media', true) ON CONFLICT DO NOTHING;

-- Storage policies for lesson-media
-- CREATE POLICY "lesson_media_select" ON storage.objects FOR SELECT USING (bucket_id = 'lesson-media');
-- CREATE POLICY "lesson_media_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lesson-media' AND auth.role() = 'authenticated');
