# AI Art Arena

A weekly AI art voting contest platform where users can vote for their favorite AI-generated artworks. Built with Next.js 14, TypeScript, and Supabase.

## Features

- **Weekly Art Contests** - New AI art competitions every week
- **User Authentication** - Secure voting with Supabase Auth
- **Daily Voting** - Vote once per artwork per day during active contests
- **Contest Archive** - Browse past contests and their winners
- **Blog System** - Updates, announcements, and art-related content
- **Admin Dashboard** - Manage contests, artworks, and blog posts
- **Real-time Updates** - Live vote counts and contest status
- **Privacy-First** - IP addresses are hashed for analytics

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS
- **Rich Text Editor:** TipTap
- **Validation:** Zod
- **Rate Limiting:** LRU Cache (in-memory)

## Architecture Highlights

- **Feature Flags** - Toggle major features via environment variables
- **Database-Driven Configuration** - Settings stored in database for runtime changes
- **Row-Level Security** - Supabase RLS policies protect data
- **Rate Limiting** - Prevent abuse with configurable rate limits
- **Input Validation** - Zod schemas validate all API inputs
- **Security Headers** - CSP, X-Frame-Options, and more via middleware
- **Denormalized Vote Counts** - Optimized for read performance
- **IP Hashing** - Privacy-preserving analytics

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- Vercel account (optional, for deployment)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/olliedoesis/ai-art-arena.git
   cd ai-art-arena
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.local.example` to `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in your Supabase credentials and other required values:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Security
   CRON_SECRET=your_secure_random_cron_secret
   IP_SALT=your_random_salt_for_ip_hashing

   # Site
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   Generate secure secrets:

   ```bash
   # Cron secret
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

   # IP salt
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Run database migrations**

   Execute the SQL migrations in your Supabase SQL Editor in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_fix_can_vote_function.sql`
   - `supabase/migrations/003_add_settings_table.sql`
   - `supabase/migrations/004_add_position_and_indexes.sql`

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

## Configuration

### Feature Flags

Control major features via environment variables (set to `'false'` to disable):

```env
NEXT_PUBLIC_FEATURE_VOTING=true
NEXT_PUBLIC_FEATURE_ARCHIVE=true
NEXT_PUBLIC_FEATURE_ANALYTICS=false
NEXT_PUBLIC_FEATURE_BLOG=true
NEXT_PUBLIC_FEATURE_REALTIME=false
NEXT_PUBLIC_FEATURE_AUTH=true
```

### Contest Configuration

Contest parameters are defined in `src/lib/constants.ts`:

```typescript
export const CONTEST_CONFIG = {
  artworks_per_contest: 6,
  duration_days: 7,
  vote_cooldown_hours: 24,
  min_artworks_to_start: 6,
  max_artworks_per_contest: 12,
};
```

For runtime configuration, use the `settings` table:

```sql
SELECT * FROM settings;
UPDATE settings SET value = '12' WHERE key = 'contest.max_artworks';
```

## Project Structure

```
ai-art-arena/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   │   ├── vote/          # Vote endpoint
│   │   │   ├── contests/      # Contest endpoints
│   │   │   └── cron/          # Cron jobs
│   │   ├── contest/           # Contest pages
│   │   ├── archive/           # Archive pages
│   │   └── blog/              # Blog pages
│   ├── components/            # React components
│   │   ├── contest/           # Contest-related components
│   │   ├── archive/           # Archive components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Reusable UI components
│   ├── lib/                   # Utility libraries
│   │   ├── supabase/          # Supabase client utilities
│   │   ├── constants.ts       # Application constants
│   │   ├── validation.ts      # Zod schemas
│   │   └── rate-limit.ts      # Rate limiting
│   └── types/                 # TypeScript type definitions
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Static files
└── middleware.ts              # Next.js middleware
```

## API Routes

### Vote API

**POST** `/api/vote`

Vote for an artwork (requires authentication).

Request body:
```json
{
  "artworkId": "uuid",
  "contestId": "uuid"
}
```

Rate limit: 10 requests per minute per IP

### Contests API

**GET** `/api/contests/active` - Get the current active contest
**GET** `/api/contests/archived` - Get archived contests (paginated)
**GET** `/api/contests/:id` - Get contest by ID

### Cron API

**POST** `/api/cron/archive-contest` - Archive ended contests (requires CRON_SECRET)

## Database Schema

### Main Tables

- **contests** - Weekly art contests
- **artworks** - AI-generated artworks in contests
- **votes** - User votes (one per artwork per day)
- **settings** - Database-driven configuration
- **blog_posts** - Blog content

### Key Functions

- `get_active_contest()` - Get current active contest
- `archive_contest(contest_id)` - Archive contest and determine winner
- `can_vote(artwork_id, user_id, contest_id)` - Check vote eligibility
- `get_setting(key)` - Get configuration value
- `update_setting(key, value)` - Update configuration

## Deployment

### Vercel Deployment

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**

   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Add environment variables from `.env.local`
   - Deploy

3. **Set up Cron Jobs**

   Create `vercel.json`:

   ```json
   {
     "crons": [{
       "path": "/api/cron/archive-contest",
       "schedule": "0 0 * * *"
     }]
   }
   ```

4. **Configure Environment Variables**

   In Vercel Dashboard, add all environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET`
   - `IP_SALT`
   - `NEXT_PUBLIC_SITE_URL` (set to your production domain)
   - Feature flags (optional)

## Security

- **Rate Limiting** - 10 requests/min for voting, 60/min for API
- **Input Validation** - Zod schemas validate all inputs
- **SQL Injection Protection** - Parameterized queries via Supabase
- **XSS Protection** - Content Security Policy headers
- **RLS Policies** - Database-level access control
- **IP Hashing** - SHA-256 with salt for privacy
- **Authentication** - Supabase Auth with JWT tokens

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Standards

- Use TypeScript for all new code
- Validate API inputs with Zod schemas
- Use constants from `src/lib/constants.ts`
- Follow Next.js App Router conventions
- Write meaningful commit messages

## Troubleshooting

### Common Issues

**Build fails with TypeScript errors**
```bash
npm run lint
# Fix errors and rebuild
```

**Database connection fails**
- Check Supabase URL and keys in `.env.local`
- Verify RLS policies are enabled
- Run migrations in correct order

**Rate limiting not working**
- Rate limiting is in-memory and resets on server restart
- For production, consider Redis-based rate limiting

**Votes not recording**
- Ensure user is authenticated
- Check `can_vote()` function is working
- Verify vote cooldown hasn't expired

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Rich text editing with [TipTap](https://tiptap.dev/)

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the architecture documentation in `ARCHITECTURE.md`

---

**Made with ❤️ by olliedoesis**
