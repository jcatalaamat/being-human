import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, tenantProcedure, tenantContentProcedure } from '../trpc'

export const journalRouter = createTRPCRouter({
  // ============ MEMBER ENDPOINTS ============

  // List user's own journal entries
  listMine: tenantProcedure
    .input(
      z
        .object({
          courseId: z.string().uuid().optional(),
          lessonId: z.string().uuid().optional(),
          status: z.enum(['active', 'archived', 'flagged']).optional(),
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('journal_entries')
        .select('*, courses(title), lessons(title)', { count: 'exact' })
        .eq('tenant_id', ctx.tenant.tenantId)
        .eq('author_user_id', ctx.user.id)
        .order('created_at', { ascending: false })
        .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 20) - 1)

      if (input?.courseId) query = query.eq('course_id', input.courseId)
      if (input?.lessonId) query = query.eq('lesson_id', input.lessonId)
      if (input?.status) query = query.eq('status', input.status)

      const { data: entries, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        entries: entries.map((e) => ({
          id: e.id,
          title: e.title,
          body: e.body,
          status: e.status as 'active' | 'archived' | 'flagged',
          visibility: e.visibility as 'staff' | 'cohort',
          courseId: e.course_id,
          courseTitle: (e.courses as { title: string } | null)?.title || null,
          lessonId: e.lesson_id,
          lessonTitle: (e.lessons as { title: string } | null)?.title || null,
          createdAt: e.created_at,
          updatedAt: e.updated_at,
        })),
        total: count || 0,
      }
    }),

  // Get single entry with comments
  getEntry: tenantProcedure
    .input(z.object({ entryId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: entry, error } = await ctx.supabase
        .from('journal_entries')
        .select('*, courses(title), lessons(title), profiles!author_user_id(name, avatar_url)')
        .eq('id', input.entryId)
        .single()

      if (error || !entry) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Entry not found' })
      }

      // Verify access (own entry or staff)
      const isOwner = entry.author_user_id === ctx.user.id
      const isStaff = ['owner', 'admin', 'instructor'].includes(ctx.tenant.role)

      if (!isOwner && !isStaff) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      // Get comments with author info
      const { data: comments } = await ctx.supabase
        .from('journal_comments')
        .select('*, profiles!author_user_id(name, avatar_url)')
        .eq('entry_id', input.entryId)
        .order('created_at', { ascending: true })

      // If staff is viewing, mark as read
      if (isStaff && !isOwner) {
        await ctx.supabase.from('journal_read_receipts').upsert(
          {
            entry_id: input.entryId,
            staff_user_id: ctx.user.id,
            tenant_id: ctx.tenant.tenantId,
            read_at: new Date().toISOString(),
          },
          {
            onConflict: 'entry_id,staff_user_id',
          }
        )
      }

      return {
        id: entry.id,
        title: entry.title,
        body: entry.body,
        status: entry.status as 'active' | 'archived' | 'flagged',
        visibility: entry.visibility as 'staff' | 'cohort',
        courseId: entry.course_id,
        courseTitle: (entry.courses as { title: string } | null)?.title || null,
        moduleId: entry.module_id,
        lessonId: entry.lesson_id,
        lessonTitle: (entry.lessons as { title: string } | null)?.title || null,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
        isOwner,
        author: {
          id: entry.author_user_id,
          name: (entry.profiles as { name: string | null } | null)?.name || null,
          avatarUrl: (entry.profiles as { avatar_url: string | null } | null)?.avatar_url || null,
        },
        comments: (comments || []).map((c) => ({
          id: c.id,
          body: c.body,
          authorUserId: c.author_user_id,
          isStaffComment: c.author_user_id !== entry.author_user_id,
          createdAt: c.created_at,
          author: {
            name: (c.profiles as { name: string | null } | null)?.name || null,
            avatarUrl: (c.profiles as { avatar_url: string | null } | null)?.avatar_url || null,
          },
        })),
      }
    }),

  // Create a new journal entry
  createEntry: tenantProcedure
    .input(
      z.object({
        title: z.string().max(255).optional(),
        body: z.string().min(1),
        courseId: z.string().uuid().optional(),
        moduleId: z.string().uuid().optional(),
        lessonId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('journal_entries')
        .insert({
          tenant_id: ctx.tenant.tenantId,
          author_user_id: ctx.user.id,
          title: input.title,
          body: input.body,
          course_id: input.courseId,
          module_id: input.moduleId,
          lesson_id: input.lessonId,
          visibility: 'staff',
          status: 'active',
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: data.id,
        title: data.title,
        createdAt: data.created_at,
      }
    }),

  // Update a journal entry
  updateEntry: tenantProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().max(255).optional(),
        body: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      // Verify ownership and active status
      const { data: existing } = await ctx.supabase
        .from('journal_entries')
        .select('author_user_id, status')
        .eq('id', id)
        .single()

      if (!existing || existing.author_user_id !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Entry not found' })
      }

      if (existing.status !== 'active') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot edit archived or flagged entries' })
      }

      const updateData: Record<string, unknown> = {}
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.body !== undefined) updateData.body = updates.body

      const { data, error } = await ctx.supabase
        .from('journal_entries')
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
        updatedAt: data.updated_at,
      }
    }),

  // Delete a journal entry (only active ones)
  deleteEntry: tenantProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership and active status
      const { data: existing } = await ctx.supabase
        .from('journal_entries')
        .select('author_user_id, status')
        .eq('id', input.id)
        .single()

      if (!existing || existing.author_user_id !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Entry not found' })
      }

      if (existing.status !== 'active') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot delete archived or flagged entries' })
      }

      const { error } = await ctx.supabase.from('journal_entries').delete().eq('id', input.id)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Add a comment to an entry
  addComment: tenantProcedure
    .input(
      z.object({
        entryId: z.string().uuid(),
        body: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify access to entry
      const { data: entry } = await ctx.supabase
        .from('journal_entries')
        .select('author_user_id, tenant_id')
        .eq('id', input.entryId)
        .single()

      if (!entry) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Entry not found' })
      }

      const isOwner = entry.author_user_id === ctx.user.id
      const isStaff = ['owner', 'admin', 'instructor'].includes(ctx.tenant.role)

      if (!isOwner && !isStaff) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const { data, error } = await ctx.supabase
        .from('journal_comments')
        .insert({
          tenant_id: ctx.tenant.tenantId,
          entry_id: input.entryId,
          author_user_id: ctx.user.id,
          body: input.body,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: data.id,
        createdAt: data.created_at,
      }
    }),

  // ============ STAFF ENDPOINTS ============

  // List entries for staff review (inbox)
  listForStaff: tenantContentProcedure
    .input(
      z
        .object({
          status: z.enum(['active', 'archived', 'flagged']).optional(),
          courseId: z.string().uuid().optional(),
          unreadOnly: z.boolean().optional(),
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('journal_entries')
        .select(
          `
          *,
          profiles!author_user_id(name, avatar_url),
          courses(title)
        `,
          { count: 'exact' }
        )
        .eq('tenant_id', ctx.tenant.tenantId)
        .order('created_at', { ascending: false })
        .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 20) - 1)

      if (input?.status) {
        query = query.eq('status', input.status)
      }

      if (input?.courseId) {
        query = query.eq('course_id', input.courseId)
      }

      const { data: entries, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Get read receipts for current staff user
      const entryIds = entries.map((e) => e.id)
      const { data: receipts } = await ctx.supabase
        .from('journal_read_receipts')
        .select('entry_id')
        .eq('staff_user_id', ctx.user.id)
        .in('entry_id', entryIds.length > 0 ? entryIds : ['00000000-0000-0000-0000-000000000000'])

      const readEntryIds = new Set((receipts || []).map((r) => r.entry_id))

      let result = entries.map((e) => ({
        id: e.id,
        title: e.title,
        bodyPreview: e.body?.substring(0, 200) || '',
        status: e.status as 'active' | 'archived' | 'flagged',
        courseTitle: (e.courses as { title: string } | null)?.title || null,
        createdAt: e.created_at,
        isRead: readEntryIds.has(e.id),
        author: {
          id: e.author_user_id,
          name: (e.profiles as { name: string | null } | null)?.name || null,
          avatarUrl: (e.profiles as { avatar_url: string | null } | null)?.avatar_url || null,
        },
      }))

      if (input?.unreadOnly) {
        result = result.filter((e) => !e.isRead)
      }

      return {
        entries: result,
        total: count || 0,
      }
    }),

  // Mark entry as read
  markRead: tenantContentProcedure
    .input(z.object({ entryId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify entry exists and belongs to tenant
      const { data: entry } = await ctx.supabase
        .from('journal_entries')
        .select('tenant_id')
        .eq('id', input.entryId)
        .single()

      if (!entry || entry.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Entry not found' })
      }

      const { error } = await ctx.supabase.from('journal_read_receipts').upsert(
        {
          entry_id: input.entryId,
          staff_user_id: ctx.user.id,
          tenant_id: ctx.tenant.tenantId,
          read_at: new Date().toISOString(),
        },
        {
          onConflict: 'entry_id,staff_user_id',
        }
      )

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Update entry status (archive/flag)
  setStatus: tenantContentProcedure
    .input(
      z.object({
        entryId: z.string().uuid(),
        status: z.enum(['active', 'archived', 'flagged']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('journal_entries')
        .update({ status: input.status })
        .eq('id', input.entryId)
        .eq('tenant_id', ctx.tenant.tenantId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: data.id,
        status: data.status,
      }
    }),

  // Get unread count for staff inbox badge
  getUnreadCount: tenantContentProcedure.query(async ({ ctx }) => {
    // Get all active entries in tenant
    const { data: entries, error } = await ctx.supabase
      .from('journal_entries')
      .select('id')
      .eq('tenant_id', ctx.tenant.tenantId)
      .eq('status', 'active')

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    if (!entries || entries.length === 0) {
      return { count: 0 }
    }

    // Get read receipts for current user
    const { data: receipts } = await ctx.supabase
      .from('journal_read_receipts')
      .select('entry_id')
      .eq('staff_user_id', ctx.user.id)
      .in(
        'entry_id',
        entries.map((e) => e.id)
      )

    const readCount = receipts?.length || 0
    const unreadCount = entries.length - readCount

    return { count: unreadCount }
  }),
})
