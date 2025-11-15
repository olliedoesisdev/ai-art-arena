# ⏱️ Contest Components Documentation

**AI Art Arena - Interactive Contest Components**

Real-time countdown timer and interactive vote button with multiple states.

---

## 📂 Component Structure

```
src/components/contest/
├── ContestTimer.tsx    # Live countdown timer
├── VoteButton.tsx      # Interactive vote button
└── index.ts            # Central exports
```

---

## ⏱️ ContestTimer Component

**File:** `src/components/contest/ContestTimer.tsx`

### Features

- ✅ **Client Component** - Live updates with `"use client"`
- ✅ **Live Countdown** - Updates every second
- ✅ **Dual Formats** - Compact and full display
- ✅ **Urgent Styling** - Red when < 24 hours
- ✅ **Expired State** - Shows "Contest Ended" badge
- ✅ **onExpire Callback** - Triggers when timer ends
- ✅ **Clock Icon** - From lucide-react
- ✅ **Smooth Animations** - Tabular nums for flicker-free updates
- ✅ **Automatic Cleanup** - Clears interval on unmount

### Props

```typescript
interface ContestTimerProps {
  endDate: string | Date;      // Contest end date
  onExpire?: () => void;        // Callback when expired
  className?: string;           // Additional CSS classes
  compact?: boolean;            // Show compact format
}
```

### Usage Examples

**Full Format (Default)**

```tsx
import { ContestTimer } from "@/components/contest";

<ContestTimer
  endDate={contest.end_date}
  onExpire={() => console.log("Contest ended!")}
/>
```

Output:
```
[Clock] 03 : 14 : 23 : 45
       days hours mins secs
```

**Compact Format**

```tsx
<ContestTimer
  endDate={contest.end_date}
  compact
/>
```

Output:
```
[Clock] 3d 14h 23m
```

**Expired State**

```
[Clock] [Contest Ended]
```

### Visual States

**Normal (> 24 hours)**
```
┌────────────────────────────────────┐
│ [Clock] 03 : 14 : 23 : 45         │
│        days hours mins secs        │
└────────────────────────────────────┘
```

**Urgent (< 24 hours) - Red Styling**
```
┌────────────────────────────────────┐
│ [Clock] 00 : 18 : 45 : 32  ⚠️     │
│        days hours mins secs        │
│        (All text in red)           │
└────────────────────────────────────┘
```

**Expired**
```
┌────────────────────────────────────┐
│ [Clock] [Contest Ended]            │
└────────────────────────────────────┘
```

### Code Details

**Timer Logic**

```tsx
React.useEffect(() => {
  const interval = setInterval(() => {
    const remaining = getTimeRemaining(endDate);
    setTimeLeft(remaining);

    if (remaining.hasEnded) {
      onExpire?.();
      clearInterval(interval);
    }
  }, 1000);

  return () => clearInterval(interval);
}, [endDate, onExpire]);
```

**Urgent State Detection**

```tsx
const isUrgent = timeLeft.total < 24 * 60 * 60 * 1000; // 24 hours
```

**Number Formatting**

```tsx
const formatUnit = (value: number): string => {
  return value.toString().padStart(2, "0"); // "03" instead of "3"
};
```

### Styling Classes

**Normal State:**
- Clock: `text-muted-foreground`
- Numbers: `text-foreground`

**Urgent State (< 24 hours):**
- Clock: `text-error`
- Numbers: `text-error`
- All text styled in red

**Typography:**
- Numbers: `text-2xl font-bold tabular-nums`
- Labels: `text-xs text-muted-foreground`
- Compact: `text-sm font-medium`

---

## 👍 VoteButton Component

**File:** `src/components/contest/VoteButton.tsx`

### Features

- ✅ **Client Component** - Interactive with `"use client"`
- ✅ **Three States** - Can vote, Has voted, Cooldown
- ✅ **State Icons** - ThumbsUp, Check, Clock
- ✅ **Loading State** - Spinner during submission
- ✅ **Optimistic Updates** - Instant vote count change
- ✅ **Cooldown Timer** - Live countdown display
- ✅ **Vote Count Display** - Shows current votes
- ✅ **Error Recovery** - Reverts optimistic update on failure
- ✅ **Smooth Animations** - Transitions between states

### Props

```typescript
interface VoteButtonProps {
  artworkId: string;            // Artwork to vote for
  currentVotes: number;         // Current vote count
  onVote: (id: string) => Promise<void> | void;
  disabled?: boolean;           // Disable button
  cooldownEndsAt?: Date | null; // Cooldown end time
  hasVoted?: boolean;           // User already voted
  className?: string;           // Additional classes
  showVoteCount?: boolean;      // Display vote count
  size?: "sm" | "md" | "lg";   // Button size
}
```

### Usage Examples

**Can Vote State**

```tsx
import { VoteButton } from "@/components/contest";

<VoteButton
  artworkId="artwork-123"
  currentVotes={42}
  onVote={handleVote}
  hasVoted={false}
/>
```

Output:
```
[ThumbsUp Vote]  42
                votes
```

**Has Voted State**

```tsx
<VoteButton
  artworkId="artwork-123"
  currentVotes={43}
  onVote={handleVote}
  hasVoted={true}
/>
```

Output:
```
[Check Voted]  43
              votes
```

**Cooldown State**

```tsx
<VoteButton
  artworkId="artwork-123"
  currentVotes={42}
  onVote={handleVote}
  cooldownEndsAt={new Date(Date.now() + 3600000)}
/>
```

Output:
```
[Clock Vote in 59m 30s]  42
                        votes
```

**Loading State**

```tsx
<VoteButton
  artworkId="artwork-123"
  currentVotes={42}
  onVote={handleVote}
  // During voting...
/>
```

Output:
```
[Spinner Vote]  42
               votes
```

### Visual States

**1. Can Vote (Primary Button)**
```
┌─────────────────┬──────┐
│ [👍] Vote       │  42  │
│                 │votes │
└─────────────────┴──────┘
 Primary variant   Count
```

**2. Has Voted (Secondary Button)**
```
┌─────────────────┬──────┐
│ [✓] Voted       │  43  │ ← Count increased
│                 │votes │
└─────────────────┴──────┘
 Secondary variant  Purple text
```

**3. Cooldown (Outline Button)**
```
┌─────────────────────┬──────┐
│ [🕐] Vote in 2h 30m │  42  │
│                     │votes │
└─────────────────────┴──────┘
 Outline variant      Count
```

**4. Loading (Primary with Spinner)**
```
┌─────────────────┬──────┐
│ [⟳] Vote        │  42  │
│                 │votes │
└─────────────────┴──────┘
 Spinner animating   Count
```

### State Logic

```tsx
const getButtonState = () => {
  if (hasVoted) {
    return {
      variant: "secondary",
      icon: Check,
      text: "Voted",
      clickable: false,
    };
  }

  if (isInCooldown && timeRemaining) {
    return {
      variant: "outline",
      icon: Clock,
      text: `Vote in ${timeRemaining}`,
      clickable: false,
    };
  }

  return {
    variant: "primary",
    icon: ThumbsUp,
    text: "Vote",
    clickable: true,
  };
};
```

### Optimistic Updates

```tsx
const handleVote = async () => {
  try {
    // Optimistic update
    setLocalVotes((prev) => prev + 1);

    // API call
    await onVote(artworkId);
  } catch (error) {
    // Revert on error
    setLocalVotes(currentVotes);
  }
};
```

### Cooldown Timer

```tsx
React.useEffect(() => {
  const updateCooldown = () => {
    const diff = end.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      setTimeRemaining(`${hours}h ${minutes}m`);
    } else if (minutes > 0) {
      setTimeRemaining(`${minutes}m ${seconds}s`);
    } else {
      setTimeRemaining(`${seconds}s`);
    }
  };

  const interval = setInterval(updateCooldown, 1000);
  return () => clearInterval(interval);
}, [cooldownEndsAt]);
```

### Button Variants

| State | Variant | Icon | Clickable | Color |
|-------|---------|------|-----------|-------|
| Can Vote | primary | ThumbsUp | ✅ | Purple |
| Has Voted | secondary | Check | ❌ | Teal |
| Cooldown | outline | Clock | ❌ | Border |
| Loading | primary | Spinner | ❌ | Purple |

---

## 📦 Easy Imports

```tsx
import { ContestTimer, VoteButton } from "@/components/contest";
import type { ContestTimerProps, VoteButtonProps } from "@/components/contest";
```

---

## 💡 Usage Patterns

### Complete Artwork Card

```tsx
import { Card, CardContent } from "@/components/ui";
import { ContestTimer, VoteButton } from "@/components/contest";

function ArtworkCard({ artwork, contest, hasVoted, cooldownEndsAt }) {
  const handleVote = async (artworkId: string) => {
    const response = await fetch("/api/vote", {
      method: "POST",
      body: JSON.stringify({ artworkId, contestId: contest.id }),
    });

    if (!response.ok) throw new Error("Vote failed");
  };

  return (
    <Card>
      <CardContent>
        <img src={artwork.image_url} alt={artwork.title} />
        <h3>{artwork.title}</h3>

        <VoteButton
          artworkId={artwork.id}
          currentVotes={artwork.vote_count}
          onVote={handleVote}
          hasVoted={hasVoted}
          cooldownEndsAt={cooldownEndsAt}
        />
      </CardContent>
    </Card>
  );
}
```

### Contest Header

```tsx
function ContestHeader({ contest }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1>Week {contest.week_number} Contest</h1>
        <p>{contest.description}</p>
      </div>

      <ContestTimer
        endDate={contest.end_date}
        onExpire={() => {
          // Refresh page or show ended state
          window.location.reload();
        }}
      />
    </div>
  );
}
```

### Vote Flow with Cooldown

```tsx
"use client";

import { useState } from "react";
import { VoteButton } from "@/components/contest";
import { setVoteCooldown } from "@/lib/utils";

function VotingInterface({ artwork, contestId }) {
  const [hasVoted, setHasVoted] = useState(false);
  const [cooldownEndsAt, setCooldownEndsAt] = useState<Date | null>(null);

  const handleVote = async (artworkId: string) => {
    await fetch("/api/vote", {
      method: "POST",
      body: JSON.stringify({ artworkId, contestId }),
    });

    // Set local state
    setHasVoted(true);

    // Set cooldown (24 hours)
    const cooldownEnd = setVoteCooldown(contestId);
    setCooldownEndsAt(cooldownEnd);
  };

  return (
    <VoteButton
      artworkId={artwork.id}
      currentVotes={artwork.vote_count}
      onVote={handleVote}
      hasVoted={hasVoted}
      cooldownEndsAt={cooldownEndsAt}
    />
  );
}
```

---

## 🎨 Styling Customization

### Timer Colors

```tsx
// Custom urgent threshold (12 hours instead of 24)
const isUrgent = timeLeft.total < 12 * 60 * 60 * 1000;

// Custom urgent color
<span className={cn(isUrgent ? "text-warning" : "text-foreground")}>
```

### Vote Button Sizes

```tsx
// Small button
<VoteButton size="sm" {...props} />

// Large button
<VoteButton size="lg" {...props} />

// Without vote count
<VoteButton showVoteCount={false} {...props} />
```

---

## 🔧 Advanced Features

### ContestTimer Auto-Refresh

```tsx
<ContestTimer
  endDate={contest.end_date}
  onExpire={() => {
    // Trigger refetch or navigate
    router.refresh();
  }}
/>
```

### VoteButton Error Handling

```tsx
const handleVote = async (artworkId: string) => {
  try {
    await submitVote(artworkId);
  } catch (error) {
    // Show error toast
    toast.error("Failed to vote. Please try again.");
    throw error; // VoteButton will revert optimistic update
  }
};
```

### Multiple Vote Buttons

```tsx
{artworks.map((artwork) => (
  <VoteButton
    key={artwork.id}
    artworkId={artwork.id}
    currentVotes={artwork.vote_count}
    onVote={handleVote}
    hasVoted={votedArtworkId === artwork.id}
    disabled={votedArtworkId !== null && votedArtworkId !== artwork.id}
  />
))}
```

---

## ⚡ Performance

### Timer Optimization

- Uses `tabular-nums` for flicker-free updates
- Single interval, cleared on unmount
- Updates only when mounted
- Memoized calculations

### Vote Button Optimization

- Optimistic updates for instant feedback
- Debounced cooldown calculations
- Local state management
- Automatic error recovery

---

## ♿ Accessibility

### ContestTimer

- ✅ Semantic time display
- ✅ Clear visual hierarchy
- ✅ High contrast for urgent state
- ✅ Screen reader friendly numbers

### VoteButton

- ✅ Clear button states
- ✅ Disabled states properly marked
- ✅ Loading state indication
- ✅ Icon + text labels
- ✅ Keyboard accessible

---

## 📊 Component Stats

| Component | Type | Lines | Features |
|-----------|------|-------|----------|
| ContestTimer | Client | ~200 | Live countdown, dual formats, urgent state |
| VoteButton | Client | ~185 | 3 states, optimistic updates, cooldown |

**Total:** ~385 lines, 3 files

---

## ✅ Checklist

- [x] ContestTimer with live updates
- [x] Dual timer formats (full & compact)
- [x] Red styling when < 24 hours
- [x] "Contest Ended" badge
- [x] VoteButton with 3 states
- [x] ThumbsUp, Check, Clock icons
- [x] Loading state with spinner
- [x] Optimistic vote count updates
- [x] Cooldown countdown display
- [x] Error recovery
- [x] Smooth animations
- [x] TypeScript types
- [x] Client components
- [x] Compilation passes

---

**Contest components complete and production-ready!** 🚀
