import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const MAX_PATCH_LINES = 300
const GEMINI_MODEL = 'gemini-2.0-flash'

function requireAuth(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'Not authenticated' })
  next()
}

const ghHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'User-Agent': 'PeerReview',
  Accept: 'application/vnd.github+json',
})

function formatDiff(files) {
  return files.map(f => {
    const patch = f.patch
      ? f.patch.split('\n').slice(0, MAX_PATCH_LINES).join('\n')
      : '(binary file or no textual diff)'
    return `### ${f.filename} (${f.status})\n\`\`\`diff\n${patch}\n\`\`\``
  }).join('\n\n')
}

async function fetchDiff(owner, repo, branch, token) {
  for (const base of ['main', 'master']) {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/compare/${base}...${branch}`,
      { headers: ghHeaders(token) }
    )
    if (res.ok) {
      const data = await res.json()
      if (data.files?.length) return data.files
    }
  }
  return null
}

router.post('/stream', requireAuth, async (req, res) => {
  const { owner, repo, branch, readmeContent } = req.body
  if (!owner || !repo || !branch || !readmeContent?.trim()) {
    return res.status(400).json({ error: 'owner, repo, branch, and readmeContent are required' })
  }

  try {
    const files = await fetchDiff(owner, repo, branch, req.session.accessToken)
    if (!files) {
      return res.status(400).json({
        error: 'No diff found. The branch may be up to date with main/master, or the base branch could not be determined.',
      })
    }

    const formattedDiff = `## Changed Files\n\n${formatDiff(files)}`

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    let fullReview = ''

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: readmeContent.trim(),
    })

    const result = await model.generateContentStream(
      `Review the following branch diff:\n\n${formattedDiff}`
    )

    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        fullReview += text
        res.write(`data: ${JSON.stringify({ text })}\n\n`)
      }
    }

    res.write('data: [DONE]\n\n')

    await prisma.review.create({
      data: {
        userId: req.session.userId,
        repoName: `${owner}/${repo}`,
        branchName: branch,
        readmeContent: readmeContent.trim(),
        reviewOutput: fullReview,
      },
    })

    res.end()
  } catch (e) {
    console.error('Review error:', e)
    if (!res.headersSent) {
      res.status(500).json({ error: e.message || 'Review failed' })
    } else {
      res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`)
      res.end()
    }
  }
})

router.get('/', requireAuth, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.session.userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, repoName: true, branchName: true, reviewOutput: true, createdAt: true },
    })
    res.json(reviews)
  } catch {
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const review = await prisma.review.findFirst({
      where: { id: req.params.id, userId: req.session.userId },
    })
    if (!review) return res.status(404).json({ error: 'Not found' })
    res.json(review)
  } catch {
    res.status(500).json({ error: 'Failed to fetch review' })
  }
})

export default router
