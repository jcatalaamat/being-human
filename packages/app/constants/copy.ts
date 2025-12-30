/**
 * Centralized copy/strings for the Inner Ascend app.
 * All user-facing text should be defined here for easy localization and iteration.
 */

export const BRAND = {
  name: 'Inner Ascend',
  tagline: 'Awaken to your true nature',
} as const

// Navigation labels
export const NAV = {
  home: 'Home',
  course: 'Course',
  courses: 'Course', // Legacy alias
  assignments: 'Assignments',
  profile: 'Profile',
  settings: 'Settings',
  admin: 'Admin',
  downloads: 'Downloads',
} as const

// Course section (contains modules which contain lessons)
export const COURSES_SECTION = {
  pageTitle: 'Course',
  continueLearning: 'Continue Learning',
  allCourses: 'All Courses',
  noCourses: 'No course yet',
  noCoursesMessage: 'New content coming soon.',
} as const

// Alias for compatibility
export const TRAINING = COURSES_SECTION

// Course labels (exported as PROGRAM for compatibility)
export const PROGRAM = {
  screenTitle: 'Course',
  start: 'Start Course',
  resume: 'Resume Course',
  noLessons: 'No lessons yet',
  noLessonsMessage: "This course doesn't have any lessons yet.",
  // Admin labels
  manage: 'Manage Courses',
  create: 'Create Course',
  creating: 'Creating...',
  noDescription: 'No description',
  createFirst: 'Create your first course to get started.',
} as const

// Lesson labels (exported as EXERCISE for compatibility)
export const EXERCISE = {
  screenTitle: 'Lesson',
  done: 'Done',
  completed: 'Completed',
  next: 'Next',
  // PDF viewer
  downloadGuide: 'Download Guide',
  pdfViewerTitle: 'Training Guide',
  pdfViewerMessage: 'Native PDF viewer coming soon. For now, you can open the guide in your browser.',
} as const

// Progress/completion labels
export const PROGRESS = {
  complete: 'Done',
  completed: 'Completed',
  markComplete: 'Done',
} as const

// Common actions
export const ACTIONS = {
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  back: 'Back',
  retry: 'Retry',
  loading: 'Loading...',
} as const

// Error messages
export const ERRORS = {
  failedToLoad: 'Failed to load',
  unknownType: 'Unknown content type',
} as const

// Assignments section (formerly Journal)
export const ASSIGNMENTS = {
  pageTitle: 'Assignments',
  newEntry: 'New Assignment',
  myEntries: 'My Assignments',
  staffInbox: 'Staff Inbox',
  noEntries: 'No assignments',
  noEntriesMessage: 'Start writing to capture your reflections.',
  noSubmissions: 'No submissions',
  noSubmissionsMessage: 'Student assignments will appear here.',
} as const

// Aliases
export const COURSE = PROGRAM
export const LESSON = EXERCISE
export const JOURNAL = ASSIGNMENTS
