# 🏌️ Underpar Club — Line Mini App

ระบบ Line Mini App สำหรับ Underpar Club รองรับ Booking, Course Hours, Lesson History, Swing Progress, Loyalty Points, Tier, Achievements, และ Referral Program

---

## 🚀 วิธี Setup (ทำตามลำดับ)

### ขั้นที่ 1 — สร้าง Supabase Project
1. ไปที่ https://supabase.com → Create new project
2. จด **Project URL** และ **anon key** และ **service_role key**
3. ไปที่ SQL Editor → รัน `backend/supabase/migrations/001_initial_schema.sql`
4. รัน `backend/supabase/migrations/002_functions.sql`

### ขั้นที่ 2 — ตั้งค่า Line Developers Console
1. ไปที่ https://developers.line.biz
2. เลือก Provider และ Channel ที่มีอยู่
3. สร้าง **LIFF app** ใหม่:
   - Size: Full
   - Endpoint URL: `https://your-frontend.vercel.app` (ใส่ชั่วคราวก่อน)
4. จด **LIFF ID** (รูปแบบ `1234567890-xxxxxxxx`)
5. จด **Channel Access Token** จาก Messaging API tab
6. จด **Channel Secret**

### ขั้นที่ 3 — Deploy Backend (Railway)
1. ไปที่ https://railway.app → New Project → Deploy from GitHub
2. เลือก folder `backend/`
3. ตั้ง Environment Variables:
```
LINE_CHANNEL_ACCESS_TOKEN=xxx
LINE_CHANNEL_SECRET=xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
ADMIN_LINE_UIDS=Uxxxxxxxxx  (Line UID ของโค้ช ดูได้จาก Line Developers)
FRONTEND_URL=https://your-frontend.vercel.app
PORT=3000
```
4. จด Railway URL เช่น `https://underpar-backend.railway.app`

### ขั้นที่ 4 — Deploy Frontend (Vercel)
1. ไปที่ https://vercel.com → New Project → เลือก folder `frontend/`
2. ตั้ง Environment Variables:
```
VITE_LIFF_ID=1234567890-xxxxxxxx
VITE_API_URL=https://underpar-backend.railway.app
VITE_APP_URL=https://your-frontend.vercel.app
```
3. Deploy → จด Vercel URL

### ขั้นที่ 5 — อัพเดท LIFF Endpoint
1. กลับไป Line Developers Console
2. แก้ไข LIFF Endpoint URL เป็น Vercel URL ที่ได้
3. Save

### ขั้นที่ 6 — ตั้งค่า Coach Account
1. เปิด Supabase → Table Editor → users
2. หา row ของตัวเอง (ดู line_uid จาก Line Developers → Users)
3. แก้ `is_coach` เป็น `true`

---

## 📁 โครงสร้าง Project

```
underpar-club-app/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Entry point
│   │   ├── lib/supabase.ts   # Supabase client
│   │   ├── middleware/auth.ts # Line UID auth
│   │   ├── routes/
│   │   │   ├── auth.ts       # Login / profile
│   │   │   ├── bookings.ts   # Booking + time slots
│   │   │   ├── courses.ts    # Course packages
│   │   │   ├── lessons.ts    # Lesson records
│   │   │   ├── loyalty.ts    # Points + achievements
│   │   │   ├── progress.ts   # Swing stats charts
│   │   │   ├── referrals.ts  # Referral program
│   │   │   └── admin.ts      # Dashboard
│   │   └── types/index.ts
│   ├── supabase/migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_functions.sql
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx           # Router + LIFF init
    │   ├── index.css         # Design system (Underpar brand)
    │   ├── lib/
    │   │   ├── liff.ts       # Line LIFF helpers
    │   │   └── api.ts        # API calls
    │   ├── components/
    │   │   └── BottomNav.tsx
    │   └── pages/
    │       ├── HomePage.tsx
    │       ├── BookingPage.tsx
    │       ├── CoursesPage.tsx
    │       ├── LessonsPage.tsx
    │       ├── LessonDetailPage.tsx
    │       ├── ProgressPage.tsx
    │       ├── LoyaltyPage.tsx
    │       ├── ReferralPage.tsx
    │       └── AdminPage.tsx
    └── package.json
```

---

## 🎨 Design System

ใช้ Design ตาม Underpar Club brand:
- **Primary**: `#ED1C24` (Red)
- **Dark**: `#141414`
- **Background**: `#f7f6f4`
- **Font**: Archivo (headings) + IBM Plex Sans Thai (body)
- **Style**: Uppercase labels · Pill buttons · Rounded cards · Dark hero sections

---

## 🛠️ วิธีรัน Local

```bash
# Backend
cd backend
npm install
cp .env.example .env  # ใส่ค่าจริง
npm run dev

# Frontend (terminal ใหม่)
cd frontend
npm install
cp .env.example .env  # ใส่ค่าจริง
npm run dev
```

---

## 📱 Features ทั้งหมด

| Feature | หน้า |
|---------|------|
| Home Dashboard | `/` |
| Booking (จองเรียน) | `/booking` |
| Course Hours | `/courses` |
| Lesson History | `/lessons` + `/lessons/:id` |
| Swing Progress Charts | `/progress` |
| Loyalty Points + Tier + Achievements | `/loyalty` |
| Referral Program | `/referral` |
| Admin Dashboard (coach only) | `/admin` |

---

## ❓ ติดปัญหา

ติดต่อโค้ช Dev หรือเปิด issue ใน project ได้เลยครับ
