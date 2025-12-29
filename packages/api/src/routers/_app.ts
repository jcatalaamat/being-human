import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

import { adminRouter } from './admin'
import { coursesRouter } from './courses'
import { greetingRouter } from './greeting'
import { lessonsRouter } from './lessons'
import { membersRouter } from './members'
import { progressRouter } from './progress'
import { tenantsRouter } from './tenants'
import { userRouter } from './user'
import { createTRPCRouter } from '../trpc'

export const appRouter = createTRPCRouter({
  greeting: greetingRouter,
  courses: coursesRouter,
  lessons: lessonsRouter,
  progress: progressRouter,
  admin: adminRouter,
  members: membersRouter,
  tenants: tenantsRouter,
  user: userRouter,
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
