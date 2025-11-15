# 🎨 Artwork Display Components Documentation

**AI Art Arena - Artwork Display Components**

Interactive artwork cards, responsive grids, and winner banners.

---

## 📂 Component Structure

```
src/components/contest/
├── ArtworkCard.tsx      # Individual artwork card with voting
├── ContestGrid.tsx      # Responsive grid layout
├── WinnerBanner.tsx     # Winner showcase banner
└── index.ts             # Central exports
```

---

## 🖼️ ArtworkCard Component

**File:** `src/components/contest/ArtworkCard.tsx`

### Features

- ✅ **Client Component** - Interactive with `"use client"`
- ✅ **Next.js Image** - Optimized image loading
- ✅ **Winner Badge** - Conditional trophy badge (top-left)
- ✅ **Hover Effect** - Shows "View Full Size" button
- ✅ **Modal View** - Click to open full-size image
- ✅ **Image Loading State** - Spinner during load
- ✅ **Smooth Animations** - Scale on hover, fade transitions
- ✅ **VoteButton Integration** - In card footer
- ✅ **Responsive Design** - Aspect-ratio maintained

### Props

```typescript
interface ArtworkCardProps {
  artwork: Artwork;                          // Artwork to display
  onVote: (id: string) => Promise<void> | void;
  canVote?: boolean;                         // User can vote
  cooldownEndsAt?: Date | null;              // Cooldown end time
  hasVoted?: boolean;                        // Voted for this artwork
  showWinner?: boolean;                      // Show winner badge
  className?: string;                        // Additional classes
}
```

### Usage Examples

**Basic Card**

```tsx
import { ArtworkCard } from "@/components/contest";

<ArtworkCard
  artwork={artwork}
  onVote={handleVote}
  hasVoted={false}
/>
```

**With Winner Badge**

```tsx
<ArtworkCard
  artwork={artwork}
  onVote={handleVote}
  hasVoted={true}
  showWinner={true}
/>
```

**In Cooldown State**

```tsx
<ArtworkCard
  artwork={artwork}
  onVote={handleVote}
  canVote={true}
  cooldownEndsAt={new Date(Date.now() + 3600000)}
/>
```

### Visual Structure

**Default State**
```
┌─────────────────────────────────┐
│                                  │
│      [Artwork Image]             │
│                                  │
├─────────────────────────────────┤
│  Title                           │
│  Description text here...        │
│  by Artist Name                  │
├─────────────────────────────────┤
│  [Vote Button]  42 votes         │
└─────────────────────────────────┘
```

**With Winner Badge**
```
┌─────────────────────────────────┐
│ [Trophy Winner]                  │
│      [Artwork Image]             │
│                                  │
├─────────────────────────────────┤
│  Title                           │
│  Description text here...        │
│  by Artist Name                  │
├─────────────────────────────────┤
│  [Voted ✓]  43 votes             │
└─────────────────────────────────┘
```

**Hover State**
```
┌─────────────────────────────────┐
│      [Artwork Image]             │
│       (scaled 105%)              │
│                                  │
│  ┌───────────────────────┐      │
│  │ [Eye] View Full Size  │      │
│  └───────────────────────┘      │
│     (overlay visible)            │
├─────────────────────────────────┤
│  Title                           │
│  ...                             │
└─────────────────────────────────┘
```

### Code Details

**Image Loading State**

```tsx
const [isImageLoading, setIsImageLoading] = React.useState(true);

{isImageLoading && (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
)}

<Image
  src={artwork.image_url}
  onLoad={() => setIsImageLoading(false)}
  className={isImageLoading && "opacity-0"}
/>
```

**Hover Interaction**

```tsx
const [isHovered, setIsHovered] = React.useState(false);

<div
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
  <Image className={isHovered && "scale-105"} />

  <div className={cn(
    "absolute inset-0 bg-black/60 opacity-0",
    isHovered && "opacity-100"
  )}>
    <button onClick={() => setIsModalOpen(true)}>
      View Full Size
    </button>
  </div>
</div>
```

**Modal Integration**

```tsx
const [isModalOpen, setIsModalOpen] = React.useState(false);

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  size="xl"
  title={artwork.title}
>
  <Image
    src={artwork.image_url}
    fill
    className="object-contain"
    quality={95}
  />
</Modal>
```

### Styling Classes

**Image Container:**
- Aspect ratio: `aspect-square`
- Background: `bg-muted` (for loading)
- Hover scale: `scale-105` (smooth zoom)

**Hover Overlay:**
- Background: `bg-black/60`
- Transition: `transition-opacity duration-300`
- Button: `bg-white shadow-lg hover:scale-105`

**Card Content:**
- Title: `text-lg font-semibold`
- Description: `text-sm text-muted-foreground line-clamp-2`
- Artist: `text-xs text-muted-foreground`

---

## 📐 ContestGrid Component

**File:** `src/components/contest/ContestGrid.tsx`

### Features

- ✅ **Responsive Grid** - 1/2/3 columns
- ✅ **Loading State** - Shows ContestGridSkeleton
- ✅ **Empty State** - Friendly message when no artworks
- ✅ **Vote Tracking** - Matches votedArtworkId
- ✅ **Automatic hasVoted** - Calculated per artwork
- ✅ **Perfect for 6 Artworks** - 2x3 grid on desktop

### Props

```typescript
interface ContestGridProps {
  artworks: Artwork[];                       // Array of artworks
  onVote: (id: string) => Promise<void> | void;
  canVote?: boolean;                         // User can vote
  cooldownEndsAt?: Date | null;              // Cooldown end time
  votedArtworkId?: string | null;            // ID of voted artwork
  isLoading?: boolean;                       // Loading state
  className?: string;                        // Additional classes
}
```

### Usage Examples

**Basic Grid**

```tsx
import { ContestGrid } from "@/components/contest";

<ContestGrid
  artworks={artworks}
  onVote={handleVote}
  votedArtworkId={null}
  isLoading={false}
/>
```

**With Vote Tracking**

```tsx
const [votedId, setVotedId] = useState<string | null>(null);

<ContestGrid
  artworks={artworks}
  onVote={async (id) => {
    await submitVote(id);
    setVotedId(id);
  }}
  votedArtworkId={votedId}
/>
```

**Loading State**

```tsx
<ContestGrid
  artworks={[]}
  onVote={handleVote}
  isLoading={true}  // Shows skeleton
/>
```

### Visual Layout

**Mobile (< 768px) - 1 Column**
```
┌──────────────┐
│   Artwork 1  │
├──────────────┤
│   Artwork 2  │
├──────────────┤
│   Artwork 3  │
├──────────────┤
│   Artwork 4  │
├──────────────┤
│   Artwork 5  │
├──────────────┤
│   Artwork 6  │
└──────────────┘
```

**Tablet (768px - 1024px) - 2 Columns**
```
┌────────────┬────────────┐
│ Artwork 1  │ Artwork 2  │
├────────────┼────────────┤
│ Artwork 3  │ Artwork 4  │
├────────────┼────────────┤
│ Artwork 5  │ Artwork 6  │
└────────────┴────────────┘
```

**Desktop (> 1024px) - 3 Columns**
```
┌──────────┬──────────┬──────────┐
│Artwork 1 │Artwork 2 │Artwork 3 │
├──────────┼──────────┼──────────┤
│Artwork 4 │Artwork 5 │Artwork 6 │
└──────────┴──────────┴──────────┘
```

### Code Details

**Loading State**

```tsx
if (isLoading) {
  return <ContestGridSkeleton count={6} />;
}
```

**Empty State**

```tsx
if (!artworks || artworks.length === 0) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <p>No artworks available</p>
        <p>Check back soon for the next contest!</p>
      </div>
    </div>
  );
}
```

**Vote Tracking Logic**

```tsx
{artworks.map((artwork) => {
  const hasVoted = votedArtworkId === artwork.id;

  return (
    <ArtworkCard
      key={artwork.id}
      artwork={artwork}
      hasVoted={hasVoted}
      onVote={onVote}
    />
  );
})}
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

**Gap:**
- Consistent `gap-6` (24px) between cards

---

## 🏆 WinnerBanner Component

**File:** `src/components/contest/WinnerBanner.tsx`

### Features

- ✅ **Gradient Background** - Yellow/gold theme
- ✅ **Two-Column Layout** - Image + info
- ✅ **Trophy Icon** - Large trophy with badge
- ✅ **Sparkles Decorations** - Multiple sparkle icons
- ✅ **Vote Count Prominent** - Large 5xl display
- ✅ **Week Number** - "Week X Winner!" heading
- ✅ **Image Loading State** - Spinner with warning color
- ✅ **Responsive** - Stacks on mobile

### Props

```typescript
interface WinnerBannerProps {
  artwork: Artwork;           // Winning artwork
  weekNumber: number;         // Contest week number
  className?: string;         // Additional classes
}
```

### Usage Examples

**Basic Banner**

```tsx
import { WinnerBanner } from "@/components/contest";

<WinnerBanner
  artwork={winningArtwork}
  weekNumber={5}
/>
```

**With Custom Styling**

```tsx
<WinnerBanner
  artwork={winningArtwork}
  weekNumber={12}
  className="mb-8"
/>
```

### Visual Structure

**Desktop Layout**
```
┌────────────────────────────────────────────────────────┐
│                         WINNER BANNER                   │
│  ┌─────────────────┐  ┌──────────────────────────┐    │
│  │   ✨            │  │ [Trophy] [Winner Badge]  │    │
│  │                 │  │                           │    │
│  │  Winner Image   │  │ Week 5 Winner!           │    │
│  │                 │  │                           │    │
│  │            ✨   │  │ Artwork Title             │    │
│  └─────────────────┘  │ Description...            │    │
│                        │ by Artist Name            │    │
│                        │                           │    │
│                        │ 127                       │    │
│                        │ votes                     │    │
│                        │ ✨ ✨ ✨                 │    │
│                        └──────────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

**Mobile Layout (Stacked)**
```
┌──────────────────────────┐
│      ✨                  │
│                          │
│    Winner Image          │
│                          │
│                      ✨  │
├──────────────────────────┤
│ [Trophy] [Winner Badge]  │
│                          │
│ Week 5 Winner!           │
│                          │
│ Artwork Title            │
│ Description...           │
│ by Artist Name           │
│                          │
│ 127                      │
│ votes                    │
│ ✨ ✨ ✨                │
└──────────────────────────┘
```

### Code Details

**Gradient Background**

```tsx
<Card className="bg-gradient-to-br from-warning/20 via-accent/10 to-warning/20 border-warning">
```

**Trophy and Badge**

```tsx
<div className="flex items-center gap-2">
  <Trophy className="h-10 w-10 text-warning" />
  <Badge variant="warning" className="text-base font-semibold">
    Winner
  </Badge>
</div>
```

**Vote Count Display**

```tsx
<div className="flex items-baseline gap-2">
  <span className="text-5xl font-bold text-warning tabular-nums">
    {artwork.vote_count}
  </span>
  <span className="text-lg text-muted-foreground">
    {artwork.vote_count === 1 ? "vote" : "votes"}
  </span>
</div>
```

**Sparkles Decoration**

```tsx
{/* On image */}
<div className="absolute left-4 top-4">
  <Sparkles className="h-8 w-8 text-warning drop-shadow-lg" />
</div>
<div className="absolute bottom-4 right-4">
  <Sparkles className="h-6 w-6 text-warning drop-shadow-lg" />
</div>

{/* In info section */}
<div className="flex gap-1">
  <Sparkles className="h-5 w-5 text-warning" />
  <Sparkles className="h-4 w-4 text-warning" />
  <Sparkles className="h-5 w-5 text-warning" />
</div>
```

### Styling Classes

**Card:**
- Gradient: `from-warning/20 via-accent/10 to-warning/20`
- Border: `border-warning`

**Grid Layout:**
- Desktop: `md:grid-cols-2` (50/50 split)
- Mobile: Single column (default)

**Typography:**
- Week heading: `text-3xl md:text-4xl font-bold`
- Title: `text-2xl font-semibold`
- Vote count: `text-5xl font-bold text-warning`
- Artist name: `text-base font-semibold`

---

## 📦 Easy Imports

```tsx
import {
  ArtworkCard,
  ContestGrid,
  WinnerBanner
} from "@/components/contest";

import type {
  ArtworkCardProps,
  ContestGridProps,
  WinnerBannerProps
} from "@/components/contest";
```

---

## 💡 Usage Patterns

### Complete Contest Page

```tsx
"use client";

import { useState } from "react";
import { ContestTimer, ContestGrid, WinnerBanner } from "@/components/contest";

export default function ContestPage({ contest, artworks, previousWinner }) {
  const [votedId, setVotedId] = useState<string | null>(null);
  const [cooldownEndsAt, setCooldownEndsAt] = useState<Date | null>(null);

  const handleVote = async (artworkId: string) => {
    const response = await fetch("/api/vote", {
      method: "POST",
      body: JSON.stringify({ artworkId, contestId: contest.id }),
    });

    if (response.ok) {
      setVotedId(artworkId);
      setCooldownEndsAt(new Date(Date.now() + 24 * 60 * 60 * 1000));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Contest Header */}
      <div className="flex items-center justify-between">
        <h1>Week {contest.week_number} Contest</h1>
        <ContestTimer endDate={contest.end_date} />
      </div>

      {/* Previous Winner */}
      {previousWinner && (
        <WinnerBanner
          artwork={previousWinner}
          weekNumber={contest.week_number - 1}
        />
      )}

      {/* Contest Grid */}
      <ContestGrid
        artworks={artworks}
        onVote={handleVote}
        votedArtworkId={votedId}
        cooldownEndsAt={cooldownEndsAt}
        isLoading={false}
      />
    </div>
  );
}
```

### Archive Page with Winners

```tsx
import { WinnerBanner } from "@/components/contest";

export default function ArchivePage({ winners }) {
  return (
    <div className="space-y-6">
      <h1>Past Winners</h1>

      {winners.map((winner) => (
        <WinnerBanner
          key={winner.artwork.id}
          artwork={winner.artwork}
          weekNumber={winner.weekNumber}
        />
      ))}
    </div>
  );
}
```

### Single Artwork Display

```tsx
import { ArtworkCard } from "@/components/contest";

export default function ArtworkPage({ artwork }) {
  return (
    <div className="max-w-md mx-auto">
      <ArtworkCard
        artwork={artwork}
        onVote={async () => {}}
        canVote={false}
        showWinner={artwork.isWinner}
      />
    </div>
  );
}
```

---

## 🎨 Styling Customization

### ArtworkCard

```tsx
// Custom image aspect ratio
<div className="aspect-[4/3]">  {/* Instead of aspect-square */}

// Disable hover effect
<Image className="transition-none" />

// Custom modal size
<Modal size="lg">  {/* Instead of xl */}
```

### ContestGrid

```tsx
// 4 columns on desktop
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// Larger gap
<div className="gap-8">  {/* Instead of gap-6 */}

// Different empty state
if (!artworks.length) {
  return <CustomEmptyState />;
}
```

### WinnerBanner

```tsx
// Custom gradient colors
<Card className="bg-gradient-to-r from-primary/20 to-secondary/20">

// Hide sparkles
// Remove <Sparkles /> elements

// Smaller vote count
<span className="text-4xl">  {/* Instead of text-5xl */}
```

---

## 🔧 Advanced Features

### ArtworkCard - Lazy Loading

```tsx
<Image
  loading="lazy"  // Enable lazy loading
  placeholder="blur"  // Blur placeholder
  blurDataURL={artwork.blurDataUrl}
/>
```

### ContestGrid - Infinite Scroll

```tsx
import { useInfiniteScroll } from "@/hooks";

const { items, loadMore } = useInfiniteScroll(artworks);

<ContestGrid
  artworks={items}
  onVote={handleVote}
/>

<button onClick={loadMore}>Load More</button>
```

### WinnerBanner - Confetti Animation

```tsx
import confetti from "canvas-confetti";

<WinnerBanner
  onLoad={() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }}
/>
```

---

## ⚡ Performance

### Image Optimization

**ArtworkCard:**
- Uses Next.js Image with `fill` layout
- Responsive sizes: `(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw`
- Quality: 85 (balance between quality and file size)
- Priority: false (lazy load for better LCP)

**WinnerBanner:**
- Uses Next.js Image with `fill` layout
- Responsive sizes: `(max-width: 768px) 100vw, 50vw`
- Quality: 90 (higher quality for hero image)
- Priority: true (loaded immediately)

### Grid Performance

- Virtualization not needed for 6 items
- Skeleton shows immediately during load
- Empty state prevents layout shift

---

## ♿ Accessibility

### ArtworkCard

- ✅ Image alt text from artwork.title
- ✅ "View Full Size" button has text + icon
- ✅ Modal has proper title
- ✅ Keyboard navigation for all interactive elements

### ContestGrid

- ✅ Semantic grid structure
- ✅ Each card has unique key
- ✅ Empty state has descriptive text

### WinnerBanner

- ✅ Heading hierarchy (h2, h3)
- ✅ Decorative icons (sparkles) don't need alt text
- ✅ Vote count uses tabular-nums for readability

---

## 📊 Component Stats

| Component | Type | Lines | Features |
|-----------|------|-------|----------|
| ArtworkCard | Client | ~200 | Image, modal, hover, loading, vote |
| ContestGrid | Client | ~80 | Grid, loading, empty state |
| WinnerBanner | Client | ~150 | Gradient, layout, decorations |

**Total:** ~430 lines, 3 files

---

## ✅ Checklist

- [x] ArtworkCard with Next.js Image
- [x] Winner badge (top-left)
- [x] Hover effect with "View Full Size"
- [x] Modal for full-size image
- [x] Image loading spinner
- [x] VoteButton integration
- [x] ContestGrid with responsive columns
- [x] Grid loading state (skeleton)
- [x] Grid empty state
- [x] Vote tracking per artwork
- [x] WinnerBanner with gradient
- [x] Two-column layout (image + info)
- [x] Trophy and sparkles icons
- [x] Prominent vote count display
- [x] Week number heading
- [x] All components client-side
- [x] TypeScript compilation passes

---

**Artwork display components complete and production-ready!** 🚀
