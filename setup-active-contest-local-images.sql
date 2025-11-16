-- Setup Active Contest with Local Images
-- Run this in Supabase SQL Editor to create an active contest with your local artwork images

-- Step 1: Clear any existing active contests (optional - uncomment if needed)
-- UPDATE contests SET status = 'archived' WHERE status = 'active';

-- Step 2: Create a new active contest (active for 7 days)
INSERT INTO contests (week_number, start_date, end_date, status)
VALUES (
  1,
  NOW(),
  NOW() + INTERVAL '7 days',
  'active'
)
RETURNING id;

-- Step 3: Copy the contest ID from above and replace 'PASTE_CONTEST_ID_HERE' below

-- Step 4: Create artworks using your local images
INSERT INTO artworks (contest_id, title, description, image_url, prompt, artist_name, position)
VALUES
(
  'PASTE_CONTEST_ID_HERE',
  'Mystic Landscape',
  'A beautiful AI-generated landscape with mystical elements',
  '/images/contests/artwork1.jpg',
  'mystical landscape with ethereal lighting and surreal elements',
  'AI Artist 1',
  1
),
(
  'PASTE_CONTEST_ID_HERE',
  'Digital Dreams',
  'An abstract digital artwork exploring dreamlike states',
  '/images/contests/artwork2.jpg',
  'abstract digital art with flowing colors and dreamlike quality',
  'AI Artist 2',
  2
),
(
  'PASTE_CONTEST_ID_HERE',
  'Cosmic Wonder',
  'A cosmic scene featuring stars and nebulae',
  '/images/contests/artwork3.jpg',
  'cosmic scene with vibrant nebula and starfield',
  'AI Artist 3',
  3
),
(
  'PASTE_CONTEST_ID_HERE',
  'Nature Fusion',
  'A fusion of nature and technology in perfect harmony',
  '/images/contests/artwork4.jpg',
  'nature meets technology, organic forms with digital elements',
  'AI Artist 4',
  4
),
(
  'PASTE_CONTEST_ID_HERE',
  'Urban Symphony',
  'A vibrant urban scene with dynamic energy',
  '/images/contests/artwork5.jpg',
  'dynamic urban landscape with vibrant colors and movement',
  'AI Artist 5',
  5
),
(
  'PASTE_CONTEST_ID_HERE',
  'Abstract Harmony',
  'Harmonious abstract shapes and colors',
  '/images/contests/artwork6.jpg',
  'abstract composition with harmonious colors and balanced shapes',
  'AI Artist 6',
  6
);

-- Step 5: Verify the contest was created
SELECT
  c.id,
  c.week_number,
  c.status,
  c.start_date,
  c.end_date,
  COUNT(a.id) as artwork_count
FROM contests c
LEFT JOIN artworks a ON a.contest_id = c.id
WHERE c.status = 'active'
GROUP BY c.id
ORDER BY c.created_at DESC
LIMIT 1;

-- Step 6: View all artworks for the active contest
SELECT
  a.id,
  a.title,
  a.artist_name,
  a.image_url,
  a.vote_count,
  a.position
FROM artworks a
JOIN contests c ON a.contest_id = c.id
WHERE c.status = 'active'
ORDER BY a.position;
