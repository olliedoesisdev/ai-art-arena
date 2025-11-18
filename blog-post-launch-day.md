# From Chaos to Clarity: The Journey to Launch AI Art Arena

**Meta Title:** Launching AI Art Arena: A Dev Journey Through Authentication, Schema Fixes, and TypeScript Battles

**Meta Description:** A technical deep-dive into the challenges we faced launching AI Art Arena - from implementing passwordless authentication to fixing database schema issues and resolving 58+ TypeScript errors.

**Excerpt:** What does it take to launch a web app in 2025? Join me on a wild ride through Supabase authentication, database schema refactoring, and the TypeScript errors that nearly broke me. Spoiler: We made it.

**Category:** Development

**Tags:** Next.js, Supabase, TypeScript, Authentication, Database Design, DevOps

**Status:** draft

**Has FAQ:** true

**FAQ Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do you implement passwordless authentication with Supabase?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use Supabase's signInWithOtp() method to send a magic link to the user's email. When they click the link, they're redirected to a callback route where you exchange the code for a session using exchangeCodeForSession(). This eliminates the need for password management while maintaining security."
      }
    },
    {
      "@type": "Question",
      "name": "Why doesn't Supabase TypeScript support schema-qualified table names?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Supabase's TypeScript client from() method expects just the table name (like 'blog_posts'), not schema-qualified names (like 'admin.blog_posts'). This is by design - Supabase uses Row Level Security (RLS) policies to handle access control instead of schema separation, which works seamlessly with the generated TypeScript types."
      }
    },
    {
      "@type": "Question",
      "name": "What is Row Level Security (RLS) and why use it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Row Level Security (RLS) is a PostgreSQL feature that allows you to define policies controlling which rows users can access in a table. Instead of using separate database schemas for security isolation, RLS policies provide fine-grained access control while keeping all tables in the public schema. This approach works better with Supabase's TypeScript client and is the recommended pattern."
      }
    },
    {
      "@type": "Question",
      "name": "How do you handle multiple environments in Next.js with Vercel?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Create an environment detection utility that checks for window.location.origin on the client side, uses VERCEL_URL environment variable on the server side in production, and falls back to NEXT_PUBLIC_SITE_URL or localhost:3000 for development. This ensures your app works correctly across local development, production, and Vercel preview deployments."
      }
    },
    {
      "@type": "Question",
      "name": "How do you fix TypeScript errors with Supabase generated types?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Extend the generated types instead of redefining them. For example, use 'interface Contest extends ContestRow' to add custom properties while preserving the generated type structure. This ensures type safety and prevents mismatches between your code and the database schema."
      }
    },
    {
      "@type": "Question",
      "name": "What's the best way to handle Node.js port conflicts during development?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "On Windows, use 'taskkill /F /IM node.exe' to kill all Node processes, remove the .next/dev/lock file, and restart your dev server. This clears stale processes from previous sessions that may be occupying the port. On Unix systems, use 'killall node' or find the specific process with 'lsof -i :3000'."
      }
    },
    {
      "@type": "Question",
      "name": "What are the benefits of magic link authentication over passwords?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Magic link authentication eliminates password management complexity for both users and developers. Users don't need to remember passwords or go through password reset flows. Developers don't need to implement password hashing, validation, or reset functionality. It reduces friction in the signup process while maintaining security through email verification."
      }
    },
    {
      "@type": "Question",
      "name": "How do you create an auth callback route in Next.js App Router?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Create a route.ts file at app/auth/callback/route.ts that exports a GET function. Extract the code parameter from the URL, use supabase.auth.exchangeCodeForSession(code) to get the user session, create a user record in your database if needed, and redirect to your app. This handles the OAuth-like flow for magic link authentication."
      }
    }
  ]
}
```

---

## The Mission: Make Voting Frictionless

Today started with a simple goal: **make it dead simple for anyone to vote on AI-generated artwork**. No passwords to remember, no complicated forms—just an email address and you're in.

Sounds easy, right? Well...

## Act I: Passwordless Authentication (Or: How I Learned to Love Magic Links)

The first challenge was implementing **passwordless authentication** using Supabase. The idea was beautiful in its simplicity:

1. User enters their email
2. They get a magic link
3. Click the link, boom—authenticated

But as with all "simple" ideas in software development, the devil was in the details.

### The Auth Flow Refactor

I had to completely overhaul the authentication system. Here's what changed:

**Before:**
```typescript
// Traditional password-based auth
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

**After:**
```typescript
// Magic link authentication
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`
  }
});
```

### The Callback Dance

The tricky part? Handling the magic link callback. When users click the link in their email, they're redirected back with a `code` parameter that needs to be exchanged for a session.

I created a new route at [src/app/auth/callback/route.ts](src/app/auth/callback/route.ts) that:

1. Extracts the code from the URL
2. Exchanges it for a session using `exchangeCodeForSession()`
3. Creates a user record in our `public_users` table if needed
4. Redirects them to the contest page

```typescript
const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

if (!error && user) {
  // Check if user exists in our public_users table
  const { data: publicUser } = await supabase
    .from('public_users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!publicUser) {
    // Create user record
    await supabase.from('public_users').insert({
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || null,
    });
  }
}
```

## Act II: The Great Schema Catastrophe

Just when I thought we were making progress, I hit a wall. A **TypeScript-shaped wall**.

### The Admin Schema Illusion

Initially, I thought I was being clever. "Let's use a separate `admin` schema for all the blog and admin tables," I thought. "It'll be more organized!"

So I spent hours updating **13 files** with references like:
```typescript
supabase.from('admin.blog_posts')
supabase.from('admin.blog_categories')
```

### The TypeScript Rebellion

Then came the build:

```
Type error: Argument of type '"admin.blog_posts"' is not assignable to parameter of type 'TableName'
```

**58 errors.** Fifty. Eight.

Turns out, Supabase's TypeScript client doesn't support schema-qualified table names. At all. The `from()` method expects just the table name, not `schema.table`.

### The Pivot: RLS to the Rescue

Here's where I had to make a crucial architectural decision. Instead of fighting TypeScript, I embraced **Row Level Security (RLS)**.

The revelation: **You don't need separate schemas when you have RLS policies.**

I reverted all the changes (thank god for scripts):

```javascript
// scripts/revert-admin-prefix.js
const replacements = [
  { from: /\.from\(['"`]admin\.blog_posts['"`]\)/g, to: ".from('blog_posts')" },
  { from: /\.from\(['"`]admin\.blog_categories['"`]\)/g, to: ".from('blog_categories')" },
  // ... and so on
];
```

**Result:**
- 13 files updated
- 58 changes reverted
- All tables in `public` schema
- Security handled by RLS policies

```sql
-- RLS ensures only admins can write
CREATE POLICY "Admin write access"
ON blog_posts FOR INSERT
TO authenticated
USING (is_admin(auth.uid()));

-- Public can read published posts
CREATE POLICY "Public read published"
ON blog_posts FOR SELECT
USING (status = 'published');
```

## Act III: TypeScript Whack-a-Mole

With the schema issues resolved, I still had a handful of TypeScript errors to squash:

### Error #1: The Contest Type Mismatch

```typescript
// src/app/contest/page.tsx
// Before: Redefining everything
interface Contest {
  id: string;
  title: string;
  // ... 10 more fields
}

// After: Extend the generated type
interface Contest extends ContestRow {
  time_remaining?: string; // Just add what we need
}
```

### Error #2: The JSX Namespace Mystery

```typescript
// Before: TypeScript couldn't find JSX
const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

// After: Explicit union type
const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
```

### Error #3: The Heading Classes Index

```typescript
// Before: TypeScript feared the unknown
const className = headingClasses[node.attrs.level];

// After: Proper Record type with fallback
const headingClasses: Record<number, string> = {
  1: 'text-3xl font-bold text-white mb-6 mt-8',
  2: 'text-2xl font-bold text-white mb-4 mt-6',
  3: 'text-xl font-semibold text-white mb-3 mt-4',
};
const className = headingClasses[node.attrs.level as number] || 'text-lg';
```

## Act IV: Environment Configuration Hell

Deploying to production meant dealing with **three different environments**:

1. **Local Development:** `http://localhost:3000`
2. **Production:** `https://olliedoesis.dev`
3. **Vercel Previews:** `https://ai-art-arena-*.vercel.app`

I created an environment detection utility at [src/lib/env.ts](src/lib/env.ts):

```typescript
export function getBaseUrl() {
  // Client-side: use window.location
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side production: use Vercel URL
  if (process.env.VERCEL_URL && isProduction()) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback to configured URL or localhost
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  return 'http://localhost:3000';
}
```

### The Port 3000 Battle

Right before launch, disaster struck: **port 3000 was in use**.

```bash
Port 3000 is in use, trying 3001 instead
```

Multiple Node.js processes were running from previous dev sessions. The fix:

```bash
# Kill all Node processes (Windows)
taskkill /F /IM node.exe

# Remove stale lock file
rm .next/dev/lock

# Start fresh
npm run dev
```

**Victory:** Site back on `localhost:3000` where it belongs.

## The Final Push: Git Commit & Deploy

After hours of refactoring, error-fixing, and troubleshooting, it all came down to this:

```bash
git add .
git commit -m "Fix blog schema and resolve all TypeScript build errors

- Clarified schema approach (public schema + RLS)
- Updated 13 files to remove admin. prefix
- Fixed TypeScript build errors
- Build now compiles successfully

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

```
✓ Compiled successfully in 51s
✓ No TypeScript errors
✓ Ready for deployment
```

## Lessons Learned

### 1. **Trust the Framework**
Supabase uses RLS for a reason. Don't fight it with custom schema separation unless you have a very specific need.

### 2. **Generated Types Are Your Friend**
When using Supabase with TypeScript, trust the generated types. Extend them, don't redefine them.

### 3. **Environment Detection Matters**
In a world of serverless deployments and preview URLs, you need smart environment detection from day one.

### 4. **Kill Your Processes**
Always clean up dev processes. That port conflict at 4 PM will haunt you.

### 5. **Document Everything**
I created these guides during development:
- `COMPLETE-SETUP-GUIDE.md`
- `AUTH-SETUP.md`
- `ENVIRONMENT-SETUP.md`
- `SCHEMA-FIX-COMPLETE.md`

Future me will thank present me.

## The Tech Stack

For those keeping score at home:

- **Framework:** Next.js 16.0.3 (App Router + Turbopack)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Magic Links)
- **Deployment:** Vercel
- **Language:** TypeScript
- **Styling:** Tailwind CSS

## What's Next?

The site is live at [olliedoesis.dev](https://olliedoesis.dev), but the work never stops:

1. ✅ Passwordless authentication
2. ✅ Database schema with RLS
3. ✅ TypeScript errors resolved
4. ✅ Multi-environment support
5. 🔲 Supabase email confirmation disabled
6. 🔲 Production auth redirect URLs configured
7. 🔲 Blog schema applied to production database
8. 🔲 First community vote!

## The Moral of the Story

Software development is rarely a straight line from problem to solution. It's more like:

```
Problem → Solution → Compile Error →
Different Solution → Schema Error →
Complete Refactor → 58 TypeScript Errors →
Revert Everything → RLS Epiphany →
Port Conflict → Success! 🎉
```

But that's what makes it fun. Every error is a chance to learn something new, every refactor makes the codebase cleaner, and every successful deploy feels like a small victory.

Today, we launched AI Art Arena with passwordless authentication, a clean database architecture, and zero TypeScript errors.

Tomorrow? We'll probably break something new. And that's okay.

---

**Want to vote on AI-generated art?** Check out [AI Art Arena](https://olliedoesis.dev) and join the community!

**Follow the journey:** I'll be documenting more development stories right here on the blog.

*Questions? Thoughts? Found a bug? Let me know in the comments below!*
