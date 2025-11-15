# 📚 Type System Documentation

**AI Art Arena - Comprehensive TypeScript Types**

Complete type definitions for database schema, business logic, and application state.

---

## 📂 File Structure

```
src/types/
├── database.ts    # Supabase database schema types
├── contest.ts     # Contest-related interfaces
├── artwork.ts     # Artwork-related interfaces
├── vote.ts        # Voting system interfaces
└── index.ts       # Central export point
```

---

## 🗄️ Database Types (`database.ts`)

### Database Schema Interface

The `Database` interface represents the complete Supabase schema with full type safety.

#### Tables

**Contests Table**
```typescript
{
  Row: {
    id: string;
    week_number: number;
    start_date: string;
    end_date: string;
    status: "active" | "archived";
    winner_artwork_id: string | null;
    created_at: string;
    updated_at: string;
  }
  Insert: { /* Optional id, created_at, updated_at */ }
  Update: { /* All fields optional */ }
}
```

**Artworks Table**
```typescript
{
  Row: {
    id: string;
    contest_id: string;
    title: string;
    description: string | null;
    image_url: string;
    prompt: string | null;
    artist_name: string | null;
    vote_count: number;
    position: number; // 1-6
    created_at: string;
  }
  Insert: { /* Optional id, vote_count, created_at */ }
  Update: { /* All fields optional */ }
}
```

**Votes Table**
```typescript
{
  Row: {
    id: string;
    artwork_id: string;
    contest_id: string;
    user_identifier: string;
    voted_at: string;
  }
  Insert: { /* Optional id, voted_at */ }
  Update: { /* All fields optional */ }
}
```

#### Database Functions

**get_active_contest()**
```typescript
Returns: {
  contest_id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  time_remaining: string; // PostgreSQL interval
}[]
```

**can_user_vote_today(p_contest_id, p_user_identifier)**
```typescript
Args: {
  p_contest_id: string;
  p_user_identifier: string;
}
Returns: boolean
```

**record_vote(p_artwork_id, p_contest_id, p_user_identifier)**
```typescript
Args: {
  p_artwork_id: string;
  p_contest_id: string;
  p_user_identifier: string;
}
Returns: boolean
```

**get_contest_leaderboard(p_contest_id)**
```typescript
Args: {
  p_contest_id: string;
}
Returns: {
  artwork_id: string;
  title: string;
  image_url: string;
  vote_count: number;
  position: number;
}[]
```

### Type Aliases

```typescript
// Convenient aliases for table access
type ContestRow = Database["public"]["Tables"]["contests"]["Row"];
type ContestInsert = Database["public"]["Tables"]["contests"]["Insert"];
type ContestUpdate = Database["public"]["Tables"]["contests"]["Update"];

type ArtworkRow = Database["public"]["Tables"]["artworks"]["Row"];
type ArtworkInsert = Database["public"]["Tables"]["artworks"]["Insert"];
type ArtworkUpdate = Database["public"]["Tables"]["artworks"]["Update"];

type VoteRow = Database["public"]["Tables"]["votes"]["Row"];
type VoteInsert = Database["public"]["Tables"]["votes"]["Insert"];
type VoteUpdate = Database["public"]["Tables"]["votes"]["Update"];
```

---

## 🏆 Contest Types (`contest.ts`)

### Core Interfaces

**Contest**
```typescript
interface Contest {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  status: "active" | "archived";
  winner_artwork_id: string | null;
  created_at: string;
  updated_at: string;
}
```

**ContestWithArtworks**
```typescript
interface ContestWithArtworks extends Contest {
  artworks: Artwork[];
}
```

**ActiveContestInfo** 🆕
```typescript
interface ActiveContestInfo {
  contest: Contest;
  artworks: Artwork[];
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  };
  hasEnded: boolean;
  totalVotes: number;
}
```

**ArchivedContest**
```typescript
interface ArchivedContest extends Contest {
  status: "archived";
  winner_artwork_id: string;
  winner?: Artwork;
}
```

### Supporting Types

**ContestState** (Client-side state)
```typescript
interface ContestState {
  contest: Contest | null;
  artworks: Artwork[];
  isLoading: boolean;
  error: string | null;
  timeRemaining: number | null;
}
```

**TimeRemaining**
```typescript
interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  hasEnded: boolean;
}
```

---

## 🎨 Artwork Types (`artwork.ts`)

### Core Interfaces

**Artwork**
```typescript
interface Artwork {
  id: string;
  contest_id: string;
  title: string;
  description: string | null;
  image_url: string;
  prompt: string | null;
  artist_name: string | null;
  vote_count: number;
  position: number;
  created_at: string;
}
```

**ArtworkWithVoteStatus**
```typescript
interface ArtworkWithVoteStatus extends Artwork {
  hasUserVoted: boolean;
  isWinner?: boolean;
}
```

**ArtworkWithWinner** 🆕
```typescript
interface ArtworkWithWinner extends Artwork {
  isWinner: true;
  winningWeek: number;
  winningDate: string;
  finalVoteCount: number;
}
```

### Supporting Types

**ImageDimensions**
```typescript
interface ImageDimensions {
  width: number;
  height: number;
}
```

**ArtworkCardProps** (Component props)
```typescript
interface ArtworkCardProps {
  artwork: Artwork;
  onVote?: (artworkId: string) => Promise<void>;
  canVote?: boolean;
  isLoading?: boolean;
  showVoteCount?: boolean;
  showPrompt?: boolean;
  className?: string;
}
```

**GridPosition**
```typescript
interface GridPosition {
  row: number;
  col: number;
  position: number;
}
```

---

## 🗳️ Vote Types (`vote.ts`)

### Core Interfaces

**Vote**
```typescript
interface Vote {
  id: string;
  artwork_id: string;
  contest_id: string;
  user_identifier: string;
  voted_at: string;
}
```

**VoteStatus** 🆕
```typescript
interface VoteStatus {
  canVote: boolean;
  hasVotedToday: boolean;
  lastVoteDate: string | null;
  cooldownEndsAt: string | null;
  timeUntilNextVote: number | null; // milliseconds
}
```

**VoteRequest**
```typescript
interface VoteRequest {
  artworkId: string;
  contestId: string;
}
```

**VoteResponse**
```typescript
interface VoteResponse {
  success: boolean;
  error?: string;
  vote?: Vote;
  newVoteCount?: number;
}
```

### Supporting Types

**VoteCooldown**
```typescript
interface VoteCooldown {
  canVote: boolean;
  cooldownEndsAt: Date | null;
  timeRemaining: number | null;
  lastVotedAt: Date | null;
}
```

**VoteButtonState** (Component state)
```typescript
interface VoteButtonState {
  isLoading: boolean;
  isDisabled: boolean;
  cooldownText: string | null;
}
```

**UserVoteHistory** (Client-side tracking)
```typescript
interface UserVoteHistory {
  contestId: string;
  artworkId: string;
  votedAt: string;
}
```

---

## ⚙️ Constants (`lib/constants.ts`)

### Site Configuration

```typescript
const SITE_CONFIG = {
  name: "AI Art Arena",
  description: "Weekly AI Art voting contest...",
  url: "https://olliedoesis.dev",
  ogImage: "/images/og-image.jpg",
  keywords: [...],
  author: "olliedoesis",
  social: { twitter, github }
}
```

### Contest Configuration

```typescript
const CONTEST_CONFIG = {
  artworks_per_contest: 6,
  duration_days: 7,
  vote_cooldown_hours: 24,
  votes_per_user_per_day: 1,
  grid_layout: {
    mobile: 1,
    tablet: 2,
    desktop: 3
  },
  timer_update_interval: 1000
}
```

### Routes

```typescript
const ROUTES = {
  home: "/",
  contest: "/contest",
  active_contest: "/contest/active",
  archive: "/archive",
  contest_by_week: (weekId) => `/contest/${weekId}`,
  archive_by_week: (weekId) => `/archive/${weekId}`
}
```

### API Routes

```typescript
const API_ROUTES = {
  vote: "/api/vote",
  active_contest: "/api/contests/active",
  archived_contests: "/api/contests/archived",
  contest_by_id: (id) => `/api/contests/${id}`,
  cron_archive: "/api/cron/archive-contest"
}
```

### Other Constants

- `DATE_FORMATS` - Date formatting patterns
- `CONTEST_STATUS` - Contest status values
- `STORAGE_KEYS` - LocalStorage key generators
- `IMAGE_CONFIG` - Image sizes and quality settings
- `ANIMATION` - Animation durations
- `HTTP_STATUS` - HTTP status codes
- `ERROR_MESSAGES` - User-facing error messages
- `SUCCESS_MESSAGES` - Success feedback messages

---

## 📖 Usage Examples

### Importing Types

```typescript
// Import specific types
import { Contest, Artwork, Vote } from "@/types";

// Import database types
import type { Database, ContestRow, ArtworkInsert } from "@/types/database";

// Import all contest types
import type { ActiveContestInfo, ContestWithArtworks } from "@/types/contest";
```

### Using Database Types with Supabase

```typescript
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

const supabase = createClient<Database>();

// Fully typed query
const { data, error } = await supabase
  .from("contests")
  .select("*")
  .eq("status", "active")
  .single();

// data is typed as ContestRow
```

### Using Constants

```typescript
import { SITE_CONFIG, CONTEST_CONFIG, ROUTES, API_ROUTES } from "@/lib/constants";

// Site info
console.log(SITE_CONFIG.name); // "AI Art Arena"

// Contest settings
const artworkCount = CONTEST_CONFIG.artworks_per_contest; // 6

// Navigation
router.push(ROUTES.active_contest); // "/contest/active"

// API calls
fetch(API_ROUTES.vote, { ... });
```

### Type Guards

```typescript
import type { Contest, ArchivedContest } from "@/types";

function isArchivedContest(contest: Contest): contest is ArchivedContest {
  return contest.status === "archived" && contest.winner_artwork_id !== null;
}
```

---

## ✅ Type Safety Checklist

- [x] Database schema fully typed
- [x] All CRUD operations typed (Row, Insert, Update)
- [x] Database functions typed
- [x] Client-side state typed
- [x] Component props typed
- [x] API request/response typed
- [x] Constants typed with `as const`
- [x] Enum-like values typed
- [x] Helper type utilities exported

---

## 🔄 Backwards Compatibility

For existing code, the following legacy exports are maintained:

```typescript
// Old names still work
export const APP_NAME = SITE_CONFIG.name;
export const APP_DESCRIPTION = SITE_CONFIG.description;
export const APP_URL = SITE_CONFIG.url;
export const CONTEST_DURATION_DAYS = CONTEST_CONFIG.duration_days;
export const ARTWORKS_PER_CONTEST = CONTEST_CONFIG.artworks_per_contest;
export const PAGE_ROUTES = ROUTES;
```

---

## 🎯 Next Steps

1. **Generate Supabase Types**: Once database is created, run:
   ```bash
   supabase gen types typescript --local > src/types/supabase.types.ts
   ```

2. **Validate Types**: Ensure generated types match `database.ts` structure

3. **Update Imports**: Use generated types for Supabase client initialization

4. **Type Tests**: Create type tests to ensure consistency

---

**Type system is complete and ready for development!** ✨
