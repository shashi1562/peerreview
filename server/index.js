import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import githubRoutes from './routes/github.js'
import reviewRoutes from './routes/review.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json({ limit: '2mb' }))

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}))

app.use('/api/auth', authRoutes)
app.use('/api/github', githubRoutes)
app.use('/api/review', reviewRoutes)

app.listen(PORT, () => {
  console.log(`PeerReview server → http://localhost:${PORT}`)
})
