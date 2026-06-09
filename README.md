# PeerReview

**🔴 [Live → peerreview-eight.vercel.app](https://peerreview-eight.vercel.app)**

AI-powered code review for your GitHub branches. Upload a README.md with your review instructions — PeerReview fetches the diff, runs it through Gemini Flash, and streams the review back live.

---

## What it does

1. Sign in with GitHub
2. Select a repo and branch
3. Upload a README.md with your review checklist (code quality, security, architecture — your rules)
4. Hit **Start Review** — the AI reads your diff and streams feedback line by line
5. Reviews are saved to your dashboard automatically

---

## Features

- **Streaming reviews** — feedback appears live, token by token
- **Reusable instructions** — write your review rules once, reuse across every branch
- **3 built-in templates** — Code Quality, Security Audit, Architecture Review (with 🔴 / 🟡 / 🔵 severity system)
- **Review history** — all past reviews saved and searchable from the dashboard
- **GitHub OAuth** — read-only access, never writes or modifies your code
- **Free** — powered by Gemini Flash free tier

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 (Composition API, `<script setup>`) |
| State | Pinia |
| Build | Vite 5 + TailwindCSS |
| Backend | Node.js + Express |
| AI | Google Gemini Flash (`gemini-2.0-flash`) |
| Auth | GitHub OAuth 2.0 (server-side, httpOnly session) |
| Database | PostgreSQL via Prisma (Supabase) |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## Local Development

### Prerequisites
- Node.js 18+
- A Supabase project (free tier)
- GitHub OAuth App
- Google Gemini API key (free at aistudio.google.com)

### Install

```bash
# Frontend
npm install

# Backend
cd server && npm install
```

### Configure

Create `server/.env`:

```env
DATABASE_URL=postgresql://...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GEMINI_API_KEY=...
SESSION_SECRET=   # openssl rand -hex 32
FRONTEND_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

### Push DB schema

```bash
cd server && npx prisma db push
```

### Run

```bash
# Terminal 1 — frontend (port 5173)
npm run dev

# Terminal 2 — backend (port 3001)
cd server && npm run dev
```

Open **http://localhost:5173**

---

## Project Structure

```
├── src/
│   ├── pages/
│   │   ├── LandingPage.vue      # Hero, use cases, permissions card
│   │   ├── ReviewPage.vue       # Repo selector, branch input, README uploader, streaming output
│   │   ├── DashboardPage.vue    # Review history
│   │   └── AuthCallback.vue     # GitHub OAuth callback
│   ├── components/
│   │   ├── NavBar.vue           # Sticky nav with user avatar
│   │   └── ReadmeUploader.vue   # Drag-and-drop + paste
│   └── stores/
│       ├── auth.js              # Auth state
│       └── review.js            # Streaming via fetch + ReadableStream
└── server/
    ├── index.js                 # Express server
    ├── routes/
    │   ├── auth.js              # GitHub OAuth flow
    │   ├── github.js            # Repos + branches API
    │   └── review.js            # Gemini streaming + review history
    └── prisma/
        └── schema.prisma        # User + Review models
```

---

## GitHub OAuth Permissions

| Access | Type |
|--------|------|
| Read repos list | ✅ Read only |
| Read branch names | ✅ Read only |
| Read code diffs | ✅ Read only |
| Write / push / delete code | ❌ Never |
| Create or close issues/PRs | ❌ Never |
| Access secrets or Actions | ❌ Never |

---

Built by [Shashi Lokini](https://github.com/shashilokini)
