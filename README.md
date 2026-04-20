<div align="center">

# Byteinit

### A full-stack developer community platform for sharing knowledge, resources, and articles

[![Live Demo](https://img.shields.io/badge/Live%20Demo-byteinit.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://byteinit.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

</div>

---

## Overview

**Byteinit** is a production-ready, full-stack developer community platform — think a blend of DEV.to and Hacker News — where developers can publish blog posts, discover curated resources, follow other developers, and get AI-powered profile generation. Built with a modern, type-safe stack and deployed on Vercel.

> **Live at:** [https://byteinit.vercel.app](https://byteinit.vercel.app)

---

## Features

### Content & Blogging
- Rich-text blog editor powered by **Tiptap** with support for tables, code blocks, images, task lists, and typography extensions
- Blog discovery feeds: **Latest**, **Popular**, **Trending**, **Featured**, **Best**, and **Following**
- Full-text search across posts and resources
- Tag and topic-based browsing
- RSS feed generation for blog content
- Reading history and saved post bookmarks

### Developer Resources Hub
- Curated resource library with categories, bookmarks, and trending sections
- Submit, save, and discover developer tools and links
- Category browsing with custom slugs

### AI Integration
- **AI-powered portfolio generation** using the Anthropic SDK — automatically generates a developer profile from GitHub activity and user data
- OpenAI and Groq SDK integrations for content assistance

### Authentication & Profiles
- Multi-provider auth via **NextAuth v5** (OAuth + email/password with bcrypt)
- Public developer profiles at `/u/[username]`
- Complete profile management dashboard
- Email verification and password reset flows via Nodemailer

### Real-Time & Social
- Real-time notifications with **Pusher**
- Comment threads with emoji reactions on blog posts
- Follow/unfollow developers and personalised following feed
- Activity feed and engagement analytics

### Performance & Developer Experience
- **Next.js 15 App Router** with nested layouts and route groups
- **Prisma ORM** with schema-first database modelling (MongoDB adapter)
- Rate limiting via **Upstash Redis**
- Smooth animations with **GSAP**, **Framer Motion**, and **Locomotive Scroll**
- Image uploads via **ImageKit**
- Auto-generated sitemaps and SEO-optimised metadata
- Cron jobs for automated featured-post updates
- **Recharts** dashboard analytics

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | TypeScript (99%+ codebase) |
| **Styling** | Tailwind CSS + shadcn/ui (Radix UI) |
| **Database** | MongoDB + Prisma ORM |
| **Auth** | NextAuth v5 (Prisma adapter) |
| **AI** | Anthropic SDK, OpenAI SDK, Groq SDK |
| **Editor** | Tiptap (rich-text) |
| **Real-time** | Pusher |
| **Cache/Rate-limit** | Upstash Redis |
| **Media** | ImageKit |
| **Animations** | GSAP, Framer Motion, Locomotive Scroll |
| **Email** | Nodemailer |
| **Deployment** | Vercel (50+ production deployments) |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, register, password reset, verify
│   ├── (blog)/blog/      # Blog feeds, post detail, new post editor
│   ├── (dashboard)/      # User dashboard (blog, resources, profile)
│   ├── (main)/           # Landing page, about, contact, help
│   ├── (profile)/        # Public developer profiles /u/[username]
│   ├── (resources)/      # Resource hub with categories & bookmarks
│   └── api/              # REST API routes (auth, posts, comments, notifications, AI, etc.)
├── components/           # Reusable UI components
├── lib/                  # Utility functions, db helpers, AI clients
├── hooks/                # Custom React hooks
├── contexts/             # React context providers
└── types/                # Shared TypeScript types
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (local or Atlas)
- Accounts/keys for: Vercel, Pusher, Upstash, ImageKit, Anthropic (optional)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ashish-makes/byteinit.git
cd byteinit

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your credentials (see Environment Variables below)

# 4. Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# 5. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Generate Prisma client & build for production |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest test suite |
| `npm run update-featured` | Manually trigger featured post update script |

---

## Environment Variables

```env
# Database
DATABASE_URL=mongodb+srv://...

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GROQ_API_KEY=

# Real-time
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
NEXT_PUBLIC_PUSHER_KEY=

# Cache
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Media
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

# Email
EMAIL_SERVER_HOST=
EMAIL_SERVER_PORT=
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
EMAIL_FROM=
```

---

## Architecture Highlights

- **Route Groups**: Clean separation of concerns using Next.js route groups — `(auth)`, `(blog)`, `(dashboard)`, `(resources)`, `(profile)` — each with independent layouts.
- **Server Actions**: Leverages Next.js server actions for blog mutations and form handling without extra API boilerplate.
- **Type-safe API**: All API routes and database queries are fully typed with TypeScript and Prisma's generated client.
- **AI Profile Generation**: The `/api/generate-portfolio/[username]` endpoint uses the Anthropic SDK to auto-generate developer portfolio summaries.
- **Rate Limiting**: API routes protected by Upstash Redis-backed rate limiting to prevent abuse.
- **Scheduled Jobs**: Cron endpoint at `/api/cron/update-featured` keeps featured posts fresh automatically.

---

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Collaborative editing
- [ ] Expanded AI writing assistant
- [ ] GitHub integration for automatic project showcasing
- [ ] Monetisation for creators

---

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## Author

**Ashish** — [@ashish-makes](https://github.com/ashish-makes)

---

<div align="center">

**If you find this project useful, please consider giving it a ⭐**

[![GitHub stars](https://img.shields.io/github/stars/ashish-makes/byteinit?style=social)](https://github.com/ashish-makes/byteinit/stargazers)

</div>
