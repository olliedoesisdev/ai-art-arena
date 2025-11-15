-- Quick Test Contest Setup
-- Run this in Supabase SQL Editor to create a test contest with sample artworks

-- Step 1: Create a test contest (active for next 7 days)
INSERT INTO contests (title, week_number, year, start_date, end_date, status)
VALUES (
  'AI Art Arena - Week 1 Test',
  1,
  2025,
  NOW(),
  NOW() + INTERVAL '7 days',
  'active'
)
RETURNING id;

-- Step 2: Copy the ID from above and replace 'PASTE_CONTEST_ID_HERE' below

-- Step 3: Create 5 sample artworks
INSERT INTO artworks (contest_id, title, description, image_url, prompt, style)
VALUES
(
  'PASTE_CONTEST_ID_HERE',
  'Neon Cyberpunk City',
  'A vibrant cyberpunk cityscape at night with flying cars and holographic advertisements',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
  'A futuristic neon-lit cyberpunk city at night, flying cars, holographic advertisements, rain-slicked streets, blade runner aesthetic',
  'Cyberpunk'
),
(
  'PASTE_CONTEST_ID_HERE',
  'Ethereal Forest',
  'A mystical forest with glowing mushrooms and fairy lights',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80',
  'Magical enchanted forest with bioluminescent mushrooms, fairy lights, mist, ethereal atmosphere, fantasy landscape',
  'Fantasy'
),
(
  'PASTE_CONTEST_ID_HERE',
  'Abstract Waves',
  'Colorful abstract wave patterns with fluid dynamics',
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
  'Abstract fluid art with vibrant colors, wave patterns, liquid dynamics, gradient flows, modern art style',
  'Abstract'
),
(
  'PASTE_CONTEST_ID_HERE',
  'Space Exploration',
  'Astronaut floating in deep space with colorful nebula background',
  'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&q=80',
  'Lone astronaut floating in the vastness of space, colorful nebula, stars, cosmic dust, sense of wonder and isolation',
  'Sci-Fi'
),
(
  'PASTE_CONTEST_ID_HERE',
  'Ancient Ruins',
  'Overgrown temple ruins in a dense jungle setting',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
  'Ancient stone temple covered in vines and vegetation, jungle setting, mysterious atmosphere, adventure game aesthetic',
  'Adventure'
);

-- Step 4: Verify the data was created
SELECT
  c.title as contest_title,
  c.status,
  c.end_date,
  COUNT(a.id) as artwork_count
FROM contests c
LEFT JOIN artworks a ON a.contest_id = c.id
WHERE c.status = 'active'
GROUP BY c.id
ORDER BY c.created_at DESC
LIMIT 1;

-- Step 5: View all artworks for the active contest
SELECT
  a.id,
  a.title,
  a.style,
  a.vote_count
FROM artworks a
JOIN contests c ON a.contest_id = c.id
WHERE c.status = 'active'
ORDER BY a.created_at;
