import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  FRONTEND_URL = 'http://localhost:5173',
} = process.env

router.get('/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: 'read:user repo',
    redirect_uri: `${process.env.SERVER_URL}/api/auth/github/callback`,
  })
  res.redirect(`https://github.com/login/oauth/authorize?${params}`)
})

router.get('/github/callback', async (req, res) => {
  const { code } = req.query
  if (!code) return res.redirect(`${FRONTEND_URL}?error=no_code`)

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code }),
    })
    const { access_token: accessToken } = await tokenRes.json()
    if (!accessToken) return res.redirect(`${FRONTEND_URL}?error=token_failed`)

    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'PeerReview' },
    })
    const ghUser = await userRes.json()

    const user = await prisma.user.upsert({
      where: { githubId: String(ghUser.id) },
      update: { accessToken, username: ghUser.login, avatarUrl: ghUser.avatar_url },
      create: { githubId: String(ghUser.id), username: ghUser.login, avatarUrl: ghUser.avatar_url, accessToken },
    })

    req.session.userId = user.id
    req.session.accessToken = accessToken
    res.redirect(`${FRONTEND_URL}/auth/callback`)
  } catch (e) {
    console.error('OAuth error:', e)
    res.redirect(`${FRONTEND_URL}?error=auth_failed`)
  }
})

router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' })
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, username: true, avatarUrl: true },
    })
    if (!user) return res.status(401).json({ error: 'User not found' })
    res.json(user)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }))
})

export default router
