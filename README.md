# Root Game Tracker

A mobile-first web application for tracking Root board game matches within leagues. Track games, manage leagues, and analyze your woodland battles!

## Features

- 🎮 **Game Tracking**: Record games manually or via screenshot OCR
- 👥 **League Management**: Create password-protected leagues with friends
- 📊 **Statistics**: View win rates, faction picks, and performance analytics
- 📱 **Mobile-First**: Optimized for on-the-go game logging
- 🔐 **Secure**: User authentication with Google OAuth and email/password

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes (serverless)
- **Database**: Supabase PostgreSQL (shared instance)
- **ORM**: Drizzle ORM
- **Auth**: NextAuth.js v5
- **Storage**: Supabase Storage (for game screenshots)
- **UI**: shadcn/ui components
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (can be shared with other projects)
- Google OAuth credentials (optional, for Google sign-in)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd root-registry
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit \`.env.local\` with your actual values:
\`\`\`env
# Supabase (shared with other projects)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
\`\`\`

4. Set up the database:

The schema uses \`root_\` prefixed tables to coexist with other projects:
- \`root_users\`
- \`root_leagues\`
- \`root_league_memberships\`
- \`root_games\`
- \`root_game_players\`

Push the schema to Supabase:
\`\`\`bash
npm run db:push
\`\`\`

5. Create a Supabase Storage bucket:

In your Supabase dashboard:
- Go to Storage
- Create a new bucket named \`root-game-screenshots\`
- Make it public
- Set up RLS policies as needed

6. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

### Tables (all prefixed with \`root_\`)

- **root_users**: User accounts and profiles
- **root_leagues**: Password-protected game leagues
- **root_league_memberships**: User-league relationships with admin flags
- **root_games**: Recorded game sessions
- **root_game_players**: Individual player results per game

### Storage

- **root-game-screenshots**: Bucket for uploaded score screen images

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint
- \`npm run format\` - Format code with Prettier
- \`npm run db:push\` - Push schema changes to database
- \`npm run db:studio\` - Open Drizzle Studio

## Project Structure

\`\`\`
root-registry/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected pages (dashboard, leagues)
│   └── api/               # API routes
├── components/
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── auth/             # NextAuth configuration
│   ├── constants/        # Factions and maps data
│   ├── db/               # Database schema and queries
│   ├── supabase/         # Supabase client and storage utils
│   └── validations/      # Zod schemas
├── DESIGN_GUIDE.md       # Design system documentation
└── STYLE.md              # Code style guide
\`\`\`

## Development Workflow

1. Create a feature branch
2. Make changes
3. Run \`npm run build\` to ensure TypeScript compiles
4. Run \`npm run format\` to format code
5. Commit with descriptive message
6. Push and create PR

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy!

Vercel will automatically:
- Build your Next.js app
- Set up preview deployments for PRs
- Handle serverless functions

## Contributing

See [STYLE.md](./STYLE.md) for code style guidelines and [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) for design system documentation.

## License

ISC

## Acknowledgments

- Root: A Game of Woodland Might and Right by Leder Games
- Built with Claude Code
