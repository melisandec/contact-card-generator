# CardCrafter 🎨

> Create stunning contact cards in minutes

A full-stack contact card generator web application with a drag-and-drop editor, 30+ templates, and multiple export formats.

## ✨ Features

- **Drag & Drop Editor** — Intuitive canvas editor with layers, shapes, text, and images
- **30+ Templates** — Professional templates across 6 categories (Corporate, Creative, Minimal, Tech, Social, Event)
- **Export Formats** — PNG, JPG, PDF with high-resolution support
- **QR Code Generator** — Add custom QR codes to any card
- **Authentication** — Google, GitHub, and Email sign-in via NextAuth.js
- **Cloud Storage** — Save and manage designs with PostgreSQL + Prisma
- **Rate Limiting** — Upstash Redis-powered API protection
- **Responsive** — Fully responsive editor layout

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Animations | Framer Motion |
| Database | PostgreSQL + Prisma |
| Auth | NextAuth.js |
| Forms | React Hook Form + Zod |
| Export | html2canvas + jsPDF |
| QR Codes | node-qrcode |
| Rate Limiting | Upstash Redis |
| Email | Resend |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/cardcrafter.git
cd cardcrafter

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Set up the database
npm run db:push

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for JWT signing |
| `NEXTAUTH_URL` | Your app URL (e.g., `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth App ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth App Secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth App ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Secret |
| `RESEND_API_KEY` | Resend email API key |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL (optional) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token (optional) |
| `UNSPLASH_ACCESS_KEY` | Unsplash API key (optional, falls back to picsum) |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth.js
│   │   ├── designs/       # CRUD for designs
│   │   ├── templates/     # Template catalog
│   │   ├── qrcode/        # QR code generation
│   │   └── unsplash/      # Unsplash proxy
│   ├── editor/            # Editor page
│   └── page.tsx           # Landing page
├── components/
│   ├── editor/            # Editor UI components
│   └── ui/                # Reusable UI primitives
├── data/                  # Static data (templates, colors)
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities & server-side helpers
├── store/                 # Zustand state stores
└── types/                 # TypeScript type definitions
```

## 🗄 Database Schema

```
User → Design (one-to-many)
User → Asset (one-to-many)
User → Settings (one-to-one)
```

Run `npm run db:studio` to open Prisma Studio for database management.

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set environment variables in the Vercel dashboard. The `vercel.json` configuration sets appropriate function timeouts and a health check cron.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## 📄 License

MIT
