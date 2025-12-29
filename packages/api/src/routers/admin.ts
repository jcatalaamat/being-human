import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, tenantAdminProcedure, tenantContentProcedure } from '../trpc'

// Admin router - for content management (requires tenant context)
export const adminRouter = createTRPCRouter({
  // ============ COURSES ============

  createCourse: tenantContentProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        coverUrl: z.string().url().optional(),
        status: z.enum(['draft', 'scheduled', 'live']).default('draft'),
        releaseAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString()
      const { data, error } = await ctx.supabase
        .from('courses')
        .insert({
          title: input.title,
          description: input.description,
          cover_url: input.coverUrl,
          status: input.status,
          release_at: input.status === 'live' ? (input.releaseAt || now) : input.releaseAt,
          is_published: input.status === 'live', // Keep for backward compat
          published_at: input.status === 'live' ? now : null,
          tenant_id: ctx.tenant.tenantId,
          instructor_id: ctx.user.id,
          created_at: now,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  updateCourse: tenantContentProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        coverUrl: z.string().url().optional().nullable().or(z.literal('')),
        promoVideoUrl: z.string().url().optional().nullable().or(z.literal('')),
        status: z.enum(['draft', 'scheduled', 'live']).optional(),
        releaseAt: z.string().datetime().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      // Verify course belongs to current tenant and user has access
      const { data: course } = await ctx.supabase
        .from('courses')
        .select('tenant_id, instructor_id, status')
        .eq('id', id)
        .single()

      if (!course || course.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' })
      }

      // Instructors can only edit their own courses; admins/owners can edit any
      if (ctx.tenant.role === 'instructor' && course.instructor_id !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own courses' })
      }

      const now = new Date().toISOString()
      const isGoingLive = updates.status === 'live' && course.status !== 'live'

      const { data, error } = await ctx.supabase
        .from('courses')
        .update({
          ...(updates.title && { title: updates.title }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.coverUrl !== undefined && { cover_url: updates.coverUrl }),
          ...(updates.promoVideoUrl !== undefined && { promo_video_url: updates.promoVideoUrl }),
          ...(updates.status !== undefined && {
            status: updates.status,
            is_published: updates.status === 'live',
            ...(isGoingLive && { published_at: now, release_at: updates.releaseAt || now }),
          }),
          ...(updates.releaseAt !== undefined && { release_at: updates.releaseAt }),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // List all courses for admin (includes unpublished; instructors only see their own)
  listCourses: tenantContentProcedure.query(async ({ ctx }) => {
    let query = ctx.supabase
      .from('courses')
      .select('*')
      .eq('tenant_id', ctx.tenant.tenantId)
      .order('created_at', { ascending: false })

    // Instructors only see their own courses
    if (ctx.tenant.role === 'instructor') {
      query = query.eq('instructor_id', ctx.user.id)
    }

    const { data: courses, error } = await query

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      coverUrl: course.cover_url,
      status: (course.status || (course.is_published ? 'live' : 'draft')) as 'draft' | 'scheduled' | 'live',
      releaseAt: course.release_at,
      isPublished: course.is_published, // backward compat
      createdAt: course.created_at,
      instructorId: course.instructor_id,
    }))
  }),

  deleteCourse: tenantAdminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify course belongs to current tenant
      const { data: course } = await ctx.supabase
        .from('courses')
        .select('tenant_id')
        .eq('id', input.id)
        .single()

      if (!course || course.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' })
      }

      const { error } = await ctx.supabase.from('courses').delete().eq('id', input.id)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ============ MODULES ============

  createModule: tenantContentProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        title: z.string().min(1),
        description: z.string().optional(),
        orderIndex: z.number().int().min(0),
        status: z.enum(['draft', 'scheduled', 'live']).default('live'),
        releaseAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify course belongs to current tenant
      const { data: course } = await ctx.supabase
        .from('courses')
        .select('tenant_id')
        .eq('id', input.courseId)
        .single()

      if (!course || course.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' })
      }

      const { data, error } = await ctx.supabase
        .from('modules')
        .insert({
          course_id: input.courseId,
          title: input.title,
          description: input.description,
          order_index: input.orderIndex,
          status: input.status,
          release_at: input.releaseAt,
          is_published: input.status === 'live',
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  updateModule: tenantContentProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        orderIndex: z.number().int().min(0).optional(),
        status: z.enum(['draft', 'scheduled', 'live']).optional(),
        releaseAt: z.string().datetime().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      // Verify module's course belongs to current tenant
      const { data: module } = await ctx.supabase
        .from('modules')
        .select('courses!inner(tenant_id)')
        .eq('id', id)
        .single()

      if (!module || (module.courses as { tenant_id: string }).tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Module not found' })
      }

      const { data, error } = await ctx.supabase
        .from('modules')
        .update({
          ...(updates.title && { title: updates.title }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.orderIndex !== undefined && { order_index: updates.orderIndex }),
          ...(updates.status !== undefined && {
            status: updates.status,
            is_published: updates.status === 'live',
          }),
          ...(updates.releaseAt !== undefined && { release_at: updates.releaseAt }),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  deleteModule: tenantContentProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify module's course belongs to current tenant
      const { data: module } = await ctx.supabase
        .from('modules')
        .select('courses!inner(tenant_id)')
        .eq('id', input.id)
        .single()

      if (!module || (module.courses as { tenant_id: string }).tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Module not found' })
      }

      const { error } = await ctx.supabase.from('modules').delete().eq('id', input.id)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ============ LESSONS ============

  createLesson: tenantContentProcedure
    .input(
      z.object({
        moduleId: z.string().uuid(),
        title: z.string().min(1),
        description: z.string().optional(),
        lessonType: z.enum(['video', 'audio', 'pdf', 'text', 'live']),
        contentUrl: z.string().optional(),
        contentText: z.string().optional(),
        durationSec: z.number().int().min(0).optional(),
        orderIndex: z.number().int().min(0),
        status: z.enum(['draft', 'scheduled', 'live']).default('live'),
        releaseAt: z.string().datetime().optional(),
        contentCategory: z
          .enum([
            'orientation',
            'transmission',
            'clarification',
            'embodiment',
            'inquiry',
            'meditation',
            'assignment',
          ])
          .optional(),
        scheduledAt: z.string().datetime().optional(),
        replayUrl: z.string().url().optional(),
        meetingUrl: z.string().url().optional(),
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
        .from('lessons')
        .insert({
          module_id: input.moduleId,
          title: input.title,
          description: input.description,
          lesson_type: input.lessonType,
          content_url: input.contentUrl,
          content_text: input.contentText,
          duration_sec: input.durationSec,
          order_index: input.orderIndex,
          status: input.status,
          release_at: input.releaseAt,
          is_published: input.status === 'live',
          content_category: input.contentCategory,
          scheduled_at: input.scheduledAt,
          replay_url: input.replayUrl,
          meeting_url: input.meetingUrl,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  updateLesson: tenantContentProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        lessonType: z.enum(['video', 'audio', 'pdf', 'text', 'meditation', 'live']).optional(),
        contentUrl: z.string().optional(),
        contentText: z.string().optional(),
        durationSec: z.number().int().min(0).optional(),
        orderIndex: z.number().int().min(0).optional(),
        status: z.enum(['draft', 'scheduled', 'live']).optional(),
        releaseAt: z.string().datetime().optional().nullable(),
        contentCategory: z
          .enum([
            'orientation',
            'transmission',
            'clarification',
            'embodiment',
            'inquiry',
            'meditation',
            'assignment',
          ])
          .optional()
          .nullable(),
        scheduledAt: z.string().datetime().optional().nullable(),
        replayUrl: z.string().url().optional().nullable(),
        meetingUrl: z.string().url().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      // Verify lesson's module's course belongs to current tenant
      const { data: lesson } = await ctx.supabase
        .from('lessons')
        .select('modules!inner(courses!inner(tenant_id))')
        .eq('id', id)
        .single()

      if (!lesson) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Lesson not found' })
      }

      const modules = lesson.modules as { courses: { tenant_id: string } }
      if (modules.courses.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Lesson not found' })
      }

      const { data, error } = await ctx.supabase
        .from('lessons')
        .update({
          ...(updates.title && { title: updates.title }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.lessonType && { lesson_type: updates.lessonType }),
          ...(updates.contentUrl !== undefined && { content_url: updates.contentUrl }),
          ...(updates.contentText !== undefined && { content_text: updates.contentText }),
          ...(updates.durationSec !== undefined && { duration_sec: updates.durationSec }),
          ...(updates.orderIndex !== undefined && { order_index: updates.orderIndex }),
          ...(updates.status !== undefined && {
            status: updates.status,
            is_published: updates.status === 'live',
          }),
          ...(updates.releaseAt !== undefined && { release_at: updates.releaseAt }),
          ...(updates.contentCategory !== undefined && { content_category: updates.contentCategory }),
          ...(updates.scheduledAt !== undefined && { scheduled_at: updates.scheduledAt }),
          ...(updates.replayUrl !== undefined && { replay_url: updates.replayUrl }),
          ...(updates.meetingUrl !== undefined && { meeting_url: updates.meetingUrl }),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  deleteLesson: tenantContentProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify lesson's module's course belongs to current tenant
      const { data: lesson } = await ctx.supabase
        .from('lessons')
        .select('modules!inner(courses!inner(tenant_id))')
        .eq('id', input.id)
        .single()

      if (!lesson) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Lesson not found' })
      }

      const modules = lesson.modules as { courses: { tenant_id: string } }
      if (modules.courses.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Lesson not found' })
      }

      const { error } = await ctx.supabase.from('lessons').delete().eq('id', input.id)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ============ REORDERING ============

  reorderModule: tenantContentProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        newOrderIndex: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify module's course belongs to current tenant
      const { data: module } = await ctx.supabase
        .from('modules')
        .select('courses!inner(tenant_id)')
        .eq('id', input.id)
        .single()

      if (!module || (module.courses as { tenant_id: string }).tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Module not found' })
      }

      const { data, error } = await ctx.supabase
        .from('modules')
        .update({ order_index: input.newOrderIndex })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  reorderLesson: tenantContentProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        newOrderIndex: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify lesson's module's course belongs to current tenant
      const { data: lesson } = await ctx.supabase
        .from('lessons')
        .select('modules!inner(courses!inner(tenant_id))')
        .eq('id', input.id)
        .single()

      if (!lesson) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Lesson not found' })
      }

      const modules = lesson.modules as { courses: { tenant_id: string } }
      if (modules.courses.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Lesson not found' })
      }

      const { data, error } = await ctx.supabase
        .from('lessons')
        .update({ order_index: input.newOrderIndex })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),
})
