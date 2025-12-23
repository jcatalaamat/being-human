import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

import { adminRouter } from './admin'
import { coursesRouter } from './courses'
import { greetingRouter } from './greeting'
import { lessonsRouter } from './lessons'
import { progressRouter } from './progress'
import { createTRPCRouter } from '../trpc'

export const appRouter = createTRPCRouter({
  greeting: greetingRouter,
  courses: coursesRouter,
  lessons: lessonsRouter,
  progress: progressRouter,
  admin: adminRouter,
})
// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>
