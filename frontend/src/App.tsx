import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initLiff, getLineProfile, getLineUid } from './lib/liff'
import { login } from './lib/api'

import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import CoursesPage from './pages/CoursesPage'
import LessonsPage from './pages/LessonsPage'
import LessonDetailPage from './pages/LessonDetailPage'
import ProgressPage from './pages/ProgressPage'
import LoyaltyPage from './pages/LoyaltyPage'
import ReferralPage from './pages/ReferralPage'
import AdminPage from './pages/AdminPage'

const queryClient = new QueryClient()

function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [isCoach, setIsCoach] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        await initLiff()
        const profile = await getLineProfile()
        const uid = getLineUid()
        const urlParams = new URLSearchParams(window.location.search)
        const referralCode = urlParams.get('ref') || undefined

        const { user } = await login(uid, profile.displayName, profile.pictureUrl, referralCode)
        setIsCoach(user.is_coach)
        setReady(true)
      } catch (e) {
        setError('ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่')
        console.error(e)
      }
    }
    init()
  }, [])

  if (error) return (
    <div className="flex h-screen items-center justify-center p-6">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">ลองใหม่</button>
      </div>
    </div>
  )

  if (!ready) return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    </div>
  )

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/lessons/:id" element={<LessonDetailPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/loyalty" element={<LoyaltyPage />} />
            <Route path="/referral" element={<ReferralPage />} />
            {isCoach && <Route path="/admin" element={<AdminPage />} />}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <BottomNav isCoach={isCoach} />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
