# 🏛️ Archive Components Documentation

**AI Art Arena - Archive Components**

Browse past contest winners and view complete leaderboards.

---

## 📂 Component Structure

```
src/components/archive/
├── ArchiveCard.tsx      # Single archived contest card
├── ArchiveGrid.tsx      # Grid of archived contests
├── ArchiveDetails.tsx   # Leaderboard for contest results
└── index.ts             # Central exports
```

---

## 🗂️ ArchiveCard Component

**File:** `src/components/archive/ArchiveCard.tsx`

### Features

- ✅ **Link Wrapper** - Next.js Link to `/archive/[weekId]`
- ✅ **Winner Image** - Full-size image display
- ✅ **Winner Badge** - Trophy icon overlay (top-left)
- ✅ **Week Number** - Clear contest identifier
- ✅ **Archived Badge** - Status indicator
- ✅ **Winner Title** - Line-clamped artwork title
- ✅ **Date Display** - Uses formatDate utility
- ✅ **Vote Count** - Total votes prominently shown
- ✅ **View Results Link** - With arrow icon
- ✅ **Hover Effects** - Image scale + gradient overlay
- ✅ **Loading State** - Spinner during image load

### Props

```typescript
interface ArchiveCardProps {
  contest: Contest;         // Archived contest data
  winner: Artwork;          // Winning artwork
  className?: string;       // Additional CSS classes
}
```

### Usage Examples

**Basic Card**

```tsx
import { ArchiveCard } from "@/components/archive";

<ArchiveCard
  contest={archivedContest}
  winner={winningArtwork}
/>
```

**In Archive List**

```tsx
{archivedContests.map(({ contest, winner }) => (
  <ArchiveCard
    key={contest.id}
    contest={contest}
    winner={winner}
  />
))}
```

### Visual Structure

**Default State**
```
┌─────────────────────────────────┐
│ [Trophy Winner]                  │
│                                  │
│      [Winner Image]              │
│                                  │
├─────────────────────────────────┤
│  Week 5          [Archived]      │
│  Sunset Dreams                   │
│  Jan 15, 2025        127 votes   │
│  View Results →                  │
└─────────────────────────────────┘
```

**Hover State**
```
┌─────────────────────────────────┐
│ [Trophy Winner]                  │
│      [Winner Image]              │
│       (scaled 105%)              │
│   (gradient overlay)             │
├─────────────────────────────────┤
│  Week 5          [Archived]      │
│  Sunset Dreams                   │
│  Jan 15, 2025        127 votes   │
│  View Results  →→                │
│              (arrow moves)       │
└─────────────────────────────────┘
```

### Code Details

**Link Navigation**

```tsx
<Link
  href={`${ROUTES.archive}/${contest.id}`}
  className="group block"
>
  <Card hover>
    {/* Content */}
  </Card>
</Link>
```

**Hover Effects**

```tsx
const [isHovered, setIsHovered] = React.useState(false);

<Link
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
  <Image className={isHovered && "scale-105"} />

  <div className={cn(
    "absolute inset-0 bg-gradient-to-t from-black/80",
    isHovered && "opacity-100"
  )} />

  <div className={cn(
    "flex items-center gap-1",
    isHovered && "gap-2"  // Arrow moves right
  )}>
    View Results
    <ArrowRight className="h-4 w-4" />
  </div>
</Link>
```

**Date Formatting**

```tsx
import { formatDate } from "@/lib/utils";

<span>{formatDate(contest.end_date)}</span>
// Output: "Jan 15, 2025"
```

### Styling Classes

**Card:**
- Hover effect: `group-hover:shadow-lg`
- Smooth transition: `transition-all duration-300`

**Image:**
- Aspect ratio: `aspect-square`
- Hover scale: `scale-105`
- Overlay: `bg-gradient-to-t from-black/80`

**Typography:**
- Week number: `text-lg font-bold`
- Title: `text-base font-semibold line-clamp-1`
- Date/votes: `text-sm text-muted-foreground`
- Link: `text-sm font-medium text-primary`

---

## 📐 ArchiveGrid Component

**File:** `src/components/archive/ArchiveGrid.tsx`

### Features

- ✅ **Responsive Grid** - 1/2/3 columns
- ✅ **Empty State** - Message when no archives
- ✅ **Auto-mapping** - Maps through contests array
- ✅ **Type-safe** - Expects contests with winners

### Props

```typescript
interface ArchiveGridProps {
  contests: Array<{              // Contests with winners
    contest: Contest;
    winner: Artwork;
  }>;
  className?: string;            // Additional CSS classes
}
```

### Usage Examples

**Basic Grid**

```tsx
import { ArchiveGrid } from "@/components/archive";

<ArchiveGrid
  contests={archivedContests}
/>
```

**With Data Fetching**

```tsx
async function ArchivePage() {
  const contests = await getArchivedContests();

  return (
    <div className="container">
      <h1>Past Contests</h1>
      <ArchiveGrid contests={contests} />
    </div>
  );
}
```

### Visual Layout

**Mobile (< 768px) - 1 Column**
```
┌──────────────┐
│  Week 5      │
├──────────────┤
│  Week 4      │
├──────────────┤
│  Week 3      │
└──────────────┘
```

**Tablet (768px - 1024px) - 2 Columns**
```
┌────────────┬────────────┐
│  Week 5    │  Week 4    │
├────────────┼────────────┤
│  Week 3    │  Week 2    │
└────────────┴────────────┘
```

**Desktop (> 1024px) - 3 Columns**
```
┌──────────┬──────────┬──────────┐
│  Week 5  │  Week 4  │  Week 3  │
├──────────┼──────────┼──────────┤
│  Week 2  │  Week 1  │          │
└──────────┴──────────┴──────────┘
```

### Code Details

**Empty State**

```tsx
if (!contests || contests.length === 0) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <p>No archived contests yet</p>
        <p>Past contest winners will appear here</p>
      </div>
    </div>
  );
}
```

**Mapping Logic**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {contests.map(({ contest, winner }) => (
    <ArchiveCard
      key={contest.id}
      contest={contest}
      winner={winner}
    />
  ))}
</div>
```

### Grid Configuration

**Responsive Classes:**
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

**Breakpoints:**
- Mobile: `grid-cols-1` (default)
- Tablet: `md:grid-cols-2` (768px+)
- Desktop: `lg:grid-cols-3` (1024px+)

---

## 🏆 ArchiveDetails Component

**File:** `src/components/archive/ArchiveDetails.tsx`

### Features

- ✅ **Leaderboard Layout** - Ranked list of artworks
- ✅ **Rank Numbers** - #1, #2, #3, etc.
- ✅ **Medal Icons** - Trophy (1st), Medal (2nd), Award (3rd)
- ✅ **Image Thumbnails** - 80x80 optimized images
- ✅ **Artwork Info** - Title, description, artist
- ✅ **Vote Count** - Prominently displayed
- ✅ **Winner Highlight** - Yellow accent for #1
- ✅ **Responsive** - Stacks on mobile

### Props

```typescript
interface ArchiveDetailsProps {
  artworks: Artwork[];       // MUST be sorted by vote_count DESC
  className?: string;        // Additional CSS classes
}
```

### Usage Examples

**Basic Leaderboard**

```tsx
import { ArchiveDetails } from "@/components/archive";

// IMPORTANT: Sort artworks before passing
const sortedArtworks = artworks.sort((a, b) =>
  b.vote_count - a.vote_count
);

<ArchiveDetails artworks={sortedArtworks} />
```

**With Server Component**

```tsx
async function ContestResultsPage({ params }) {
  const artworks = await getContestArtworks(params.id);

  // Sort by votes descending
  const sorted = artworks.sort((a, b) =>
    b.vote_count - a.vote_count
  );

  return <ArchiveDetails artworks={sorted} />;
}
```

### Visual Structure

**Winner (Rank #1) - Highlighted**
```
┌──────────────────────────────────────────────────┐
│  🏆  [Image]  Sunset Dreams                 127  │
│      80x80    Beautiful sunset over...    votes  │
│               by Artist Name                     │
│  (Yellow border and background accent)           │
└──────────────────────────────────────────────────┘
```

**Second Place (Rank #2)**
```
┌──────────────────────────────────────────────────┐
│  🥈  [Image]  Ocean Waves                    95  │
│      80x80    Crashing waves in the...    votes  │
│               by Artist Name                     │
└──────────────────────────────────────────────────┘
```

**Third Place (Rank #3)**
```
┌──────────────────────────────────────────────────┐
│  🏅  [Image]  Mountain Peak                  82  │
│      80x80    Snow-capped mountain...      votes  │
│               by Artist Name                     │
└──────────────────────────────────────────────────┘
```

**Fourth Place and Below**
```
┌──────────────────────────────────────────────────┐
│  #4  [Image]  Forest Path                   67  │
│      80x80    Deep forest trail...         votes  │
│               by Artist Name                     │
└──────────────────────────────────────────────────┘
```

### Code Details

**Medal Icons**

```tsx
const getMedalIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-6 w-6 text-warning" />;
    case 2:
      return <Medal className="h-6 w-6 text-muted-foreground" />;
    case 3:
      return <Award className="h-6 w-6 text-accent" />;
    default:
      return null;
  }
};
```

**Rank Display**

```tsx
const getRankDisplay = (rank: number) => {
  if (rank <= 3) {
    return getMedalIcon(rank);
  }
  return (
    <span className="text-2xl font-bold text-muted-foreground">
      #{rank}
    </span>
  );
};
```

**Winner Highlighting**

```tsx
const isWinner = rank === 1;

<Card
  className={cn(
    isWinner && "border-warning bg-warning/5 shadow-lg shadow-warning/20"
  )}
>
  <h3 className={isWinner ? "text-warning" : "text-foreground"}>
    {artwork.title}
  </h3>

  <span className={isWinner ? "text-warning" : "text-foreground"}>
    {artwork.vote_count}
  </span>
</Card>
```

**Layout Structure**

```tsx
<div className="flex items-center gap-4">
  {/* Rank (48px fixed width) */}
  <div className="w-12 flex-shrink-0">
    {getRankDisplay(rank)}
  </div>

  {/* Thumbnail (80x80 fixed) */}
  <div className="h-20 w-20 flex-shrink-0">
    <Image src={artwork.image_url} />
  </div>

  {/* Info (flexible) */}
  <div className="flex-1">
    <h3>{artwork.title}</h3>
    <p>{artwork.description}</p>
    <p>by {artwork.artist_name}</p>
  </div>

  {/* Vote Count (auto-width) */}
  <div className="flex-shrink-0">
    <span>{artwork.vote_count}</span>
  </div>
</div>
```

### Styling Classes

**Winner Card:**
- Border: `border-warning`
- Background: `bg-warning/5`
- Shadow: `shadow-lg shadow-warning/20`
- Title: `text-warning`
- Vote count: `text-warning`

**Regular Cards:**
- Border: `border-border`
- Background: `bg-background`
- Title: `text-foreground`
- Vote count: `text-foreground`

**Medal Icons:**
- Trophy (1st): `text-warning` (gold)
- Medal (2nd): `text-muted-foreground` (silver)
- Award (3rd): `text-accent` (bronze/pink)

**Typography:**
- Rank number: `text-2xl font-bold`
- Title: `text-lg font-semibold`
- Description: `text-sm text-muted-foreground line-clamp-2`
- Artist: `text-xs text-muted-foreground`
- Vote count: `text-3xl font-bold tabular-nums`

---

## 📦 Easy Imports

```tsx
// Archive components
import {
  ArchiveCard,
  ArchiveGrid,
  ArchiveDetails
} from "@/components/archive";

// All components (includes UI, layout, contest, archive)
import {
  Button,
  Card,
  Header,
  Footer,
  ContestTimer,
  VoteButton,
  ArchiveGrid
} from "@/components";

// Type imports
import type {
  ArchiveCardProps,
  ArchiveGridProps,
  ArchiveDetailsProps
} from "@/components/archive";
```

---

## 💡 Usage Patterns

### Complete Archive Page

```tsx
import { ArchiveGrid } from "@/components/archive";

async function ArchivePage() {
  // Fetch all archived contests with winners
  const contests = await db
    .from("contests")
    .select(`
      *,
      winner:artworks!winner_artwork_id(*)
    `)
    .eq("status", "archived")
    .order("week_number", { ascending: false });

  const formattedContests = contests.map((c) => ({
    contest: c,
    winner: c.winner,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Past Contests</h1>
      <ArchiveGrid contests={formattedContests} />
    </div>
  );
}
```

### Contest Details Page

```tsx
import { ArchiveDetails, WinnerBanner } from "@/components";

async function ContestDetailsPage({ params }) {
  const contest = await getContest(params.id);
  const artworks = await getContestArtworks(params.id);

  // Sort by vote count descending
  const sorted = artworks.sort((a, b) => b.vote_count - a.vote_count);
  const winner = sorted[0];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Winner Banner */}
      <WinnerBanner
        artwork={winner}
        weekNumber={contest.week_number}
      />

      {/* Full Results */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">Complete Results</h2>
        <ArchiveDetails artworks={sorted} />
      </div>
    </div>
  );
}
```

### Archive with Pagination

```tsx
"use client";

import { useState } from "react";
import { ArchiveGrid } from "@/components/archive";

export default function PaginatedArchive({ initialContests }) {
  const [contests, setContests] = useState(initialContests);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    const newContests = await fetchContests(page + 1);
    setContests([...contests, ...newContests]);
    setPage(page + 1);
    setHasMore(newContests.length > 0);
  };

  return (
    <div className="space-y-6">
      <ArchiveGrid contests={contests} />

      {hasMore && (
        <button onClick={loadMore}>
          Load More
        </button>
      )}
    </div>
  );
}
```

---

## 🎨 Styling Customization

### ArchiveCard

```tsx
// Custom hover effect duration
<Card className="transition-all duration-500">

// Different gradient overlay
<div className="bg-gradient-to-t from-primary/80 to-transparent">

// Hide "Archived" badge
{/* Remove Badge component */}
```

### ArchiveGrid

```tsx
// 4 columns on desktop
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// Larger gap
<div className="gap-8">

// Custom empty state
if (!contests.length) {
  return <CustomEmptyState />;
}
```

### ArchiveDetails

```tsx
// Different medal colors
case 1: return <Trophy className="text-yellow-500" />;
case 2: return <Medal className="text-gray-400" />;
case 3: return <Award className="text-orange-600" />;

// Larger thumbnails
<div className="h-32 w-32">  {/* Instead of h-20 w-20 */}

// Show top 5 with medals
if (rank <= 5) {
  return getMedalIcon(rank);
}
```

---

## 🔧 Advanced Features

### ArchiveCard - Prefetch Links

```tsx
import Link from "next/link";

<Link
  href={`/archive/${contest.id}`}
  prefetch={true}  // Prefetch on hover
>
```

### ArchiveGrid - Filtering

```tsx
const [filter, setFilter] = useState("all");

const filtered = contests.filter((c) => {
  if (filter === "recent") {
    return new Date(c.contest.end_date) > oneMonthAgo;
  }
  return true;
});

<ArchiveGrid contests={filtered} />
```

### ArchiveDetails - Expandable Rows

```tsx
const [expanded, setExpanded] = useState<string | null>(null);

<Card onClick={() => setExpanded(artwork.id)}>
  {/* Regular content */}

  {expanded === artwork.id && (
    <div className="mt-4 border-t pt-4">
      <Image src={artwork.image_url} fill />
    </div>
  )}
</Card>
```

---

## ⚡ Performance

### Image Optimization

**ArchiveCard:**
- Thumbnail size: `(max-width: 768px) 100vw, 33vw`
- Quality: 85
- Lazy loading by default

**ArchiveDetails:**
- Fixed size: `80px`
- Quality: 75 (smaller file size)
- No priority loading

### Grid Performance

- No virtualization needed (paginated results)
- Empty state prevents layout shift
- Consistent card heights

---

## ♿ Accessibility

### ArchiveCard

- ✅ Semantic Link element
- ✅ Image alt text from title
- ✅ Clear link text "View Results"
- ✅ Keyboard navigable

### ArchiveGrid

- ✅ Semantic grid structure
- ✅ Empty state descriptive text

### ArchiveDetails

- ✅ Semantic list structure
- ✅ Medal icons with proper colors
- ✅ Clear ranking indicators
- ✅ High contrast for winner

---

## 📊 Component Stats

| Component | Type | Lines | Features |
|-----------|------|-------|----------|
| ArchiveCard | Client | ~150 | Link, image, hover, badges |
| ArchiveGrid | Client | ~60 | Grid, empty state |
| ArchiveDetails | Client | ~130 | Leaderboard, medals, highlight |

**Total:** ~340 lines, 4 files

---

## ✅ Checklist

- [x] ArchiveCard with Link wrapper
- [x] Winner image display
- [x] Winner badge overlay
- [x] Week number and "Archived" badge
- [x] Date formatting with formatDate
- [x] Vote count display
- [x] "View Results →" link
- [x] Hover effects
- [x] ArchiveGrid with responsive columns
- [x] Empty state handling
- [x] ArchiveDetails leaderboard
- [x] Rank numbers (#1, #2, etc.)
- [x] Medal icons for top 3
- [x] Image thumbnails (80x80)
- [x] Artwork info display
- [x] Winner highlighted with yellow
- [x] Main components index.ts
- [x] TypeScript compilation passes

---

**Archive components complete and production-ready!** 🚀
