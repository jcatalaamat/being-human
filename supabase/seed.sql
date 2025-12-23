-- Seed data for courses platform
-- Note: Replace with an actual user ID from auth.users table if needed

-- Insert sample courses
INSERT INTO courses (id, title, description, cover_url, is_published, instructor_id)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Introduction to React',
    'Learn the fundamentals of React including components, props, state, and hooks. Perfect for beginners.',
    'https://picsum.photos/seed/react/400/300',
    true,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Advanced TypeScript',
    'Master advanced TypeScript patterns including generics, utility types, and advanced type inference.',
    'https://picsum.photos/seed/typescript/400/300',
    true,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'React Native Fundamentals',
    'Build mobile apps with React Native. Learn navigation, styling, and platform-specific code.',
    'https://picsum.photos/seed/reactnative/400/300',
    true,
    (SELECT id FROM auth.users LIMIT 1)
  )
ON CONFLICT (id) DO NOTHING;

-- Insert modules for Introduction to React
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES
  (
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Getting Started',
    'Introduction to React and setting up your development environment',
    1
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'Components and Props',
    'Learn how to build reusable components',
    2
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'State and Hooks',
    'Managing state with useState and other hooks',
    3
  )
ON CONFLICT (id) DO NOTHING;

-- Insert modules for Advanced TypeScript
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES
  (
    '650e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440002',
    'Generics and Advanced Types',
    'Deep dive into TypeScript generics',
    1
  ),
  (
    '650e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440002',
    'Utility Types and Patterns',
    'Learn built-in utility types and common patterns',
    2
  )
ON CONFLICT (id) DO NOTHING;

-- Insert modules for React Native
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES
  (
    '650e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440003',
    'React Native Basics',
    'Core concepts of React Native development',
    1
  )
ON CONFLICT (id) DO NOTHING;

-- Insert lessons for React - Module 1 (Getting Started)
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_url, duration_sec, order_index)
VALUES
  (
    '750e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440001',
    'Welcome to React',
    'Introduction video to the course',
    'video',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    120,
    1
  ),
  (
    '750e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440001',
    'Setting Up Your Environment',
    'Learn how to set up your development environment',
    'text',
    NULL,
    NULL,
    2
  ),
  (
    '750e8400-e29b-41d4-a716-446655440003',
    '650e8400-e29b-41d4-a716-446655440001',
    'Your First Component',
    'Create your first React component',
    'video',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    180,
    3
  )
ON CONFLICT (id) DO NOTHING;

-- Update text content for text-based lesson
UPDATE lessons
SET content_text = E'# Setting Up Your Development Environment\n\n## Prerequisites\n\nBefore you begin, ensure you have the following installed:\n\n- Node.js (version 18 or higher)\n- npm or yarn package manager\n- A code editor (VS Code recommended)\n\n## Installation Steps\n\n1. Install Node.js from [nodejs.org](https://nodejs.org)\n2. Verify installation:\n   ```bash\n   node --version\n   npm --version\n   ```\n3. Install Create React App:\n   ```bash\n   npx create-react-app my-app\n   cd my-app\n   npm start\n   ```\n\n## What You''ll See\n\nAfter running `npm start`, your browser should open to `localhost:3000` showing the default React app.\n\nCongratulations! You''re ready to start building with React.'
WHERE id = '750e8400-e29b-41d4-a716-446655440002';

-- Insert lessons for React - Module 2 (Components and Props)
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_url, duration_sec, order_index)
VALUES
  (
    '750e8400-e29b-41d4-a716-446655440004',
    '650e8400-e29b-41d4-a716-446655440002',
    'Understanding Components',
    'Learn what components are and why they matter',
    'video',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    240,
    1
  ),
  (
    '750e8400-e29b-41d4-a716-446655440005',
    '650e8400-e29b-41d4-a716-446655440002',
    'Working with Props',
    'Pass data to components using props',
    'video',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    300,
    2
  ),
  (
    '750e8400-e29b-41d4-a716-446655440006',
    '650e8400-e29b-41d4-a716-446655440002',
    'Component Composition',
    'Build complex UIs from simple components',
    'audio',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    420,
    3
  )
ON CONFLICT (id) DO NOTHING;

-- Insert lessons for React - Module 3 (State and Hooks)
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_text, order_index)
VALUES
  (
    '750e8400-e29b-41d4-a716-446655440007',
    '650e8400-e29b-41d4-a716-446655440003',
    'Introduction to State',
    'Understand state in React',
    'text',
    E'# Introduction to State\n\nState is one of the most important concepts in React. It allows components to create and manage their own data.\n\n## What is State?\n\nState is data that changes over time. Unlike props, which are passed to a component, state is managed within the component.\n\n## Example\n\n```jsx\nimport { useState } from ''react'';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}\n```\n\n## Key Concepts\n\n- State is private to the component\n- Changing state triggers a re-render\n- Use `useState` hook to add state to function components',
    1
  ),
  (
    '750e8400-e29b-41d4-a716-446655440008',
    '650e8400-e29b-41d4-a716-446655440003',
    'useState Hook Deep Dive',
    'Master the useState hook',
    'video',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    360,
    2
  )
ON CONFLICT (id) DO NOTHING;

-- Insert lessons for TypeScript - Module 1
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_url, duration_sec, order_index)
VALUES
  (
    '750e8400-e29b-41d4-a716-446655440009',
    '650e8400-e29b-41d4-a716-446655440004',
    'Generics Fundamentals',
    'Introduction to TypeScript generics',
    'video',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    480,
    1
  ),
  (
    '750e8400-e29b-41d4-a716-446655440010',
    '650e8400-e29b-41d4-a716-446655440004',
    'Generic Constraints',
    'Using constraints with generics',
    'video',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    390,
    2
  )
ON CONFLICT (id) DO NOTHING;

-- Insert lessons for TypeScript - Module 2
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_text, order_index)
VALUES
  (
    '750e8400-e29b-41d4-a716-446655440011',
    '650e8400-e29b-41d4-a716-446655440005',
    'Utility Types Overview',
    'Learn about built-in utility types',
    'text',
    E'# TypeScript Utility Types\n\nTypeScript provides several built-in utility types that help you transform types.\n\n## Common Utility Types\n\n### Partial<T>\nMakes all properties optional:\n```typescript\ninterface User {\n  name: string;\n  age: number;\n}\n\ntype PartialUser = Partial<User>;\n// { name?: string; age?: number; }\n```\n\n### Pick<T, K>\nPicks specific properties:\n```typescript\ntype UserName = Pick<User, ''name''>;\n// { name: string; }\n```\n\n### Omit<T, K>\nOmits specific properties:\n```typescript\ntype UserWithoutAge = Omit<User, ''age''>;\n// { name: string; }\n```\n\n### Record<K, T>\nCreates an object type with specific keys:\n```typescript\ntype Roles = Record<string, boolean>;\n// { [key: string]: boolean; }\n```',
    1
  )
ON CONFLICT (id) DO NOTHING;

-- Insert lessons for React Native - Module 1
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_url, duration_sec, order_index)
VALUES
  (
    '750e8400-e29b-41d4-a716-446655440012',
    '650e8400-e29b-41d4-a716-446655440006',
    'Welcome to React Native',
    'Introduction to React Native',
    'video',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    210,
    1
  ),
  (
    '750e8400-e29b-41d4-a716-446655440013',
    '650e8400-e29b-41d4-a716-446655440006',
    'Core Components',
    'Learn about React Native core components',
    'video',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    330,
    2
  )
ON CONFLICT (id) DO NOTHING;

-- Note: To test with actual user progress, run these queries after authenticating:
-- INSERT INTO user_course_progress (user_id, course_id, last_lesson_id, last_accessed_at)
-- VALUES (auth.uid(), '550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002', NOW());
--
-- INSERT INTO user_lesson_progress (user_id, lesson_id, is_complete, completed_at)
-- VALUES (auth.uid(), '750e8400-e29b-41d4-a716-446655440001', true, NOW());
