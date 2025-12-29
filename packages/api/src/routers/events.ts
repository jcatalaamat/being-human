import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, tenantProcedure, tenantContentProcedure } from '../trpc'

export const eventsRouter = createTRPCRouter({
  // List upcoming events for the current tenant
  listUpcoming: tenantProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          courseId: z.string().uuid().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const now = new Date().toISOString()

      let query = ctx.supabase
        .from('events')
        .select('*, courses(title)')
        .eq('tenant_id', ctx.tenant.tenantId)
        .gte('starts_at', now)
        .order('starts_at', { ascending: true })
        .limit(input?.limit || 20)

      if (input?.courseId) {
        query = query.eq('course_id', input.courseId)
      }

      const { data: events, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        startsAt: e.starts_at,
        endsAt: e.ends_at,
        timezone: e.timezone,
        meetingUrl: e.meeting_url,
        replayUrl: e.replay_url,
        visibility: e.visibility as 'tenant_members' | 'course_enrolled',
        courseId: e.course_id,
        courseTitle: (e.courses as { title: string } | null)?.title || null,
      }))
    }),

  // List events in a date range
  listRange: tenantProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        courseId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('events')
        .select('*, courses(title)')
        .eq('tenant_id', ctx.tenant.tenantId)
        .gte('starts_at', input.startDate)
        .lte('starts_at', input.endDate)
        .order('starts_at', { ascending: true })

      if (input.courseId) {
        query = query.eq('course_id', input.courseId)
      }

      const { data: events, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        startsAt: e.starts_at,
        endsAt: e.ends_at,
        timezone: e.timezone,
        meetingUrl: e.meeting_url,
        replayUrl: e.replay_url,
        visibility: e.visibility as 'tenant_members' | 'course_enrolled',
        courseId: e.course_id,
        courseTitle: (e.courses as { title: string } | null)?.title || null,
      }))
    }),

  // Get single event by ID
  getById: tenantProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: event, error } = await ctx.supabase
        .from('events')
        .select('*, courses(title)')
        .eq('id', input.eventId)
        .eq('tenant_id', ctx.tenant.tenantId)
        .single()

      if (error || !event) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      }

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        startsAt: event.starts_at,
        endsAt: event.ends_at,
        timezone: event.timezone,
        meetingUrl: event.meeting_url,
        replayUrl: event.replay_url,
        visibility: event.visibility as 'tenant_members' | 'course_enrolled',
        courseId: event.course_id,
        courseTitle: (event.courses as { title: string } | null)?.title || null,
        createdBy: event.created_by,
        createdAt: event.created_at,
      }
    }),

  // Get next upcoming event (for home screen card)
  getNextUpcoming: tenantProcedure.query(async ({ ctx }) => {
    const now = new Date().toISOString()

    const { data: event, error } = await ctx.supabase
      .from('events')
      .select('*')
      .eq('tenant_id', ctx.tenant.tenantId)
      .gte('starts_at', now)
      .order('starts_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    if (!event) {
      return null
    }

    return {
      id: event.id,
      title: event.title,
      startsAt: event.starts_at,
      timezone: event.timezone,
      meetingUrl: event.meeting_url,
    }
  }),

  // Create a new event (staff only)
  create: tenantContentProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        startsAt: z.string().datetime(),
        endsAt: z.string().datetime().optional(),
        timezone: z.string().default('UTC'),
        meetingUrl: z.string().url().optional(),
        replayUrl: z.string().url().optional(),
        visibility: z.enum(['tenant_members', 'course_enrolled']).default('tenant_members'),
        courseId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If course_id provided, verify it belongs to current tenant
      if (input.courseId) {
        const { data: course } = await ctx.supabase
          .from('courses')
          .select('tenant_id')
          .eq('id', input.courseId)
          .single()

        if (!course || course.tenant_id !== ctx.tenant.tenantId) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' })
        }
      }

      const { data, error } = await ctx.supabase
        .from('events')
        .insert({
          tenant_id: ctx.tenant.tenantId,
          title: input.title,
          description: input.description,
          starts_at: input.startsAt,
          ends_at: input.endsAt,
          timezone: input.timezone,
          meeting_url: input.meetingUrl,
          replay_url: input.replayUrl,
          visibility: input.visibility,
          course_id: input.courseId,
          created_by: ctx.user.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: data.id,
        title: data.title,
        startsAt: data.starts_at,
      }
    }),

  // Update an event (staff only)
  update: tenantContentProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional().nullable(),
        startsAt: z.string().datetime().optional(),
        endsAt: z.string().datetime().optional().nullable(),
        timezone: z.string().optional(),
        meetingUrl: z.string().url().optional().nullable(),
        replayUrl: z.string().url().optional().nullable(),
        visibility: z.enum(['tenant_members', 'course_enrolled']).optional(),
        courseId: z.string().uuid().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      // Verify event belongs to tenant
      const { data: existing } = await ctx.supabase
        .from('events')
        .select('tenant_id')
        .eq('id', id)
        .single()

      if (!existing || existing.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      }

      // If course_id provided, verify it belongs to current tenant
      if (updates.courseId) {
        const { data: course } = await ctx.supabase
          .from('courses')
          .select('tenant_id')
          .eq('id', updates.courseId)
          .single()

        if (!course || course.tenant_id !== ctx.tenant.tenantId) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' })
        }
      }

      const updateData: Record<string, unknown> = {}
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.startsAt !== undefined) updateData.starts_at = updates.startsAt
      if (updates.endsAt !== undefined) updateData.ends_at = updates.endsAt
      if (updates.timezone !== undefined) updateData.timezone = updates.timezone
      if (updates.meetingUrl !== undefined) updateData.meeting_url = updates.meetingUrl
      if (updates.replayUrl !== undefined) updateData.replay_url = updates.replayUrl
      if (updates.visibility !== undefined) updateData.visibility = updates.visibility
      if (updates.courseId !== undefined) updateData.course_id = updates.courseId

      const { data, error } = await ctx.supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: data.id,
        title: data.title,
        startsAt: data.starts_at,
      }
    }),

  // Delete an event (staff only)
  delete: tenantContentProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify event belongs to tenant
      const { data: existing } = await ctx.supabase
        .from('events')
        .select('tenant_id')
        .eq('id', input.id)
        .single()

      if (!existing || existing.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      }

      const { error } = await ctx.supabase.from('events').delete().eq('id', input.id)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),
})
