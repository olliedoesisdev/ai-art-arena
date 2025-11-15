-- Setup First AI Art Arena Contest
-- This will create Week 1 contest with your 6 artworks
-- Run this in your Supabase SQL Editor

-- Step 1: Create the first contest (active for 7 days)
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

-- ⚠️ IMPORTANT: Copy the ID from above and replace 'YOUR_CONTEST_ID_HERE' in all 6 artworks below

-- Step 2: Create 6 artworks for the contest
-- Customize the title, description, prompt, and style for each artwork

INSERT INTO artworks (contest_id, title, description, image_url, prompt, style)
VALUES
(
  '0a144af1-fbc7-4203-bc05-da6700d47ed0',
  'Desert Mirage: The Road to Sin City',
  'A stylized illustration capturing the iconic Las Vegas Strip with the Stratosphere Tower piercing a gradient sunset sky, framed by palm trees and the endless desert highway leading into the heart of neon dreams.',
  '/images/contests/artwork1.jpg',
  'Retro poster style illustration of Las Vegas skyline at sunset, featuring the Stratosphere Tower, pyramid casino, palm trees lining a desert highway with painted clouds, warm orange and teal color palette, minimalist geometric shapes, vintage travel poster aesthetic',
  'Retro Illustration / Cityscape'
),
(
  '077184e8-12b5-4f0b-b877-e58097e02fb5',
  'If Only They Would Have Made It a Little Further...',
  'A darkly humorous cartoon depicting travelers arriving just short of their destination at Donner Lodge - a historical reference rendered in cheerful illustration style that creates an ironic contrast.',
  '/images/contests/artwork2.jpg',
  'Cartoon style illustration of two travelers in a car arriving at Donner Lodge sign in a pine forest, woman thinking "if only they would have made it a little further", comic book thought bubble, wholesome art style with dark humor undertone, detailed forest background',
  'Comic Illustration / Dark Humor'
),
(
  'b549b257-a921-45c9-9556-cd4fc42e8176',
  'Contentment in Simplicity',
  'A serene minimalist portrait of a man and his cat in perfect harmony, rendered in soft earth tones with clean lines and gentle curves that capture the quiet joy of companionship.',
  '/images/contests/artwork3.jpg',
  'Minimalist portrait illustration of a bald man with beard in polka dot sweater holding a cream-colored cat with green eyes, soft beige background, simple shapes, warm earth tones, peaceful expression, modern flat design aesthetic',
  'Minimalist Portrait / Contemporary'
),
(
  'e1440a29-3b79-4b83-b1c5-aa609fd8a0ec',
  'Golden Hour Gradient',
  'An atmospheric cityscape bathed in the warm glow of sunset, where geometric buildings dissolve into layers of purple, pink, and orange haze - capturing that magical moment when day transitions to night.',
  '/images/contests/artwork4.jpg',
  'Dreamy gradient cityscape at golden hour, soft focus buildings in purple and orange sunset light, pyramidal skyscraper silhouette, misty atmospheric perspective, pastel color palette blending pink purple and peach, ethereal urban landscape',
  'Atmospheric Cityscape / Gradient Art'
),
(
  'aa6fd4a9-799a-440d-ba96-f0ff7548c1e1',
  'Night Prowler',
  'A mysterious black cat silhouette surveys the foggy city streets at twilight, where glowing streetlamps puncture the blue haze like stars, creating an atmosphere of urban solitude and feline independence.',
  '/images/contests/artwork5.jpg',
  'Moody nighttime city street scene with black cat silhouette in foreground, glowing streetlamps creating bokeh effect, misty blue atmosphere, empty wet pavement, soft painterly style, melancholic urban landscape, dramatic lighting',
  'Moody Atmosphere / Urban Night'
),
(
  '9d823059-f285-4ce0-a0e8-cdc354c8af4f',
  'Corporate Extinction',
  'A dapper velociraptor businessman prowls the rain-slicked streets in full corporate attire, briefcase in claw - a whimsical commentary on survival in the urban jungle rendered with stunning detail and cinematic lighting.',
  '/images/contests/artwork6.jpg',
  'Photorealistic velociraptor in vintage business suit with fedora hat and briefcase, standing on wet city street at night, dramatic rim lighting from street lamps, film noir atmosphere, detailed scales in teal and orange, moody urban background',
  'Surreal Fantasy / Film Noir'
)

-- Step 3: Verify the contest was created successfully
SELECT
  c.id,
  c.title,
  c.week_number,
  c.status,
  c.start_date,
  c.end_date,
  COUNT(a.id) as artwork_count
FROM contests c
LEFT JOIN artworks a ON a.contest_id = c.id
WHERE c.status = 'active'
GROUP BY c.id, c.title, c.week_number, c.status, c.start_date, c.end_date
ORDER BY c.created_at DESC
LIMIT 1;

-- Step 4: View all artworks in the contest
SELECT
  a.id,
  a.title,
  a.image_url,
  a.style,
  a.vote_count,
  a.created_at
FROM artworks a
JOIN contests c ON a.contest_id = c.id
WHERE c.status = 'active'
ORDER BY a.created_at;
