import { Router } from 'express'

const router = Router()

function requireAuth(req, res, next) {
  if (!req.session?.accessToken) return res.status(401).json({ error: 'Not authenticated' })
  next()
}

const ghHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'User-Agent': 'PeerReview',
  Accept: 'application/vnd.github+json',
})

router.get('/repos', requireAuth, async (req, res) => {
  try {
    const response = await fetch(
      'https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator',
      { headers: ghHeaders(req.session.accessToken) }
    )
    if (!response.ok) return res.status(502).json({ error: 'GitHub API error' })
    const repos = await response.json()
    res.json(repos.map(r => ({ id: r.id, full_name: r.full_name, private: r.private })))
  } catch {
    res.status(500).json({ error: 'Failed to fetch repos' })
  }
})

router.get('/branches', requireAuth, async (req, res) => {
  const { owner, repo } = req.query
  if (!owner || !repo) return res.status(400).json({ error: 'owner and repo required' })
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
      { headers: ghHeaders(req.session.accessToken) }
    )
    if (!response.ok) return res.status(502).json({ error: 'GitHub API error' })
    const branches = await response.json()
    res.json(branches.map(b => b.name))
  } catch {
    res.status(500).json({ error: 'Failed to fetch branches' })
  }
})

export default router
