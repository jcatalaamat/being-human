import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

// Admin router - for content management
export const adminRouter = createTRPCRouter({
  // ============ COURSES ============

  createCourse: protectedProcedure
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
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  updateCourse: protectedProcedure
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

  deleteCourse: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase.from('courses').delete().eq('id', input.id)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ============ MODULES ============

  createModule: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        title: z.string().min(1),
        description: z.string().optional(),
        orderIndex: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

  updateModule: protectedProcedure
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

  deleteModule: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase.from('modules').delete().eq('id', input.id)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ============ LESSONS ============

  createLesson: protectedProcedure
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

  updateLesson: protectedProcedure
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

  deleteLesson: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase.from('lessons').delete().eq('id', input.id)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ============ REORDERING ============

  reorderModule: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        newOrderIndex: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

  reorderLesson: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        newOrderIndex: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
