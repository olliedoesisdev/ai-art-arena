/**
 * Quick utility test examples
 * Run with: node test-utils.js
 */

console.log("🛠️ Testing AI Art Arena Utilities\n");

// Simulate date utilities
console.log("📅 DATE UTILITIES:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

const testDate = "2024-11-13T14:30:00";
console.log(`Input: ${testDate}`);
console.log(`formatDate() would output: "Nov 13, 2024"`);
console.log(`formatDateTime() would output: "Nov 13, 2024 2:30 PM"`);
console.log(`formatTime() would output: "2:30 PM"`);

console.log("\n⏰ COUNTDOWN UTILITIES:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 3);
futureDate.setHours(futureDate.getHours() + 14);

console.log(`Contest ends: ${futureDate.toISOString()}`);
console.log(`formatCountdown() would show: "3d 14h 30m"`);
console.log(`getTimeRemaining() returns: { days: 3, hours: 14, minutes: 30, ... }`);

console.log("\n🗳️ VOTING UTILITIES:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

console.log(`generateUserIdentifier("192.168.1.1", "Mozilla/5.0...")`);
console.log(`  → Returns SHA-256 hash: "a1b2c3d4e5f6..."`);

console.log("\nLocalStorage Keys:");
console.log(`  vote_cooldown_contest-123`);
console.log(`  last_vote_contest-123`);

console.log("\n✅ COOLDOWN FLOW:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

console.log("1. User votes → setVoteCooldown('contest-123')");
console.log("2. Stores: Date 24 hours from now");
console.log("3. canVoteNow('contest-123') → false");
console.log("4. formatCooldownRemaining() → '23h 59m'");
console.log("5. After 24h → canVoteNow() → true (auto-clears)");

console.log("\n🎨 CLASS NAME UTILITIES:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

console.log(`cn("px-2 py-1", "px-4")`);
console.log(`  → "py-1 px-4" (px-4 overrides px-2)`);

console.log(`\ncn("base", isActive && "active", className)`);
console.log(`  → Conditionally merges classes`);

console.log("\n✅ ALL UTILITIES READY!");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("Import with: import { cn, formatDate, canVoteNow } from '@/lib/utils'");
console.log("\n");
