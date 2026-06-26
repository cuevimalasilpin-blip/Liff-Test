# Underpar Club — Line Mini App
## Full Architecture & Project Plan

---

## 📋 Full Feature Scope

### Phase 1 — Core Features
| # | Feature | Description |
|---|---------|-------------|
| 1 | **Booking System** | Conditional booking ตาม service type — บาง service ผูก simulator room, ลูกค้าเลือกโปรได้, Free trial จองได้ 1 ครั้งเท่านั้น, หลังซื้อ course admin เปิด slot เฉพาะตามโปรแกรมที่ซื้อ |
| 1a | **Coach Management** | เพิ่ม/ลดจำนวนโปร + กำหนด permission และ certified level ของแต่ละโปร (e.g. Junior Coach, Certified PGA, Head Coach) |
| 1b | **Asset Management** | จัดการห้อง simulator — กำหนดจำนวนห้อง, ชื่อ, branch, ความพร้อมใช้งาน ผูกกับ service type ที่ต้องการ |
| 2 | **Course Hours Tracker** | เช็คชั่วโมงคงเหลือ + วันหมดอายุ + แจ้งเตือนเมื่อใกล้หมด |
| 3 | **Swing Progress Tracker** | ระบบรวม Lesson Log + Progress ในหน้าเดียว — ทีมโปร/admin บันทึก Text Summary, อัพโหลดรูปและวิดีโอ swing analysis, และ Stats (Handicap, Driving distance ฯลฯ) หลังสอนแต่ละ session · ลูกค้าดูย้อนหลังได้และ Comment ตอบกลับได้ทั้งเป็น Text, รูป, และ VDO · ทีมโปร/admin ตอบ comment กลับได้ (thread-based) |

### Phase 2 — Loyalty & Growth
| # | Feature | Description |
|---|---------|-------------|
| 5 | **Loyalty Points** | เรียน 1 ชั่วโมง = แต้ม X แลกของรางวัลหรือส่วนลดได้ |
| 6 | **Tier System** | Bronze → Silver → Gold ตามชั่วโมงสะสม มีสิทธิพิเศษต่าง tier |
| 7 | **Achievement / Badge** | milestone เช่น "เรียนครบ 10 ชั่วโมง", "Handicap ลด 5" |
| 8 | **Referral Program** | แชร์ link ชวนเพื่อน → ได้ bonus hours/points |
| 9 | **Package Upsell Prompt** | แจ้งเตือนเมื่อชั่วโมงเหลือ 20% + deep link ไปซื้อ package |

### Phase 3 — Media, Feedback & Admin
| # | Feature | Description |
|---|---------|-------------|
| 10 | **Media Upload** (รวมใน Swing Progress Tracker) | โปร/admin อัพโหลดรูป + VDO swing analysis ต่อ session ผ่าน Supabase Storage |
| 11 | **Drill Library** (รวมใน Swing Progress Tracker) | assign แบบฝึกหัดให้ลูกค้าทำบ้าน แต่ละ drill มี Text คำอธิบาย + อัพโหลดรูปและ VDO ประกอบได้ แสดงใน session detail |
| 12 | **Comment & Feedback Thread** (รวมใน Swing Progress Tracker) | ลูกค้า/โปร/admin ส่ง Text, รูป, VDO ตอบกลับกันเป็น thread ใน session |
| 13 | **Admin Dashboard** | Revenue, Coach schedule, Expiring courses, Coach/Asset/Service management |

---

## 🏗️ Tech Stack

```
Frontend (Line Mini App)
├── React 18 + TypeScript
├── Vite (build tool)
├── LIFF SDK 2.x (Line Frontend Framework)
├── TailwindCSS (styling)
├── React Query (data fetching)
└── Recharts (progress charts)

Backend
├── Node.js + Express + TypeScript
├── Supabase JS Client
├── Line Messaging API SDK
└── Multer + Supabase Storage (file uploads)

Database & Infrastructure
├── Supabase (PostgreSQL + Auth + Storage + Realtime)
├── Vercel (Frontend hosting)
├── Railway or Render (Backend hosting — free tier)
└── Line Developers Console (LIFF + Messaging API)
```

---

## 🗄️ Database Schema

### users
```sql
id              uuid PRIMARY KEY (from Line UID)
line_uid        text UNIQUE NOT NULL
display_name    text
picture_url     text
phone           text
branch          text  -- 'ratchayothin' | 'rama3'
tier            text DEFAULT 'bronze'  -- bronze/silver/gold
points          integer DEFAULT 0
total_hours     numeric DEFAULT 0
referral_code   text UNIQUE
referred_by     uuid REFERENCES users(id)
is_coach        boolean DEFAULT false
coach_level     text  -- NULL | 'junior' | 'certified' | 'pga' | 'head_coach'
coach_is_active boolean DEFAULT true
created_at      timestamptz DEFAULT now()
```

> **Coach Permission Levels**: `junior` (สอนมือใหม่/กลุ่ม), `certified` (สอนได้ทุก service), `pga` (Certified PGA), `head_coach` (สอนได้ทุก service + จัดการ admin)
> Admin เพิ่ม/ลดโปรและกำหนด `coach_level` ได้จาก Admin Dashboard

### service_types (ประเภท service ที่ให้บริการ)
```sql
id                  uuid PRIMARY KEY
name                text   -- e.g. "Private 1-on-1", "Free Trial", "Simulator Session"
description         text
price_per_session   numeric
requires_simulator  boolean DEFAULT false  -- ต้องผูกห้อง simulator
min_coach_level     text   -- coach_level ขั้นต่ำที่สอน service นี้ได้
is_free_trial       boolean DEFAULT false  -- Free Trial (จำกัด 1 ครั้ง/คน)
is_active           boolean DEFAULT true
```

### simulator_rooms (ห้อง simulator)
```sql
id          uuid PRIMARY KEY
name        text   -- e.g. "Sim Room A", "Sim Room B"
branch      text   -- 'ratchayothin' | 'rama3'
is_active   boolean DEFAULT true
notes       text
```

### courses (packages ที่ซื้อ)
```sql
id                  uuid PRIMARY KEY
user_id             uuid REFERENCES users(id)
package_name        text
total_hours         numeric
used_hours          numeric DEFAULT 0
remaining_hours     numeric GENERATED ALWAYS AS (total_hours - used_hours)
purchased_at        timestamptz
expires_at          timestamptz
is_active           boolean DEFAULT true
allowed_service_ids uuid[]  -- service_types ที่ลูกค้าคน package นี้ใช้ได้
                            -- ถ้า NULL = ใช้ได้ทุก service
```

> เมื่อลูกค้าซื้อ course admin กำหนด `allowed_service_ids` ตามโปรแกรมที่ซื้อ
> เช่น ซื้อ "Competitive Package" → เปิดเฉพาะ service type "Private 1-on-1" และ "Simulator Session" เท่านั้น

### time_slots (โค้ชหรือ admin สร้าง)
```sql
id                  uuid PRIMARY KEY
coach_id            uuid REFERENCES users(id)
service_type_id     uuid REFERENCES service_types(id)  -- service ที่ slot นี้รองรับ
simulator_room_id   uuid REFERENCES simulator_rooms(id) -- NULL ถ้าไม่ต้องการ simulator
branch              text
start_time          timestamptz
end_time            timestamptz
duration_hours      numeric
is_available        boolean DEFAULT true
target_course_ids   uuid[]  -- ถ้าตั้งค่า จะเปิดเฉพาะ course เหล่านี้จองได้
                             -- NULL = เปิดสำหรับทุก course ที่มี service นี้
```

> Admin เปิด slot แบบ "เฉพาะลูกค้าคนนี้" ได้ด้วย `target_course_ids`

### bookings
```sql
id                  uuid PRIMARY KEY
student_id          uuid REFERENCES users(id)
slot_id             uuid REFERENCES time_slots(id)
course_id           uuid REFERENCES courses(id)
service_type_id     uuid REFERENCES service_types(id)
simulator_room_id   uuid REFERENCES simulator_rooms(id)  -- auto-assigned จาก slot
is_free_trial       boolean DEFAULT false
status              text DEFAULT 'confirmed'  -- confirmed/cancelled/completed
notes               text
created_at          timestamptz DEFAULT now()
```

> **Free Trial Logic**: ระบบเช็คว่า student_id นี้เคย `is_free_trial = true` มาแล้วหรือยัง ถ้ามีแล้วจอง Free Trial ไม่ได้อีก

### lesson_records (Swing Progress Tracker — รวม Lesson Log + Stats)
```sql
id              uuid PRIMARY KEY
booking_id      uuid REFERENCES bookings(id)
student_id      uuid REFERENCES users(id)
coach_id        uuid REFERENCES users(id)  -- ทีมโปร/admin เป็นคนสร้าง
date            date
duration_hours  numeric
-- Text Summary (บันทึกโดยทีมโปร/admin เท่านั้น)
technical_notes text   -- Technical: วงสวิง, Short game
tactical_notes  text   -- Tactical: Game management
mental_notes    text   -- Mental: Champion mindset
-- Media (อัพโหลดโดยทีมโปร/admin เท่านั้น)
media_urls      jsonb  -- array of { url, type: 'image'|'video', caption }
-- Drills & Stats
drills_assigned jsonb  -- array of { name, description, repetitions, media_urls: [{url, type:'image'|'video'}] }
swing_stats     jsonb  -- { handicap, driving_distance, putting_avg, ... }
-- Progress data (สำหรับ chart)
handicap        numeric
driving_distance numeric
putting_avg     numeric
gir_percentage  numeric
sand_save       numeric
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

> **ใครทำอะไรได้**: ทีมโปร/admin → สร้าง/แก้ record, อัพโหลดสื่อ, บันทึก stats · ลูกค้า → ดูเท่านั้น + comment

### lesson_comments (Comment / Feedback thread)
```sql
id                  uuid PRIMARY KEY
lesson_record_id    uuid NOT NULL REFERENCES lesson_records(id) ON DELETE CASCADE
parent_id           uuid REFERENCES lesson_comments(id)  -- NULL = top-level, ไม่ NULL = reply
author_id           uuid NOT NULL REFERENCES users(id)
author_role         text NOT NULL  -- 'student' | 'coach' | 'admin'
content_text        text           -- ข้อความ (nullable ถ้ามีแค่ media)
media_urls          jsonb DEFAULT '[]'  -- array of { url, type: 'image'|'video' }
                                        -- ลูกค้า, โปร, admin ส่งได้ทุกคน
is_deleted          boolean DEFAULT false
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
```

> **Comment Rules**
> - ทุกคน (ลูกค้า, โปร, admin) comment และ reply ได้
> - แนบรูปหรือ VDO ใน comment ได้ทุกคน
> - ลูกค้าลบ comment ตัวเองได้ · โปร/admin ลบได้ทุก comment
> - thread ลึก 2 ระดับ (comment → reply) ไม่ซ้อนลึกกว่านั้น

### loyalty_transactions
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users(id)
type            text   -- 'earn' | 'redeem' | 'referral_bonus' | 'expiry'
points          integer
description     text
reference_id    uuid   -- booking_id or redemption_id
created_at      timestamptz DEFAULT now()
```

### achievements
```sql
id              uuid PRIMARY KEY
code            text UNIQUE   -- 'first_lesson', 'ten_hours', 'handicap_5'
name            text
description     text
badge_icon      text
points_reward   integer DEFAULT 0
```

### user_achievements
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users(id)
achievement_id  uuid REFERENCES achievements(id)
earned_at       timestamptz DEFAULT now()
```

### referrals
```sql
id              uuid PRIMARY KEY
referrer_id     uuid REFERENCES users(id)
referred_id     uuid REFERENCES users(id)
bonus_given     boolean DEFAULT false
created_at      timestamptz DEFAULT now()
```

---

## 📱 App Pages / Routes

```
/ (Home)
├── ยินดีต้อนรับ + ชื่อ Line
├── ชั่วโมงคงเหลือ (quick view)
├── การจองถัดไป
└── Points & Tier badge

/booking
├── เลือก service type (Free Trial / Private / Simulator ฯลฯ)
│   └── Free Trial: เช็คว่าเคยใช้แล้วหรือยัง (ถ้าเคยแล้ว → disabled)
├── เลือกโปรที่ต้องการ (filter ตาม certified level ที่รองรับ service นั้น)
├── เลือกวันที่ (calendar)
├── เลือก time slot ที่ว่าง (filter เฉพาะ slot ที่ course/service ตรงกัน)
│   └── ถ้า service ต้องการ simulator → แสดง simulator room ที่ผูกอยู่
└── ยืนยันการจอง

/courses
├── แสดง package ที่มีอยู่
├── ชั่วโมงคงเหลือ + progress bar
├── วันหมดอายุ
└── Upsell prompt (ถ้าเหลือ < 20%)

/progress  (Swing Progress Tracker — รวมหน้าเดียว)
├── รายการ session ย้อนหลัง (การ์ด: วันที่, โปร, stats snapshot)
└── กด session → ดูรายละเอียด
    ├── Text Summary (Technical / Tactical / Mental) — อ่านอย่างเดียวสำหรับลูกค้า
    ├── Stats: Handicap, Driving, Putting, GIR
    ├── Stats Chart: Handicap trend, Distance trend
    ├── Media Gallery: รูป + VDO swing ที่โปรอัพโหลด
    ├── Drills ที่ได้รับ
    └── Comment Thread
        ├── ลูกค้า: พิมพ์ข้อความ, แนบรูป/VDO, reply ได้
        ├── โปร/admin: ตอบ comment, แนบสื่อ, ลบ comment ได้
        └── แสดงเป็น thread (2 ระดับ)

/loyalty
├── Points balance
├── Tier status + progress to next tier
├── Achievements / Badges
└── Redemption options

/referral
├── Referral code + share button
└── รายชื่อคนที่ชวนมาได้

/admin (coach only)
├── Today's schedule
├── Manage time slots
│   ├── สร้าง slot ทั่วไป (ทุกคนจองได้)
│   ├── สร้าง slot เฉพาะลูกค้า (target_course_ids)
│   └── ผูก service type + simulator room
├── Coach Management
│   ├── เพิ่ม/ลบ/แก้ไขโปร
│   └── กำหนด certified level (junior/certified/pga/head_coach)
├── Asset Management
│   ├── จัดการห้อง simulator (เพิ่ม/ปิด/ย้าย branch)
│   └── ดู availability ห้องแต่ละวัน
├── Service Type Management
│   ├── สร้าง/แก้ service type
│   └── กำหนดว่า service ไหนต้อง simulator / min coach level
├── Log lesson after session
├── Revenue summary
└── Expiring courses alert
```

---

## 🚀 Deployment Architecture

```
User (Line App)
    ↓
Line LIFF (opens Mini App)
    ↓
Vercel (React Frontend)
    ↓
Railway/Render (Express API)
    ↓
Supabase (PostgreSQL + Storage)
```

---

## 📅 Development Timeline

| Phase | Duration | Features |
|-------|----------|---------|
| Phase 1 | Week 1-2 | Coach/Asset/Service setup · DB schema ใหม่ · Conditional Booking · Free Trial logic |
| Phase 2 | Week 3-4 | Course Hours · Lesson History · Swing Progress Tracker |
| Phase 3 | Week 5-6 | Loyalty Points · Tier · Achievement · Referral · Upsell |
| Phase 4 | Week 7-8 | Video Library · Drill Library · Admin Dashboard (Coach/Asset/Service mgmt) |
| Testing | Week 9 | UAT, Bug fixes, Deploy to production |

---

## 🔑 Environment Variables ที่ต้องเตรียม

```env
# Line
LIFF_ID=your_liff_id
LINE_CHANNEL_ACCESS_TOKEN=your_token
LINE_CHANNEL_SECRET=your_secret

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# App
ADMIN_LINE_UIDS=uid1,uid2  # Line UIDs ของโค้ชที่เป็น admin
```
