-- ============================================
-- Helper Functions สำหรับ Atomic Updates
-- ============================================

-- เพิ่ม/ลด points
CREATE OR REPLACE FUNCTION add_user_points(p_user_id uuid, p_points integer)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET points = GREATEST(0, points + p_points),
      updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- เพิ่ม used_hours ใน course
CREATE OR REPLACE FUNCTION increment_course_hours(p_course_id uuid, p_hours numeric)
RETURNS void AS $$
BEGIN
  UPDATE courses
  SET used_hours = used_hours + p_hours,
      updated_at = now()
  WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- อัพเดท total_hours และ points หลังเรียน
CREATE OR REPLACE FUNCTION update_user_after_lesson(
  p_user_id uuid,
  p_hours numeric,
  p_points integer
)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET total_hours = total_hours + p_hours,
      points = points + p_points,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
