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
        isPublished: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('courses')
        .insert({
          title: input.title,
          description: input.description,
          cover_url: input.coverUrl,
          is_published: input.isPublished,
          tenant_id: ctx.tenant.tenantId, // Assign to current tenant
          instructor_id: ctx.user.id,
          created_at: new Date().toISOString(),
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
        coverUrl: z.string().url().optional(),
        promoVideoUrl: z.string().url().optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      // Verify course belongs to current tenant
      const { data: course } = await ctx.supabase
        .from('courses')
        .select('tenant_id')
        .eq('id', id)
        .single()

      if (!course || course.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' })
      }

      const { data, error } = await ctx.supabase
        .from('courses')
        .update({
          ...(updates.title && { title: updates.title }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.coverUrl !== undefined && { cover_url: updates.coverUrl }),
          ...(updates.promoVideoUrl !== undefined && { promo_video_url: updates.promoVideoUrl }),
          ...(updates.isPublished !== undefined && { is_published: updates.isPublished }),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
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
        lessonType: z.enum(['video', 'audio', 'pdf', 'text']),
        contentUrl: z.string().optional(),
        contentText: z.string().optional(),
        durationSec: z.number().int().min(0).optional(),
        orderIndex: z.number().int().min(0),
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
        lessonType: z.enum(['video', 'audio', 'pdf', 'text']).optional(),
        contentUrl: z.string().optional(),
        contentText: z.string().optional(),
        durationSec: z.number().int().min(0).optional(),
        orderIndex: z.number().int().min(0).optional(),
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
