/**
 * Centralized copy/strings for the Holistic Training app.
 * All user-facing text should be defined here for easy localization and iteration.
 */

export const BRAND = {
  name: 'Holistic Training',
  tagline: 'Transform your body, mind, and movement',
} as const

// Navigation labels
export const NAV = {
  training: 'Training',
  profile: 'Profile',
  settings: 'Settings',
  admin: 'Admin',
  downloads: 'Downloads',
} as const

// Training/Library section
export const TRAINING = {
  pageTitle: 'Training',
  continueTraining: 'Continue Training',
  allPrograms: 'All Programs',
  noPrograms: 'No programs yet',
  noProgramsMessage: 'New training programs coming soon.',
} as const

// Program (formerly Course) labels
export const PROGRAM = {
  screenTitle: 'Program',
  start: 'Start Program',
  resume: 'Resume Program',
  noExercises: 'No exercises yet',
  noExercisesMessage: "This program doesn't have any exercises yet.",
  // Admin labels
  manage: 'Manage Programs',
  create: 'Create Program',
  creating: 'Creating...',
  noDescription: 'No description',
  createFirst: 'Create your first program to get started.',
} as const

// Exercise (formerly Lesson) labels
export const EXERCISE = {
  screenTitle: 'Exercise',
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
