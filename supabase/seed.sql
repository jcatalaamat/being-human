-- Seed data for Holistic Training - TRX & Swiss Ball Training Courses
-- This seeds both 15-week programs with 3 modules and 36 lessons each

-- ============================================================================
-- STORAGE BASE URL (update this for your Supabase project)
-- Format: https://<project-id>.supabase.co/storage/v1/object/public/courses/
-- ============================================================================

-- ============================================================================
-- COURSE: TRX Suspension Training
-- ============================================================================
INSERT INTO courses (id, title, description, cover_url, promo_video_url, is_published, instructor_id)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Complete TRX Suspension Training Program',
  'Master TRX Suspension Training — Build Strength Without Joint Stress. Transform your body using suspension training that builds functional strength, improves mobility, and protects your joints. Perfect for ages 30-65 with pain, injuries, or mobility concerns. 15-week structured program taking you from beginner to advanced.',
  'https://vpdwubpodcrbicvldskg.supabase.co/storage/v1/object/public/courses/trx-egon-main-DWobt6NW.jpg',
  'https://youtu.be/PGo77NuDRAg',
  true,
  (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  cover_url = EXCLUDED.cover_url,
  promo_video_url = EXCLUDED.promo_video_url,
  is_published = EXCLUDED.is_published;

-- ============================================================================
-- MODULE 1: FOUNDATIONS & CONTROL (Beginner, Weeks 1-5)
-- ============================================================================
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES (
  'b1000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'FOUNDATIONS & CONTROL',
  'Build awareness, mobility, and baseline strength while mastering TRX fundamentals. Circuit Format: Complete all exercises in Group A, then B, then C, then D — and repeat for 2-3 rounds.',
  1
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- Module 1 - Group A: Warm-Up & Mobility (4 exercises)
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_url, duration_sec, order_index)
VALUES
  ('c1000001-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Suspended Downdog', 'Warm-up and mobility exercise to open the shoulders and decompress the spine.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 300, 1),

  ('c1000002-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Windmills', 'Dynamic mobility exercise for thoracic spine rotation and shoulder mobility.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 240, 2),

  ('c1000003-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Kickbacks to Superman', 'Full body mobility flow combining hip extension with spinal extension.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 360, 3),

  ('c1000004-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Hawaiian Squats', 'Hip mobility exercise focusing on lateral hip movement and ankle mobility.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 300, 4)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_sec = EXCLUDED.duration_sec;

-- Module 1 - Group B: Core (3 exercises)
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_url, duration_sec, order_index)
VALUES
  ('c1000005-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Scapular Push-Ups', 'Core and shoulder stability exercise focusing on scapular control.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 240, 5),

  ('c1000006-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Kneeling Overhead Reaches', 'Core stability with overhead mobility, building anti-extension strength.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 300, 6),

  ('c1000007-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Hip Extensions', 'Posterior chain activation focusing on glutes and core stability.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 240, 7)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_sec = EXCLUDED.duration_sec;

-- Module 1 - Group C: Strength (5 exercises)
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_url, duration_sec, order_index)
VALUES
  ('c1000008-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Side to Side Lunges', 'Lower body strength with lateral movement pattern and hip mobility.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 360, 8),

  ('c1000009-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Upright Rows', 'Upper body pulling strength targeting the upper back and shoulders.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', 300, 9),

  ('c1000010-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Low Plank Pendulum', 'Core stability with anti-rotation, building deep abdominal strength.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 300, 10),

  ('c1000011-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Shrimp Squats', 'Single leg strength focusing on balance, quad strength, and hip stability.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', 360, 11),

  ('c1000012-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'TRX Push-Ups', 'Upper body pushing strength with added instability for core engagement.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', 300, 12)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_sec = EXCLUDED.duration_sec;

-- ============================================================================
-- MODULE 2: STRENGTH & STABILITY EVOLUTION (Intermediate, Weeks 6-10)
-- ============================================================================
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES (
  'b2000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'STRENGTH & STABILITY EVOLUTION',
  'Build on the foundation with deeper strength, better balance, improved coordination, and increased mobility. Circuit Format training continues.',
  2
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- Module 2 Lessons (12 exercises)
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_url, duration_sec, order_index)
VALUES
  ('c2000001-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'Dynamic Spinal Waves', 'Advanced mobility flow for spinal articulation and neural activation.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 300, 1),

  ('c2000002-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'TRX World''s Greatest Stretch', 'Comprehensive mobility exercise targeting hips, thoracic spine, and hamstrings.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 360, 2),

  ('c2000003-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'Suspended Hip Circles', 'Hip mobility in all planes of motion with TRX support.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 300, 3),

  ('c2000004-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'TRX Body Saw', 'Advanced anti-extension core exercise for deep abdominal strength.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 300, 4),

  ('c2000005-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'TRX Mountain Climbers', 'Dynamic core exercise combining anti-extension with hip flexion.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 300, 5),

  ('c2000006-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'Side Plank with Reach', 'Anti-lateral flexion with rotation for oblique strength.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 300, 6),

  ('c2000007-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'TRX Inverted Row', 'Horizontal pulling for upper back and bicep strength.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 360, 7),

  ('c2000008-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'TRX Pistol Squat Progression', 'Single leg squat with TRX assistance for balance and strength.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', 420, 8),

  ('c2000009-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'TRX Chest Press', 'Upper body pushing with increased instability demands.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 300, 9),

  ('c2000010-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'TRX Single Leg Deadlift', 'Hip hinge pattern with balance challenge for posterior chain.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', 360, 10),

  ('c2000011-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'TRX Chest Opener', 'Deep pectoral and anterior shoulder stretch.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', 240, 11),

  ('c2000012-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'TRX Hamstring Stretch', 'Posterior chain lengthening with TRX support.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', 300, 12)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_sec = EXCLUDED.duration_sec;

-- ============================================================================
-- MODULE 3: ADVANCED FUNCTIONAL TRAINING (Advanced, Weeks 11-15)
-- ============================================================================
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES (
  'b3000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'ADVANCED FUNCTIONAL TRAINING',
  'Unlock full-body control, advanced strength, flow-based movement, and athletic stability. Master complex movement patterns.',
  3
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- Module 3 Lessons (12 exercises)
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_url, duration_sec, order_index)
VALUES
  ('c3000001-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'TRX Flow Sequence', 'Dynamic movement flow combining multiple patterns for full-body activation.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 420, 1),

  ('c3000002-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'TRX Rotational Lunge', 'Multi-planar movement combining lunge with thoracic rotation.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 360, 2),

  ('c3000003-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'TRX Bear Crawl', 'Quadrupedal movement pattern for coordination and core stability.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 300, 3),

  ('c3000004-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'TRX Pike', 'Advanced core exercise requiring hip flexion with suspended feet.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 300, 4),

  ('c3000005-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'TRX Suspended Plank', 'Core stability with feet suspended for maximum instability.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 300, 5),

  ('c3000006-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'TRX Atomic Push-Up', 'Combination of push-up and knee tuck for total body challenge.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 360, 6),

  ('c3000007-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'TRX Single Arm Row', 'Unilateral pulling with anti-rotation core demand.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 360, 7),

  ('c3000008-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'TRX High Row', 'Upper back and rear deltoid strengthening with external rotation.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 300, 8),

  ('c3000009-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'TRX Low Row', 'Mid-back strengthening with focus on scapular retraction.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', 300, 9),

  ('c3000010-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'TRX Sprinter Start', 'Explosive hip drive with core stability for athletic power.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 360, 10),

  ('c3000011-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'TRX Spinal Decompression', 'Hanging stretch for spinal decompression and relaxation.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', 300, 11),

  ('c3000012-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'TRX Full Body Stretch Flow', 'Complete cool-down sequence for recovery and flexibility.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', 420, 12)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_sec = EXCLUDED.duration_sec;

-- ============================================================================
-- ============================================================================
-- COURSE 2: SWISS BALL TRAINING
-- ============================================================================
-- ============================================================================

INSERT INTO courses (id, title, description, cover_url, is_published, instructor_id)
VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'Complete Swiss Ball Training Program',
  'Master Swiss Ball Training — Gentle Strength for Your Body. Build core strength, improve balance, and rehabilitate injuries using gentle stability ball exercises. Perfect for ages 30-65 seeking low-impact, therapeutic training. 15-week structured program from beginner to advanced.',
  'https://vpdwubpodcrbicvldskg.supabase.co/storage/v1/object/public/courses/egon-rings.jpg',
  true,
  (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  cover_url = EXCLUDED.cover_url,
  is_published = EXCLUDED.is_published;

-- ============================================================================
-- SWISS BALL MODULE 1: FOUNDATION (Beginner, Weeks 1-5)
-- ============================================================================
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES (
  'b1000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000002',
  'FOUNDATION',
  'Building stability, learning proper positioning, and gentle core activation. Learn safe sitting, basic balance, pelvic tilts, gentle spine mobility, and breathing techniques for stability.',
  1
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- Swiss Ball Module 1 Lessons (12 exercises)
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_url, duration_sec, order_index)
VALUES
  ('d1000001-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   'Safe Sitting & Ball Basics', 'Learn proper positioning and safe sitting technique on the Swiss Ball.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 300, 1),

  ('d1000002-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   'Basic Balance Introduction', 'Develop fundamental balance skills while seated on the ball.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 240, 2),

  ('d1000003-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   'Pelvic Tilts', 'Gentle pelvic movements to activate the core and mobilize the lower spine.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 300, 3),

  ('d1000004-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   'Gentle Spine Mobility', 'Soft spinal movements to increase flexibility and reduce stiffness.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 300, 4),

  ('d1000005-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   'Beginner Core Engagement', 'Learn to activate deep core muscles with gentle contractions.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 300, 5),

  ('d1000006-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   'Seated Marching', 'Gentle leg lifts while maintaining balance and core stability.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 240, 6),

  ('d1000007-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   'Upper Body Support Work', 'Build shoulder and arm stability using the ball for support.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 300, 7),

  ('d1000008-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   'Breathing for Stability', 'Master diaphragmatic breathing techniques that enhance core stability.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 300, 8),

  ('d1000009-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   'Seated Arm Reaches', 'Challenge balance while performing controlled arm movements.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', 240, 9),

  ('d1000010-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   'Gentle Ball Bouncing', 'Light bouncing to develop rhythm and coordination on the ball.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 240, 10),

  ('d1000011-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   'Supine Ball Support', 'Lying back on the ball for gentle spine extension and relaxation.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', 300, 11),

  ('d1000012-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   'Flexibility & Stretching Basics', 'Gentle stretching movements using the ball for support.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', 360, 12)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_sec = EXCLUDED.duration_sec;

-- ============================================================================
-- SWISS BALL MODULE 2: PROGRESSIVE (Intermediate, Weeks 6-10)
-- ============================================================================
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES (
  'b2000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000002',
  'PROGRESSIVE',
  'Increasing movement complexity, building endurance, and addressing imbalances. Dynamic balance challenges, bridge variations, wall squats, thoracic mobility, and controlled rolling.',
  2
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- Swiss Ball Module 2 Lessons (12 exercises)
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_url, duration_sec, order_index)
VALUES
  ('d2000001-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'Dynamic Balance Challenges', 'Progress your balance with movement-based challenges on the ball.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 300, 1),

  ('d2000002-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'Bridge Variations', 'Glute and hamstring strengthening with ball-supported bridges.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 360, 2),

  ('d2000003-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'Wall Squats with Ball', 'Build leg strength with ball-supported wall squats.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 300, 3),

  ('d2000004-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'Thoracic Mobility Work', 'Open up the upper back and improve thoracic spine movement.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 300, 4),

  ('d2000005-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'Side-Lying Oblique Work', 'Strengthen obliques with supported side-lying exercises.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 300, 5),

  ('d2000006-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'Controlled Rolling', 'Learn to roll on the ball with control and coordination.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 300, 6),

  ('d2000007-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'Weight Shifting Exercises', 'Develop proprioception through controlled weight transfers.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 300, 7),

  ('d2000008-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'Prone Ball Balance', 'Build core strength lying face-down over the ball.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 300, 8),

  ('d2000009-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'Ball Pass Crunches', 'Core strengthening with ball passing between hands and feet.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', 300, 9),

  ('d2000010-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'Hip Flexor Stretches', 'Open up tight hip flexors using the ball for support.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 300, 10),

  ('d2000011-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'Back Extension', 'Strengthen the posterior chain with supported back extensions.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', 300, 11),

  ('d2000012-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'Intermediate Flow Sequence', 'Combine multiple movements into a flowing sequence.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', 420, 12)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_sec = EXCLUDED.duration_sec;

-- ============================================================================
-- SWISS BALL MODULE 3: MASTERY (Advanced, Weeks 11-15)
-- ============================================================================
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES (
  'b3000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000002',
  'MASTERY',
  'Full-body integration, advanced balance, and functional movement patterns. Pike and plank variations, single-leg work, advanced hamstring curls, and complex spine articulation.',
  3
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- Swiss Ball Module 3 Lessons (12 exercises)
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_url, duration_sec, order_index)
VALUES
  ('d3000001-0000-0000-0000-000000000002', 'b3000000-0000-0000-0000-000000000002',
   'Pike Variations', 'Advanced core exercise bringing hips up with feet on the ball.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 360, 1),

  ('d3000002-0000-0000-0000-000000000002', 'b3000000-0000-0000-0000-000000000002',
   'Plank Variations', 'Build total body stability with hands or feet on the ball.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 360, 2),

  ('d3000003-0000-0000-0000-000000000002', 'b3000000-0000-0000-0000-000000000002',
   'Single-Leg Balance Work', 'Challenge stability with single-leg exercises on the ball.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 360, 3),

  ('d3000004-0000-0000-0000-000000000002', 'b3000000-0000-0000-0000-000000000002',
   'Advanced Hamstring Curls', 'Intense hamstring strengthening with feet on the ball.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 360, 4),

  ('d3000005-0000-0000-0000-000000000002', 'b3000000-0000-0000-0000-000000000002',
   'Upper Body Push on Ball', 'Push-up variations with hands or chest on the ball.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 360, 5),

  ('d3000006-0000-0000-0000-000000000002', 'b3000000-0000-0000-0000-000000000002',
   'Upper Body Pull on Ball', 'Pulling exercises using the ball for support and instability.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 360, 6),

  ('d3000007-0000-0000-0000-000000000002', 'b3000000-0000-0000-0000-000000000002',
   'Complex Spine Articulation', 'Advanced spinal movements for mobility and control.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 360, 7),

  ('d3000008-0000-0000-0000-000000000002', 'b3000000-0000-0000-0000-000000000002',
   'Jackknife Exercise', 'Full-body core challenge bringing knees to chest on the ball.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 300, 8),

  ('d3000009-0000-0000-0000-000000000002', 'b3000000-0000-0000-0000-000000000002',
   'Stir the Pot', 'Advanced anti-rotation core exercise with forearms on the ball.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', 300, 9),

  ('d3000010-0000-0000-0000-000000000002', 'b3000000-0000-0000-0000-000000000002',
   'Ball Rollout', 'Build core strength with controlled ball rollouts.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 300, 10),

  ('d3000011-0000-0000-0000-000000000002', 'b3000000-0000-0000-0000-000000000002',
   'Creating Personal Routines', 'Learn to design your own therapeutic ball routines.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', 420, 11),

  ('d3000012-0000-0000-0000-000000000002', 'b3000000-0000-0000-0000-000000000002',
   'Advanced Full Body Flow', 'Complete advanced sequence integrating all learned movements.',
   'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', 480, 12)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_sec = EXCLUDED.duration_sec;

-- ============================================================================
-- VERIFICATION QUERY (run after seeding to verify)
-- ============================================================================
-- SELECT
--   c.title as course,
--   m.title as module,
--   m.order_index as module_order,
--   COUNT(l.id) as lesson_count
-- FROM courses c
-- JOIN modules m ON m.course_id = c.id
-- JOIN lessons l ON l.module_id = m.id
-- GROUP BY c.title, m.title, m.order_index
-- ORDER BY c.title, m.order_index;
