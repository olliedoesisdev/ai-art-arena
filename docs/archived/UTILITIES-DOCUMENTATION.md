# 🛠️ Utility Functions Documentation

**AI Art Arena - Comprehensive Utility Library**

Complete utility functions for styling, dates, and voting logic.

---

## 📂 File Structure

```
src/lib/utils/
├── cn.ts         # Class name merging utility
├── date.ts       # Date formatting and time utilities
├── voting.ts     # Voting cooldown and tracking
└── index.ts      # Central export point
```

---

## 🎨 Class Name Utilities (`cn.ts`)

### `cn(...inputs: ClassValue[]): string`

Merges Tailwind CSS class names with proper precedence using `clsx` and `tailwind-merge`.

**Use Cases:**
- Conditional styling
- Component prop class names
- Dynamic class application

**Examples:**

```typescript
import { cn } from "@/lib/utils";

// Basic merging
cn("px-2 py-1", "px-4") // => "py-1 px-4" (px-4 overrides px-2)

// Conditional classes
cn("base-class", isActive && "active-class", "other-class")

// Component with className prop
function Button({ className, ...props }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md bg-primary text-white",
        "hover:bg-primary-hover transition-colors",
        className
      )}
      {...props}
    />
  );
}
```

---

## 📅 Date Utilities (`date.ts`)

Uses `date-fns` for robust date manipulation and formatting.

### Formatting Functions

#### `formatDate(date: string | Date): string`

Format as short date: **"MMM d, yyyy"**

```typescript
formatDate("2024-11-13") // => "Nov 13, 2024"
formatDate(new Date())   // => "Nov 13, 2024"
```

#### `formatDateTime(date: string | Date): string`

Format with time: **"MMM d, yyyy h:mm a"**

```typescript
formatDateTime("2024-11-13T14:30:00") // => "Nov 13, 2024 2:30 PM"
```

#### `formatLongDate(date: string | Date): string`

Format as long date: **"MMMM d, yyyy"**

```typescript
formatLongDate("2024-11-13") // => "November 13, 2024"
```

#### `formatTime(date: string | Date): string`

Format time only: **"h:mm a"**

```typescript
formatTime("2024-11-13T14:30:00") // => "2:30 PM"
```

#### `formatRelativeTime(date: string | Date): string`

Format as relative time from now.

```typescript
formatRelativeTime("2024-11-10") // => "3 days ago"
formatRelativeTime("2024-11-15") // => "in 2 days"
```

### Time Checking Functions

#### `isExpired(date: string | Date): boolean`

Check if a date has passed.

```typescript
isExpired("2024-11-10") // => true (if current date is after)
isExpired("2024-11-20") // => false (if current date is before)
```

#### `isValidDate(date: string | Date): boolean`

Validate date string or object.

```typescript
isValidDate("2024-11-13")  // => true
isValidDate("invalid")     // => false
```

### Time Remaining Functions

#### `getTimeRemaining(endDate: string | Date): TimeRemaining`

Get detailed time breakdown until an end date.

```typescript
interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;      // Total milliseconds
  hasEnded: boolean;
}

getTimeRemaining("2024-11-16T00:00:00")
// => {
//   days: 3,
//   hours: 14,
//   minutes: 23,
//   seconds: 45,
//   total: 294225000,
//   hasEnded: false
// }
```

#### `formatCountdown(endDate: string | Date): string`

Format as compact countdown string.

```typescript
formatCountdown("2024-11-16T14:30:00") // => "3d 14h 23m"
formatCountdown("2024-11-13T16:30:00") // => "2h 45m"
formatCountdown("2024-11-13T14:05:00") // => "5m 30s"
formatCountdown("2024-11-10T00:00:00") // => "Ended"
```

#### `formatCountdownLong(endDate: string | Date): string`

Format as full countdown with words.

```typescript
formatCountdownLong("2024-11-16T14:30:00") // => "3 days 14 hours 23 minutes"
formatCountdownLong("2024-11-13T16:30:00") // => "2 hours 45 minutes"
```

### Date Manipulation

#### `addHoursToDate(date: string | Date, hours: number): Date`

Add hours to a date.

```typescript
addHoursToDate("2024-11-13T14:00:00", 24)
// => Date 24 hours later
```

#### `getHoursBetween(startDate, endDate): number`

Get hours between two dates.

```typescript
getHoursBetween(
  "2024-11-13T14:00:00",
  "2024-11-14T14:00:00"
) // => 24
```

### Other Utilities

#### `formatISODate(isoString: string): string`

Format ISO string for display.

```typescript
formatISODate("2024-11-13T14:30:00.000Z") // => "Nov 13, 2024 2:30 PM"
```

#### `getCurrentTimestamp(): string`

Get current time as ISO string.

```typescript
getCurrentTimestamp() // => "2024-11-13T14:30:00.000Z"
```

---

## 🗳️ Voting Utilities (`voting.ts`)

Handles user identification, cooldown management, and vote tracking.

### User Identification

#### `generateUserIdentifier(ip: string, userAgent: string): Promise<string>`

Generate privacy-preserving SHA-256 hash for user identification.

```typescript
// Client-side
const identifier = await generateUserIdentifier(
  "192.168.1.1",
  navigator.userAgent
);
// => "a1b2c3d4e5f6..."

// Server-side
const identifier = await generateUserIdentifier(
  request.headers.get("x-forwarded-for"),
  request.headers.get("user-agent")
);
```

### Cooldown Management

#### `setVoteCooldown(contestId: string): Date`

Set 24-hour cooldown in localStorage.

```typescript
setVoteCooldown("contest-123")
// => Date (24 hours from now)
// Stores in localStorage: "vote_cooldown_contest-123"
```

#### `getVoteCooldown(contestId: string): Date | null`

Get cooldown end date from localStorage.

```typescript
getVoteCooldown("contest-123")
// => Date or null if not set
```

#### `clearVoteCooldown(contestId: string): void`

Clear cooldown from localStorage.

```typescript
clearVoteCooldown("contest-123")
// Removes from localStorage
```

#### `canVoteNow(contestId: string): boolean`

Check if user can vote (cooldown expired).

```typescript
canVoteNow("contest-123") // => true or false

// Automatically clears expired cooldowns
```

#### `getCooldownTimeRemaining(contestId: string): number`

Get milliseconds remaining in cooldown.

```typescript
getCooldownTimeRemaining("contest-123")
// => 3600000 (1 hour in milliseconds)
// => 0 (can vote)
```

#### `formatCooldownRemaining(contestId: string): string`

Format cooldown as human-readable string.

```typescript
formatCooldownRemaining("contest-123")
// => "2h 45m"
// => "15m"
// => "Can vote now"
```

### Vote Tracking

#### `storeUserVote(contestId: string, artworkId: string): void`

Store user's vote in localStorage.

```typescript
storeUserVote("contest-123", "artwork-456")
// Stores: { artworkId: "artwork-456", votedAt: "2024-11-13..." }
```

#### `getUserLastVote(contestId: string): object | null`

Get user's last vote for a contest.

```typescript
getUserLastVote("contest-123")
// => { artworkId: "artwork-456", votedAt: "2024-11-13T14:30:00Z" }
// => null if not found
```

#### `hasVotedForArtwork(contestId: string, artworkId: string): boolean`

Check if user voted for specific artwork.

```typescript
hasVotedForArtwork("contest-123", "artwork-456") // => true or false
```

### Vote Status

#### `getVoteStatus(contestId: string): object`

Get complete vote status for a contest.

```typescript
getVoteStatus("contest-123")
// => {
//   canVote: false,
//   cooldownEnd: Date,
//   timeRemaining: 3600000,
//   lastVote: { artworkId: "artwork-456", votedAt: "..." }
// }
```

### Validation

#### `validateVoteRequest(contestId: string, artworkId: string): object`

Validate vote request before submission.

```typescript
validateVoteRequest("contest-123", "artwork-456")
// => { isValid: true, error: null }
// => { isValid: false, error: "You can vote again in 2h 45m" }
```

### Cleanup

#### `clearAllVoteData(): void`

Clear all voting data from localStorage (useful for testing).

```typescript
clearAllVoteData()
// Removes all keys starting with "vote_"
```

#### `getVoteCooldownKey(contestId: string): string`

Get localStorage key for cooldown (utility function).

```typescript
getVoteCooldownKey("contest-123")
// => "vote_cooldown_contest-123"
```

---

## 📦 Easy Imports

Import all utilities from a single location:

```typescript
// Import specific utilities
import { cn, formatDate, canVoteNow } from "@/lib/utils";

// Import multiple utilities
import {
  formatCountdown,
  getTimeRemaining,
  setVoteCooldown,
  validateVoteRequest
} from "@/lib/utils";

// Type imports
import type { TimeRemaining } from "@/lib/utils";
```

---

## 💡 Common Usage Patterns

### Voting Flow

```typescript
import {
  canVoteNow,
  setVoteCooldown,
  storeUserVote,
  validateVoteRequest
} from "@/lib/utils";

async function handleVote(contestId: string, artworkId: string) {
  // 1. Validate vote
  const validation = validateVoteRequest(contestId, artworkId);
  if (!validation.isValid) {
    alert(validation.error);
    return;
  }

  // 2. Submit vote to API
  const response = await fetch("/api/vote", {
    method: "POST",
    body: JSON.stringify({ contestId, artworkId })
  });

  if (response.ok) {
    // 3. Set cooldown
    setVoteCooldown(contestId);

    // 4. Store vote locally
    storeUserVote(contestId, artworkId);

    alert("Vote recorded!");
  }
}
```

### Contest Timer

```typescript
import { getTimeRemaining, formatCountdown } from "@/lib/utils";

function ContestTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState(formatCountdown(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeRemaining(endDate);

      if (remaining.hasEnded) {
        clearInterval(timer);
        setTimeLeft("Contest Ended");
      } else {
        setTimeLeft(formatCountdown(endDate));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return <div>Ends in: {timeLeft}</div>;
}
```

### Vote Button State

```typescript
import { canVoteNow, formatCooldownRemaining } from "@/lib/utils";

function VoteButton({ contestId, artworkId }: Props) {
  const canVote = canVoteNow(contestId);
  const cooldownText = formatCooldownRemaining(contestId);

  return (
    <button disabled={!canVote}>
      {canVote ? "Vote" : `Vote again in ${cooldownText}`}
    </button>
  );
}
```

### Dynamic Styling

```typescript
import { cn } from "@/lib/utils";

function ArtworkCard({ artwork, isWinner, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all",
        isWinner && "border-primary shadow-lg",
        "hover:shadow-md cursor-pointer",
        className
      )}
    >
      {/* ... */}
    </div>
  );
}
```

---

## ✅ Testing Examples

### Testing Date Functions

```typescript
import { formatDate, getTimeRemaining, isExpired } from "@/lib/utils";

// Date formatting
console.log(formatDate("2024-11-13")); // "Nov 13, 2024"

// Time remaining
const remaining = getTimeRemaining("2024-11-20T00:00:00");
console.log(remaining.days); // 7

// Expiration check
console.log(isExpired("2024-11-10")); // true
```

### Testing Voting Functions

```typescript
import {
  setVoteCooldown,
  canVoteNow,
  getVoteStatus
} from "@/lib/utils";

// Set cooldown
setVoteCooldown("test-contest");

// Check if can vote
console.log(canVoteNow("test-contest")); // false

// Get full status
const status = getVoteStatus("test-contest");
console.log(status.timeRemaining); // ~86400000 (24 hours)
```

---

## 🔒 Security Notes

### User Identification

- Uses SHA-256 hashing for privacy
- Combines IP + User Agent for uniqueness
- Hashed identifier cannot be reversed
- Works in both browser and Node.js

### LocalStorage Safety

- All functions check for `window` existence
- Error handling for quota exceeded
- Automatic cleanup of expired data
- Safe for server-side rendering

---

## 📊 Utility Statistics

| File | Lines | Functions | Purpose |
|------|-------|-----------|---------|
| `cn.ts` | 15 | 1 | Class name merging |
| `date.ts` | 280+ | 16 | Date formatting & manipulation |
| `voting.ts` | 340+ | 15 | Vote tracking & cooldowns |
| `index.ts` | 45 | - | Central exports |

**Total:** 680+ lines, 32 utility functions

---

## 🎯 Key Features

✅ **Type Safe**: Full TypeScript support
✅ **Well Tested**: Error handling throughout
✅ **Browser + Server**: Works in both environments
✅ **Well Documented**: JSDoc comments for all functions
✅ **Easy Import**: Single import location
✅ **Privacy Focused**: SHA-256 hashing for user IDs
✅ **Production Ready**: Comprehensive error handling

---

**Utility library complete and ready for use!** 🚀
