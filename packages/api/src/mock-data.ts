// Mock data for course platform - remove this file when database is ready

export const MOCK_COURSES = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Introduction to React',
    description: 'Learn the fundamentals of React including components, props, state, and hooks. Perfect for beginners.',
    coverUrl: 'https://picsum.photos/seed/react/400/300',
    progressPct: 35,
    lastLessonId: '750e8400-e29b-41d4-a716-446655440002',
    lastAccessedAt: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Advanced TypeScript',
    description: 'Master advanced TypeScript patterns including generics, utility types, and advanced type inference.',
    coverUrl: 'https://picsum.photos/seed/typescript/400/300',
    progressPct: 60,
    lastLessonId: '750e8400-e29b-41d4-a716-446655440010',
    lastAccessedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'React Native Fundamentals',
    description: 'Build mobile apps with React Native. Learn navigation, styling, and platform-specific code.',
    coverUrl: 'https://picsum.photos/seed/reactnative/400/300',
    progressPct: 0,
    lastLessonId: null,
    lastAccessedAt: null,
  },
]

export const MOCK_MODULES = {
  '550e8400-e29b-41d4-a716-446655440001': [
    {
      id: '650e8400-e29b-41d4-a716-446655440001',
      courseId: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Getting Started',
      description: 'Introduction to React and setting up your development environment',
      orderIndex: 1,
      lessons: [
        {
          id: '750e8400-e29b-41d4-a716-446655440001',
          moduleId: '650e8400-e29b-41d4-a716-446655440001',
          title: 'Welcome to React',
          description: 'Introduction video to the course',
          type: 'video' as const,
          durationSec: 120,
          contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          contentText: null,
          orderIndex: 1,
          isComplete: true,
          lastPositionSec: 0,
        },
        {
          id: '750e8400-e29b-41d4-a716-446655440002',
          moduleId: '650e8400-e29b-41d4-a716-446655440001',
          title: 'Setting Up Your Environment',
          description: 'Learn how to set up your development environment',
          type: 'text' as const,
          durationSec: null,
          contentUrl: null,
          contentText: `# Setting Up Your Development Environment

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 18 or higher)
- npm or yarn package manager
- A code editor (VS Code recommended)

## Installation Steps

1. Install Node.js from [nodejs.org](https://nodejs.org)
2. Verify installation:
   \`\`\`bash
   node --version
   npm --version
   \`\`\`
3. Install Create React App:
   \`\`\`bash
   npx create-react-app my-app
   cd my-app
   npm start
   \`\`\`

## What You'll See

After running \`npm start\`, your browser should open to \`localhost:3000\` showing the default React app.

Congratulations! You're ready to start building with React.`,
          orderIndex: 2,
          isComplete: false,
          lastPositionSec: 0,
        },
        {
          id: '750e8400-e29b-41d4-a716-446655440003',
          moduleId: '650e8400-e29b-41d4-a716-446655440001',
          title: 'Your First Component',
          description: 'Create your first React component',
          type: 'video' as const,
          durationSec: 180,
          contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          contentText: null,
          orderIndex: 3,
          isComplete: false,
          lastPositionSec: 0,
        },
      ],
    },
    {
      id: '650e8400-e29b-41d4-a716-446655440002',
      courseId: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Components and Props',
      description: 'Learn how to build reusable components',
      orderIndex: 2,
      lessons: [
        {
          id: '750e8400-e29b-41d4-a716-446655440004',
          moduleId: '650e8400-e29b-41d4-a716-446655440002',
          title: 'Understanding Components',
          description: 'Learn what components are and why they matter',
          type: 'video' as const,
          durationSec: 240,
          contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          contentText: null,
          orderIndex: 1,
          isComplete: false,
          lastPositionSec: 0,
        },
      ],
    },
  ],
  '550e8400-e29b-41d4-a716-446655440002': [
    {
      id: '650e8400-e29b-41d4-a716-446655440004',
      courseId: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Generics and Advanced Types',
      description: 'Deep dive into TypeScript generics',
      orderIndex: 1,
      lessons: [
        {
          id: '750e8400-e29b-41d4-a716-446655440009',
          moduleId: '650e8400-e29b-41d4-a716-446655440004',
          title: 'Generics Fundamentals',
          description: 'Introduction to TypeScript generics',
          type: 'video' as const,
          durationSec: 480,
          contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          contentText: null,
          orderIndex: 1,
          isComplete: true,
          lastPositionSec: 0,
        },
        {
          id: '750e8400-e29b-41d4-a716-446655440010',
          moduleId: '650e8400-e29b-41d4-a716-446655440004',
          title: 'Generic Constraints',
          description: 'Using constraints with generics',
          type: 'video' as const,
          durationSec: 390,
          contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          contentText: null,
          orderIndex: 2,
          isComplete: false,
          lastPositionSec: 45,
        },
      ],
    },
  ],
  '550e8400-e29b-41d4-a716-446655440003': [
    {
      id: '650e8400-e29b-41d4-a716-446655440006',
      courseId: '550e8400-e29b-41d4-a716-446655440003',
      title: 'React Native Basics',
      description: 'Core concepts of React Native development',
      orderIndex: 1,
      lessons: [
        {
          id: '750e8400-e29b-41d4-a716-446655440012',
          moduleId: '650e8400-e29b-41d4-a716-446655440006',
          title: 'Welcome to React Native',
          description: 'Introduction to React Native',
          type: 'video' as const,
          durationSec: 210,
          contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          contentText: null,
          orderIndex: 1,
          isComplete: false,
          lastPositionSec: 0,
        },
      ],
    },
  ],
}
