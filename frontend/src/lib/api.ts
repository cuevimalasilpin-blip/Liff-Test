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

// ===== LESSONS — MEDIA & COMMENTS =====
export const getLessonMediaUploadUrl = (lessonId: string, fileName: string, contentType: string) =>
  api.post(`/api/lessons/${lessonId}/media/upload-url`, { fileName, contentType }).then(r => r.data)

export const addLessonMediaUrl = (lessonId: string, publicUrl: string) =>
  api.patch(`/api/lessons/${lessonId}/media`, { publicUrl }).then(r => r.data)

export const getLessonComments = (lessonId: string) =>
  api.get(`/api/lessons/${lessonId}/comments`).then(r => r.data)

export const postLessonComment = (lessonId: string, message: string, mediaUrl?: string) =>
  api.post(`/api/lessons/${lessonId}/comments`, { message, mediaUrl }).then(r => r.data)

export const updateLesson = (id: string, data: Record<string, unknown>) =>
  api.patch(`/api/lessons/${id}`, data).then(r => r.data)

// ===== DRILLS =====
export const getDrills = (category?: string, search?: string) =>
  api.get('/api/drills', { params: { category, search } }).then(r => r.data)

export const getDrillDetail = (id: string) =>
  api.get(`/api/drills/${id}`).then(r => r.data)

export const createDrill = (data: Record<string, unknown>) =>
  api.post('/api/drills', data).then(r => r.data)

export const updateDrill = (id: string, data: Record<string, unknown>) =>
  api.patch(`/api/drills/${id}`, data).then(r => r.data)

export const deleteDrill = (id: string) =>
  api.delete(`/api/drills/${id}`).then(r => r.data)

export const getDrillUploadUrl = (drillId: string, fileName: string, contentType: string) =>
  api.post(`/api/drills/${drillId}/upload-url`, { fileName, contentType }).then(r => r.data)

// ===== ADMIN =====
export const getAdminDashboard = () =>
  api.get('/api/admin/dashboard').then(r => r.data)

export const getAllStudents = (search?: string, branch?: string) =>
  api.get('/api/admin/students', { params: { search, branch } }).then(r => r.data)

export const getRevenue = () =>
  api.get('/api/admin/revenue').then(r => r.data)

// ===== ADMIN — SLOTS =====
export const getAdminSlots = (date?: string, branch?: string) =>
  api.get('/api/admin/slots', { params: { date, branch } }).then(r => r.data)

export const createAdminSlot = (data: { branch: string; startTime: string; endTime: string; room?: string; notes?: string }) =>
  api.post('/api/admin/slots', data).then(r => r.data)

export const updateAdminSlot = (id: string, data: Record<string, unknown>) =>
  api.patch(`/api/admin/slots/${id}`, data).then(r => r.data)

export const deleteAdminSlot = (id: string) =>
  api.delete(`/api/admin/slots/${id}`).then(r => r.data)

export const createBulkSlots = (branch: string, slots: { startTime: string; endTime: string }[], room?: string) =>
  api.post('/api/admin/slots/bulk', { branch, slots, room }).then(r => r.data)

export default api
