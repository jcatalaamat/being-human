import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, tenantAdminProcedure } from '../trpc'

// Members router - for admin member management (requires tenant admin role)
export const membersRouter = createTRPCRouter({
  // ============ LIST ENROLLED MEMBERS ============

  // List all enrolled members for a course (tenant admin only)
  listByCourse: tenantAdminProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify course belongs to current tenant
      const { data: course } = await ctx.supabase
        .from('courses')
        .select('tenant_id')
        .eq('id', input.courseId)
        .single()

      if (!course || course.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' })
      }

      // Get all users enrolled in this course with their progress
      const { data: enrollments, error } = await ctx.supabase
        .from('user_course_progress')
        .select(`
          user_id,
          enrolled_at,
          started_at,
          last_accessed_at,
          last_lesson_id
        `)
        .eq('course_id', input.courseId)
        .order('enrolled_at', { ascending: false })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Get profile details and calculate progress for each user
      const membersWithDetails = await Promise.all(
        enrollments.map(async (enrollment) => {
          // Get profile
          const { data: profile } = await ctx.supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .eq('id', enrollment.user_id)
            .single()

          // Get user email from auth
          const { data: authUser } = await ctx.supabase.auth.admin.getUserById(enrollment.user_id)

          // Calculate progress percentage
          const { data: progressPct } = await ctx.supabase.rpc('calculate_course_progress', {
            p_user_id: enrollment.user_id,
            p_course_id: input.courseId,
          })

          // Count completed modules
          const { data: modules } = await ctx.supabase
            .from('modules')
            .select('id')
            .eq('course_id', input.courseId)

          let completedModules = 0
          const totalModules = modules?.length || 0

          if (modules) {
            for (const module of modules) {
              // Check if all lessons in module are complete
              const { data: lessons } = await ctx.supabase
                .from('lessons')
                .select('id')
                .eq('module_id', module.id)

              if (lessons && lessons.length > 0) {
                const { data: completedLessons } = await ctx.supabase
                  .from('user_lesson_progress')
                  .select('id')
                  .eq('user_id', enrollment.user_id)
                  .eq('is_complete', true)
                  .in(
                    'lesson_id',
                    lessons.map((l) => l.id)
                  )

                if (completedLessons && completedLessons.length === lessons.length) {
                  completedModules++
                }
              }
            }
          }

          return {
            userId: enrollment.user_id,
            name: profile?.name || 'Unknown',
            email: authUser?.user?.email || 'Unknown',
            avatarUrl: profile?.avatar_url,
            enrolledAt: enrollment.enrolled_at || enrollment.started_at,
            lastAccessedAt: enrollment.last_accessed_at,
            progressPct: progressPct || 0,
            completedModules,
            totalModules,
          }
        })
      )

      return membersWithDetails
    }),

  // ============ LIST ALL MEMBERS ============

  // List all members across all courses in tenant (tenant admin only)
  listAll: tenantAdminProcedure.query(async ({ ctx }) => {
    // Get all unique users with course progress for courses in this tenant
    const { data: enrollments, error } = await ctx.supabase
      .from('user_course_progress')
      .select(`
        user_id,
        course_id,
        enrolled_at,
        last_accessed_at,
        courses!inner(tenant_id)
      `)
      .eq('courses.tenant_id', ctx.tenant.tenantId)
      .order('enrolled_at', { ascending: false })

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    // Group by user
    const userMap = new Map<
      string,
      {
        courseIds: string[]
        earliestEnrollment: string
        lastActive: string | null
      }
    >()

    for (const enrollment of enrollments) {
      const existing = userMap.get(enrollment.user_id)
      if (existing) {
        existing.courseIds.push(enrollment.course_id)
        if (enrollment.last_accessed_at && (!existing.lastActive || enrollment.last_accessed_at > existing.lastActive)) {
          existing.lastActive = enrollment.last_accessed_at
        }
      } else {
        userMap.set(enrollment.user_id, {
          courseIds: [enrollment.course_id],
          earliestEnrollment: enrollment.enrolled_at,
          lastActive: enrollment.last_accessed_at,
        })
      }
    }

    // Get profile and progress details for each user
    const members = await Promise.all(
      Array.from(userMap.entries()).map(async ([userId, data]) => {
        // Get profile
        const { data: profile } = await ctx.supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .eq('id', userId)
          .single()

        // Get user email from auth
        const { data: authUser } = await ctx.supabase.auth.admin.getUserById(userId)

        // Get course names (only for tenant's courses)
        const { data: courses } = await ctx.supabase
          .from('courses')
          .select('id, title')
          .in('id', data.courseIds)
          .eq('tenant_id', ctx.tenant.tenantId)

        return {
          userId,
          name: profile?.name || 'Unknown',
          email: authUser?.user?.email || 'Unknown',
          avatarUrl: profile?.avatar_url,
          enrolledAt: data.earliestEnrollment,
          lastAccessedAt: data.lastActive,
          courses: courses?.map((c) => ({ id: c.id, title: c.title })) || [],
        }
      })
    )

    return members
  }),

  // ============ MEMBER DETAIL ============

  // Get detailed member progress for a specific course (tenant admin only)
  getMemberProgress: tenantAdminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        courseId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify course belongs to current tenant
      const { data: course } = await ctx.supabase
        .from('courses')
        .select('tenant_id')
        .eq('id', input.courseId)
        .single()

      if (!course || course.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' })
      }

      // Get profile
      const { data: profile } = await ctx.supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .eq('id', input.userId)
        .single()

      // Get user email
      const { data: authUser } = await ctx.supabase.auth.admin.getUserById(input.userId)

      // Get enrollment info
      const { data: enrollment } = await ctx.supabase
        .from('user_course_progress')
        .select('enrolled_at, started_at, last_accessed_at')
        .eq('user_id', input.userId)
        .eq('course_id', input.courseId)
        .single()

      if (!enrollment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not enrolled in this course' })
      }

      // Get modules with unlock status
      const { data: modules } = await ctx.supabase
        .from('modules')
        .select('id, title, order_index, unlock_after_days')
        .eq('course_id', input.courseId)
        .order('order_index', { ascending: true })

      const enrolledAt = new Date(enrollment.enrolled_at || enrollment.started_at)

      const modulesWithStatus = await Promise.all(
        (modules || []).map(async (module) => {
          // Check manual unlock
          const { data: manualUnlock } = await ctx.supabase
            .from('user_module_unlocks')
            .select('unlocked_at')
            .eq('user_id', input.userId)
            .eq('module_id', module.id)
            .single()

          // Calculate unlock date
          const unlockDate = new Date(enrolledAt)
          unlockDate.setDate(unlockDate.getDate() + module.unlock_after_days)

          const isUnlocked = manualUnlock !== null || new Date() >= unlockDate

          // Get lessons progress
          const { data: lessons } = await ctx.supabase.from('lessons').select('id, title').eq('module_id', module.id)

          const { data: completedLessons } = await ctx.supabase
            .from('user_lesson_progress')
            .select('lesson_id')
            .eq('user_id', input.userId)
            .eq('is_complete', true)
            .in(
              'lesson_id',
              (lessons || []).map((l) => l.id)
            )

          return {
            id: module.id,
            title: module.title,
            orderIndex: module.order_index,
            isUnlocked,
            unlockedManually: manualUnlock !== null,
            unlockDate: unlockDate.toISOString(),
            lessonsTotal: lessons?.length || 0,
            lessonsCompleted: completedLessons?.length || 0,
          }
        })
      )

      return {
        userId: input.userId,
        name: profile?.name || 'Unknown',
        email: authUser?.user?.email || 'Unknown',
        avatarUrl: profile?.avatar_url,
        enrolledAt: enrollment.enrolled_at || enrollment.started_at,
        lastAccessedAt: enrollment.last_accessed_at,
        modules: modulesWithStatus,
      }
    }),

  // ============ MANUAL UNLOCK ============

  // Manually unlock a module for a user (tenant admin only)
  unlockModule: tenantAdminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        moduleId: z.string().uuid(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify module's course belongs to current tenant
      const { data: module } = await ctx.supabase
        .from('modules')
        .select('courses!inner(tenant_id)')
        .eq('id', input.moduleId)
        .single()

      if (!module || (module.courses as { tenant_id: string }).tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Module not found' })
      }

      const { data, error } = await ctx.supabase
        .from('user_module_unlocks')
        .upsert(
          {
            user_id: input.userId,
            module_id: input.moduleId,
            unlocked_by: ctx.user.id,
            notes: input.notes,
            unlocked_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,module_id',
          }
        )
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Revoke manual unlock (tenant admin only)
  revokeUnlock: tenantAdminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        moduleId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify module's course belongs to current tenant
      const { data: module } = await ctx.supabase
        .from('modules')
        .select('courses!inner(tenant_id)')
        .eq('id', input.moduleId)
        .single()

      if (!module || (module.courses as { tenant_id: string }).tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Module not found' })
      }

      const { error } = await ctx.supabase
        .from('user_module_unlocks')
        .delete()
        .eq('user_id', input.userId)
        .eq('module_id', input.moduleId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),
})
