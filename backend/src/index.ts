import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth'
import bookingRoutes from './routes/bookings'
import courseRoutes from './routes/courses'
import lessonRoutes from './routes/lessons'
import loyaltyRoutes from './routes/loyalty'
import progressRoutes from './routes/progress'
import adminRoutes from './routes/admin'
import referralRoutes from './routes/referrals'
import drillRoutes from './routes/drills'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'https://access.line.me'],
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'underpar-club-api' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/lessons', lessonRoutes)
app.use('/api/loyalty', loyaltyRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/referrals', referralRoutes)
app.use('/api/drills', drillRoutes)

app.listen(PORT, () => {
  console.log(`🏌️ Underpar Club API running on port ${PORT}`)
})

export default app
