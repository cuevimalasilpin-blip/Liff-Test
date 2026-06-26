import axios from 'axios'
import { getLineUid } from './liff'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Attach Line UID to every request
api.interceptors.request.use((config) => {
  const uid = getLineUid()
  if (uid) config.headers['x-line-uid'] = uid
  return config
})

// ===== AUTH =====
export const login = (lineUid: string, displayName: string, pictureUrl?: string, referralCode?: string) =>
  api.post('/api/auth/login', { lineUid, displayName, pictureUrl, referralCode }).then(r => r.data)

export const getMe = () =>
  api.get('/api/auth/me').then(r => r.data)

// ===== BOOKINGS =====
export const getAvailableSlots = (date: string, branch?: string) =>
  api.get('/api/bookings/slots', { params: { date, branch } }).then(r => r.data)

export const getMyBookings = () =>
  api.get('/api/bookings/mine').then(r => r.data)

export const createBooking = (slotId: string, courseId: string, notes?: string) =>
  api.post('/api/bookings', { slotId, courseId, notes }).then(r => r.data)

export const cancelBooking = (id: string) =>
  api.patch(`/api/bookings/${id}/cancel`).then(r => r.data)

export const createSlot = (branch: string, startTime: string, endTime: string) =>
  api.post('/api/bookings/slots', { branch, startTime, endTime }).then(r => r.data)

// ===== COURSES =====
export const getMyCourses = () =>
  api.get('/api/courses/mine').then(r => r.data)

export const addCourse = (data: {
  userId: string; packageName: string; totalHours: number; expiresAt: string; price?: number; notes?: string
}) => api.post('/api/courses', data).then(r => r.data)

// ===== LESSONS =====
export const getMyLessons = (page = 1) =>
  api.get('/api/lessons/mine', { params: { page } }).then(r => r.data)

export const getLessonDetail = (id: string) =>
  api.get(`/api/lessons/${id}`).then(r => r.data)

export const createLesson = (data: Record<string, unknown>) =>
  api.post('/api/lessons', data).then(r => r.data)

// ===== PROGRESS =====
export const getMyProgress = (months = 6) =>
  api.get('/api/progress/mine', { params: { months } }).then(r => r.data)

export const getLatestStats = () =>
  api.get('/api/progress/latest').then(r => r.data)

// ===== LOYALTY =====
export const getLoyaltySummary = () =>
  api.get('/api/loyalty/summary').then(r => r.data)

export const getAllAchievements = () =>
  api.get('/api/loyalty/achievements/all').then(r => r.data)

// ===== REFERRALS =====
export const getMyReferrals = () =>
  api.get('/api/referrals/mine').then(r => r.data)

// ===== ADMIN =====
export const getAdminDashboard = () =>
  api.get('/api/admin/dashboard').then(r => r.data)

export const getAllStudents = (search?: string, branch?: string) =>
  api.get('/api/admin/students', { params: { search, branch } }).then(r => r.data)

export const getRevenue = () =>
  api.get('/api/admin/revenue').then(r => r.data)

export default api
