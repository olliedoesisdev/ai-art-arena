# Contest Setup Instructions

This guide will help you set up an active contest with your local images to display on the contest page.

## Problem Summary

The contest page was showing the error:
```
invalid input syntax for type uuid: "undefined"
```

This was caused by a mismatch between:
1. The database function `get_active_contest()` returning `id` field
2. The TypeScript types expecting `contest_id` field
3. The API route trying to use the wrong field name

## Fixes Applied

### 1. Updated Database Function
The `get_active_contest()` function in [supabase-schema.sql](supabase-schema.sql) has been updated to return the correct fields that match the TypeScript types:
- `contest_id` (aliased from `id`)
- `week_number`
- `start_date`
- `end_date`
- `time_remaining` (calculated)

### 2. Updated API Route
The API route in [src/app/api/contests/active/route.ts](src/app/api/contests/active/route.ts) now correctly uses `contest.contest_id`.

## Setup Steps

Follow these steps in order:

### Step 1: Update the Database Function

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy the updated function from [supabase-schema.sql](supabase-schema.sql) lines 75-99
4. Run this SQL:

```sql
-- Function to get active contest
CREATE OR REPLACE FUNCTION get_active_contest()
RETURNS TABLE (
  contest_id UUID,
  week_number INTEGER,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  time_remaining INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as contest_id,
    c.week_number,
    c.start_date,
    c.end_date,
    (c.end_date - NOW()) as time_remaining
  FROM contests c
  WHERE c.status = 'active'
    AND c.start_date <= NOW()
    AND c.end_date > NOW()
  ORDER BY c.start_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

### Step 2: Create an Active Contest with Local Images

1. Still in the Supabase SQL Editor
2. Open [setup-active-contest-local-images.sql](setup-active-contest-local-images.sql)
3. **First**, run the contest creation query (lines 9-15):

```sql
INSERT INTO contests (week_number, start_date, end_date, status)
VALUES (
  1,
  NOW(),
  NOW() + INTERVAL '7 days',
  'active'
)
RETURNING id;
```

4. **Copy the returned UUID** (the contest ID)
5. **Replace** all instances of `'PASTE_CONTEST_ID_HERE'` in the artworks INSERT query with your copied UUID
6. **Run** the artworks INSERT query (lines 20-71)
7. **Run** the verification queries at the end to confirm everything worked

### Step 3: Verify the Setup

1. Your Next.js dev server should be running (`npm run dev`)
2. Visit `http://localhost:3000/contest`
3. You should now see:
   - The active contest header
   - A countdown timer
   - A grid of 6 artworks with your local images
   - Vote buttons on each artwork

## Your Local Images

The contest will display these 6 images from `public/images/contests/`:
- artwork1.jpg - "Mystic Landscape"
- artwork2.jpg - "Digital Dreams"
- artwork3.jpg - "Cosmic Wonder"
- artwork4.jpg - "Nature Fusion"
- artwork5.jpg - "Urban Symphony"
- artwork6.jpg - "Abstract Harmony"

## Troubleshooting

### If you still see the UUID error:
- Make sure you ran the updated `get_active_contest()` function in Step 1
- Clear your browser cache and refresh

### If no contest appears:
- Check that the contest `status` is set to `'active'`
- Verify the `start_date` is in the past and `end_date` is in the future
- Run the verification query from the SQL file

### If images don't load:
- Verify the images exist in `public/images/contests/`
- Check the browser console for 404 errors
- Ensure the `image_url` paths start with `/images/contests/`

## Next Steps

After the contest is set up:
- Test the voting functionality
- Check the archive page at `/archive`
- Access the admin panel at `/admin` to manage contests

## Need Help?

If you encounter any issues, check:
1. Supabase logs in the Dashboard
2. Browser console for client-side errors
3. Terminal where Next.js is running for server-side errors
