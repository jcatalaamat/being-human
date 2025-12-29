import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, tenantProcedure, tenantContentProcedure } from '../trpc'

// Schema for prompt field definition
const promptFieldSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'textarea', 'markdown']),
  label: z.string().min(1),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
})

export type PromptField = z.infer<typeof promptFieldSchema>

export const promptsRouter = createTRPCRouter({
  // ============ MEMBER ENDPOINTS ============

  // Get prompts for a lesson
  getForLesson: tenantProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: prompts, error } = await ctx.supabase
        .from('lesson_prompts')
        .select('*')
        .eq('lesson_id', input.lessonId)
        .eq('tenant_id', ctx.tenant.tenantId)
        .order('created_at', { ascending: true })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return prompts.map((p) => ({
        id: p.id,
        lessonId: p.lesson_id,
        title: p.title,
        promptBody: p.prompt_body,
        responseSchema: p.response_schema as PromptField[],
        required: p.required,
        dueMode: p.due_mode as 'none' | 'relative_days' | 'fixed_date',
        dueAt: p.due_at,
        createdAt: p.created_at,
      }))
    }),

  // Get user's response for a prompt
  getMyResponse: tenantProcedure
    .input(z.object({ promptId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: response } = await ctx.supabase
        .from('prompt_responses')
        .select('*')
        .eq('prompt_id', input.promptId)
        .eq('user_id', ctx.user.id)
        .maybeSingle()

      if (!response) {
        return null
      }

      // Get feedback if any
      const { data: feedback } = await ctx.supabase
        .from('prompt_feedback')
        .select('*, profiles!author_user_id(name, avatar_url)')
        .eq('response_id', response.id)
        .order('created_at', { ascending: true })

      return {
        id: response.id,
        promptId: response.prompt_id,
        response: response.response as Record<string, string>,
        status: response.status as 'draft' | 'submitted' | 'reviewed',
        submittedAt: response.submitted_at,
        reviewedAt: response.reviewed_at,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        feedback: (feedback || []).map((f) => ({
          id: f.id,
          body: f.body,
          createdAt: f.created_at,
          author: {
            name: (f.profiles as { name: string | null } | null)?.name || null,
            avatarUrl: (f.profiles as { avatar_url: string | null } | null)?.avatar_url || null,
          },
        })),
      }
    }),

  // Upsert response (for autosave)
  upsertResponse: tenantProcedure
    .input(
      z.object({
        promptId: z.string().uuid(),
        response: z.record(z.string(), z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify prompt exists and belongs to tenant
      const { data: prompt } = await ctx.supabase
        .from('lesson_prompts')
        .select('tenant_id')
        .eq('id', input.promptId)
        .single()

      if (!prompt || prompt.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Prompt not found' })
      }

      // Check if response already exists and is already submitted
      const { data: existing } = await ctx.supabase
        .from('prompt_responses')
        .select('status')
        .eq('prompt_id', input.promptId)
        .eq('user_id', ctx.user.id)
        .maybeSingle()

      if (existing && existing.status !== 'draft') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot update submitted response' })
      }

      const { data, error } = await ctx.supabase
        .from('prompt_responses')
        .upsert(
          {
            tenant_id: ctx.tenant.tenantId,
            prompt_id: input.promptId,
            user_id: ctx.user.id,
            response: input.response,
            status: 'draft',
          },
          {
            onConflict: 'prompt_id,user_id',
          }
        )
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: data.id,
        updatedAt: data.updated_at,
      }
    }),

  // Submit response (final)
  submitResponse: tenantProcedure
    .input(
      z.object({
        promptId: z.string().uuid(),
        response: z.record(z.string(), z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get prompt with schema for validation
      const { data: prompt } = await ctx.supabase
        .from('lesson_prompts')
        .select('tenant_id, response_schema')
        .eq('id', input.promptId)
        .single()

      if (!prompt || prompt.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Prompt not found' })
      }

      // Validate required fields
      const schema = prompt.response_schema as PromptField[]
      const requiredFields = schema.filter((f) => f.required)

      for (const field of requiredFields) {
        if (!input.response[field.id]?.trim()) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Required field "${field.label}" is missing`,
          })
        }
      }

      const { data, error } = await ctx.supabase
        .from('prompt_responses')
        .upsert(
          {
            tenant_id: ctx.tenant.tenantId,
            prompt_id: input.promptId,
            user_id: ctx.user.id,
            response: input.response,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          },
          {
            onConflict: 'prompt_id,user_id',
          }
        )
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: data.id,
        submittedAt: data.submitted_at,
      }
    }),

  // Get pending required prompts (for home action card)
  getPendingRequired: tenantProcedure.query(async ({ ctx }) => {
    // Get all required prompts for the tenant
    const { data: prompts, error } = await ctx.supabase
      .from('lesson_prompts')
      .select(
        `
        id,
        title,
        lesson_id,
        lessons!inner(
          title,
          modules!inner(
            title,
            courses!inner(
              id,
              title,
              tenant_id
            )
          )
        )
      `
      )
      .eq('tenant_id', ctx.tenant.tenantId)
      .eq('required', true)

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    if (!prompts || prompts.length === 0) {
      return []
    }

    // Get user's submitted responses
    const promptIds = prompts.map((p) => p.id)
    const { data: responses } = await ctx.supabase
      .from('prompt_responses')
      .select('prompt_id, status')
      .eq('user_id', ctx.user.id)
      .in('prompt_id', promptIds)
      .in('status', ['submitted', 'reviewed'])

    const submittedPromptIds = new Set((responses || []).map((r) => r.prompt_id))

    // Filter to unsubmitted prompts and check user is enrolled in the course
    const { data: enrollments } = await ctx.supabase
      .from('user_course_progress')
      .select('course_id')
      .eq('user_id', ctx.user.id)
      .eq('status', 'active')

    const enrolledCourseIds = new Set((enrollments || []).map((e) => e.course_id))

    const pendingPrompts = prompts
      .filter((p) => {
        if (submittedPromptIds.has(p.id)) return false

        const lessons = p.lessons as {
          title: string
          modules: {
            title: string
            courses: { id: string; title: string; tenant_id: string }
          }
        }
        const courseId = lessons.modules.courses.id

        return enrolledCourseIds.has(courseId)
      })
      .map((p) => {
        const lessons = p.lessons as {
          title: string
          modules: {
            title: string
            courses: { id: string; title: string; tenant_id: string }
          }
        }

        return {
          id: p.id,
          title: p.title,
          lessonId: p.lesson_id,
          lessonTitle: lessons.title,
          moduleTitle: lessons.modules.title,
          courseTitle: lessons.modules.courses.title,
        }
      })

    return pendingPrompts
  }),

  // ============ STAFF ENDPOINTS ============

  // List responses for staff review
  listResponses: tenantContentProcedure
    .input(
      z
        .object({
          promptId: z.string().uuid().optional(),
          lessonId: z.string().uuid().optional(),
          courseId: z.string().uuid().optional(),
          status: z.enum(['draft', 'submitted', 'reviewed']).optional(),
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('prompt_responses')
        .select(
          `
          *,
          profiles!user_id(name, avatar_url),
          lesson_prompts!inner(
            title,
            lessons!inner(
              title,
              modules!inner(
                courses!inner(id, title)
              )
            )
          )
        `,
          { count: 'exact' }
        )
        .eq('tenant_id', ctx.tenant.tenantId)
        .order('submitted_at', { ascending: false, nullsFirst: false })
        .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 20) - 1)

      if (input?.promptId) query = query.eq('prompt_id', input.promptId)
      if (input?.status) query = query.eq('status', input.status)

      const { data: responses, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Filter by course if specified
      let filteredResponses = responses
      if (input?.courseId) {
        filteredResponses = responses.filter((r) => {
          const prompt = r.lesson_prompts as {
            title: string
            lessons: { title: string; modules: { courses: { id: string; title: string } } }
          }
          return prompt.lessons.modules.courses.id === input.courseId
        })
      }

      // Filter by lesson if specified
      if (input?.lessonId) {
        const { data: prompts } = await ctx.supabase
          .from('lesson_prompts')
          .select('id')
          .eq('lesson_id', input.lessonId)

        const promptIds = new Set((prompts || []).map((p) => p.id))
        filteredResponses = filteredResponses.filter((r) => promptIds.has(r.prompt_id))
      }

      return {
        responses: filteredResponses.map((r) => {
          const prompt = r.lesson_prompts as {
            title: string
            lessons: { title: string; modules: { courses: { id: string; title: string } } }
          }

          return {
            id: r.id,
            promptId: r.prompt_id,
            promptTitle: prompt.title,
            lessonTitle: prompt.lessons.title,
            courseTitle: prompt.lessons.modules.courses.title,
            response: r.response as Record<string, string>,
            status: r.status as 'draft' | 'submitted' | 'reviewed',
            submittedAt: r.submitted_at,
            reviewedAt: r.reviewed_at,
            user: {
              id: r.user_id,
              name: (r.profiles as { name: string | null } | null)?.name || null,
              avatarUrl: (r.profiles as { avatar_url: string | null } | null)?.avatar_url || null,
            },
          }
        }),
        total: count || 0,
      }
    }),

  // Get single response detail for staff
  getResponseDetail: tenantContentProcedure
    .input(z.object({ responseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: response, error } = await ctx.supabase
        .from('prompt_responses')
        .select(
          `
          *,
          profiles!user_id(name, avatar_url),
          lesson_prompts!inner(
            title,
            prompt_body,
            response_schema,
            lessons!inner(title)
          )
        `
        )
        .eq('id', input.responseId)
        .eq('tenant_id', ctx.tenant.tenantId)
        .single()

      if (error || !response) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Response not found' })
      }

      // Get feedback
      const { data: feedback } = await ctx.supabase
        .from('prompt_feedback')
        .select('*, profiles!author_user_id(name, avatar_url)')
        .eq('response_id', input.responseId)
        .order('created_at', { ascending: true })

      const prompt = response.lesson_prompts as {
        title: string
        prompt_body: string
        response_schema: PromptField[]
        lessons: { title: string }
      }

      return {
        id: response.id,
        promptId: response.prompt_id,
        promptTitle: prompt.title,
        promptBody: prompt.prompt_body,
        responseSchema: prompt.response_schema,
        lessonTitle: prompt.lessons.title,
        response: response.response as Record<string, string>,
        status: response.status as 'draft' | 'submitted' | 'reviewed',
        submittedAt: response.submitted_at,
        reviewedAt: response.reviewed_at,
        user: {
          id: response.user_id,
          name: (response.profiles as { name: string | null } | null)?.name || null,
          avatarUrl: (response.profiles as { avatar_url: string | null } | null)?.avatar_url || null,
        },
        feedback: (feedback || []).map((f) => ({
          id: f.id,
          body: f.body,
          createdAt: f.created_at,
          author: {
            name: (f.profiles as { name: string | null } | null)?.name || null,
            avatarUrl: (f.profiles as { avatar_url: string | null } | null)?.avatar_url || null,
          },
        })),
      }
    }),

  // Add feedback to a response
  addFeedback: tenantContentProcedure
    .input(
      z.object({
        responseId: z.string().uuid(),
        body: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify response belongs to tenant
      const { data: response } = await ctx.supabase
        .from('prompt_responses')
        .select('tenant_id')
        .eq('id', input.responseId)
        .single()

      if (!response || response.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Response not found' })
      }

      // Add feedback
      const { data, error } = await ctx.supabase
        .from('prompt_feedback')
        .insert({
          tenant_id: ctx.tenant.tenantId,
          response_id: input.responseId,
          author_user_id: ctx.user.id,
          body: input.body,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Mark response as reviewed
      await ctx.supabase
        .from('prompt_responses')
        .update({
          status: 'reviewed',
          reviewed_by: ctx.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', input.responseId)

      return {
        id: data.id,
        createdAt: data.created_at,
      }
    }),

  // Mark response as reviewed without feedback
  markReviewed: tenantContentProcedure
    .input(z.object({ responseId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('prompt_responses')
        .update({
          status: 'reviewed',
          reviewed_by: ctx.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', input.responseId)
        .eq('tenant_id', ctx.tenant.tenantId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: data.id,
        reviewedAt: data.reviewed_at,
      }
    }),

  // Create a prompt for a lesson (admin)
  createPrompt: tenantContentProcedure
    .input(
      z.object({
        lessonId: z.string().uuid(),
        title: z.string().min(1).max(255),
        promptBody: z.string().min(1),
        responseSchema: z.array(promptFieldSchema),
        required: z.boolean().default(false),
        dueMode: z.enum(['none', 'relative_days', 'fixed_date']).default('none'),
        dueAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify lesson belongs to tenant's course
      const { data: lesson } = await ctx.supabase
        .from('lessons')
        .select('modules!inner(courses!inner(tenant_id))')
        .eq('id', input.lessonId)
        .single()

      if (!lesson) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Lesson not found' })
      }

      const tenantId = (lesson.modules as { courses: { tenant_id: string } }).courses.tenant_id
      if (tenantId !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      const { data, error } = await ctx.supabase
        .from('lesson_prompts')
        .insert({
          tenant_id: ctx.tenant.tenantId,
          lesson_id: input.lessonId,
          title: input.title,
          prompt_body: input.promptBody,
          response_schema: input.responseSchema,
          required: input.required,
          due_mode: input.dueMode,
          due_at: input.dueAt,
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

  // Update a prompt
  updatePrompt: tenantContentProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(255).optional(),
        promptBody: z.string().min(1).optional(),
        responseSchema: z.array(promptFieldSchema).optional(),
        required: z.boolean().optional(),
        dueMode: z.enum(['none', 'relative_days', 'fixed_date']).optional(),
        dueAt: z.string().datetime().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      // Verify prompt belongs to tenant
      const { data: existing } = await ctx.supabase
        .from('lesson_prompts')
        .select('tenant_id')
        .eq('id', id)
        .single()

      if (!existing || existing.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Prompt not found' })
      }

      const updateData: Record<string, unknown> = {}
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.promptBody !== undefined) updateData.prompt_body = updates.promptBody
      if (updates.responseSchema !== undefined) updateData.response_schema = updates.responseSchema
      if (updates.required !== undefined) updateData.required = updates.required
      if (updates.dueMode !== undefined) updateData.due_mode = updates.dueMode
      if (updates.dueAt !== undefined) updateData.due_at = updates.dueAt

      const { data, error } = await ctx.supabase
        .from('lesson_prompts')
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

  // Delete a prompt
  deletePrompt: tenantContentProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify prompt belongs to tenant
      const { data: existing } = await ctx.supabase
        .from('lesson_prompts')
        .select('tenant_id')
        .eq('id', input.id)
        .single()

      if (!existing || existing.tenant_id !== ctx.tenant.tenantId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Prompt not found' })
      }

      const { error } = await ctx.supabase.from('lesson_prompts').delete().eq('id', input.id)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),
})
