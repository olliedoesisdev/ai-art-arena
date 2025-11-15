# Setting Up Your First Contest

You've got your 6 images ready in `public/images/contests/`! Here's how to set up the contest:

## Step 1: Customize Your Artwork Details

Before running the SQL, you'll want to customize each artwork entry. For each of the 6 artworks, update:

- **title**: Give it a catchy name (e.g., "Neon Cyberpunk City", "Ethereal Forest")
- **description**: Brief description of the artwork (1-2 sentences)
- **prompt**: The AI prompt you used to generate the image
- **style**: The style/theme (e.g., "Cyberpunk", "Fantasy", "Abstract", "Photorealistic")

## Step 2: Run the SQL Script

1. Open your Supabase Dashboard
2. Go to **SQL Editor** (left sidebar)
3. Open the file `setup-first-contest.sql`
4. Copy the **Step 1** section and run it first:
   ```sql
   INSERT INTO contests (title, week_number, year, start_date, end_date, status)
   VALUES (
     'AI Art Arena - Week 1',
     1,
     2025,
     NOW(),
     NOW() + INTERVAL '7 days',
     'active'
   )
   RETURNING id;
   ```
5. **Copy the returned UUID** (it will look like: `a1b2c3d4-e5f6-7890-1234-567890abcdef`)

6. Replace **ALL instances** of `'YOUR_CONTEST_ID_HERE'` in Step 2 with this UUID

7. Run the **Step 2** section (all 6 artwork inserts at once)

8. Run **Steps 3 & 4** to verify everything was created correctly

## Step 3: Test Your Site

Start your dev server:
```bash
npm run dev
```

Visit:
- Homepage: http://localhost:3000
- Contest page: http://localhost:3000/contest

You should see your 6 artworks ready for voting!

## Example Artwork Entry

Here's an example of how to fill out one artwork:

```sql
(
  'a1b2c3d4-e5f6-7890-1234-567890abcdef',  -- Your contest ID
  'Neon Dreams in Tokyo',                   -- Catchy title
  'A vibrant cyberpunk street scene with neon signs reflecting on wet pavement',  -- Description
  '/images/contests/artwork1.jpg',          -- Image path (don't change this)
  'A futuristic Tokyo street at night, neon signs, rain-slicked streets, cyberpunk aesthetic, vibrant colors, cinematic lighting',  -- Your AI prompt
  'Cyberpunk'                                -- Style/theme
),
```

## Need Help?

- Make sure all 6 images are in `public/images/contests/`
- Make sure you replaced ALL instances of `YOUR_CONTEST_ID_HERE`
- Check Supabase SQL Editor for any error messages
- Verify your database tables exist (run `supabase-schema.sql` first if needed)
