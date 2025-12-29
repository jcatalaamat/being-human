import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import {
  createTRPCRouter,
  protectedProcedure,
  tenantAdminProcedure,
  tenantProcedure,
} from '../trpc'

export const tenantsRouter = createTRPCRouter({
  // ============================================================================
  // PUBLIC/PROTECTED ENDPOINTS (no tenant context required)
  // ============================================================================

  // Create a new tenant (user becomes owner)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        slug: z
          .string()
          .min(2)
          .max(100)
          .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check slug availability
      const { data: existing } = await ctx.supabase.from('tenants').select('id').eq('slug', input.slug).single()

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This URL slug is already taken',
        })
      }

      // Create tenant
      const { data: tenant, error: tenantError } = await ctx.supabase
        .from('tenants')
        .insert({
          name: input.name,
          slug: input.slug,
          description: input.description,
        })
        .select()
        .single()

      if (tenantError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: tenantError.message,
        })
      }

      // Add creator as owner
      const { error: memberError } = await ctx.supabase.from('tenant_memberships').insert({
        tenant_id: tenant.id,
        user_id: ctx.user.id,
        role: 'owner',
        accepted_at: new Date().toISOString(),
      })

      if (memberError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: memberError.message,
        })
      }

      return tenant
    }),

  // List user's tenants (no tenant context needed)
  listMine: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('tenant_memberships')
      .select(
        `
        role,
        tenants (
          id,
          name,
          slug,
          logo_url,
          is_active
        )
      `
      )
      .eq('user_id', ctx.user.id)
      .not('tenants', 'is', null)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return data
      .filter((m) => m.tenants)
      .map((m) => ({
        ...(m.tenants as { id: string; name: string; slug: string; logo_url: string | null; is_active: boolean }),
        role: m.role,
      }))
  }),

  // ============================================================================
  // TENANT-SCOPED ENDPOINTS (require tenant context)
  // ============================================================================

  // Get current tenant details
  getCurrent: tenantProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.from('tenants').select('*').eq('id', ctx.tenant.tenantId).single()

    if (error) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tenant not found',
      })
    }

    return {
      ...data,
      userRole: ctx.tenant.role,
    }
  }),

  // ============================================================================
  // ADMIN ENDPOINTS (require owner or admin role)
  // ============================================================================

  // Update tenant settings
  update: tenantAdminProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255).optional(),
        description: z.string().optional(),
        logoUrl: z.string().url().optional().nullable(),
        settings: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = {}
      if (input.name !== undefined) updateData.name = input.name
      if (input.description !== undefined) updateData.description = input.description
      if (input.logoUrl !== undefined) updateData.logo_url = input.logoUrl
      if (input.settings !== undefined) updateData.settings = input.settings

      const { data, error } = await ctx.supabase
        .from('tenants')
        .update(updateData)
        .eq('id', ctx.tenant.tenantId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // List tenant members
  listMembers: tenantAdminProcedure.query(async ({ ctx }) => {
    const { data: memberships, error } = await ctx.supabase
      .from('tenant_memberships')
      .select(
        `
        id,
        role,
        created_at,
        accepted_at,
        user_id,
        profiles!inner (
          id,
          name,
          avatar_url
        )
      `
      )
      .eq('tenant_id', ctx.tenant.tenantId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    // Get emails for each user
    const membersWithEmail = await Promise.all(
      memberships.map(async (m) => {
        const { data: authUser } = await ctx.supabase.auth.admin.getUserById(m.user_id)
        return {
          id: m.id,
          userId: m.user_id,
          role: m.role,
          createdAt: m.created_at,
          acceptedAt: m.accepted_at,
          profile: m.profiles as { id: string; name: string | null; avatar_url: string | null },
          email: authUser?.user?.email || null,
        }
      })
    )

    return membersWithEmail
  }),

  // Add member to tenant
  addMember: tenantAdminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: z.enum(['admin', 'instructor', 'member']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if already a member
      const { data: existing } = await ctx.supabase
        .from('tenant_memberships')
        .select('id')
        .eq('tenant_id', ctx.tenant.tenantId)
        .eq('user_id', input.userId)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is already a member of this tenant',
        })
      }

      const { data, error } = await ctx.supabase
        .from('tenant_memberships')
        .insert({
          tenant_id: ctx.tenant.tenantId,
          user_id: input.userId,
          role: input.role,
          invited_by: ctx.user.id,
          invited_at: new Date().toISOString(),
          accepted_at: new Date().toISOString(), // Auto-accept for now
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Update member role
  updateMemberRole: tenantAdminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: z.enum(['admin', 'instructor', 'member']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is the owner (cannot change owner role)
      const { data: membership } = await ctx.supabase
        .from('tenant_memberships')
        .select('role')
        .eq('tenant_id', ctx.tenant.tenantId)
        .eq('user_id', input.userId)
        .single()

      if (!membership) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Member not found',
        })
      }

      if (membership.role === 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot change owner role',
        })
      }

      const { data, error } = await ctx.supabase
        .from('tenant_memberships')
        .update({ role: input.role })
        .eq('tenant_id', ctx.tenant.tenantId)
        .eq('user_id', input.userId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Remove member
  removeMember: tenantAdminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is the owner (cannot remove owner)
      const { data: membership } = await ctx.supabase
        .from('tenant_memberships')
        .select('role')
        .eq('tenant_id', ctx.tenant.tenantId)
        .eq('user_id', input.userId)
        .single()

      if (!membership) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Member not found',
        })
      }

      if (membership.role === 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot remove tenant owner',
        })
      }

      const { error } = await ctx.supabase
        .from('tenant_memberships')
        .delete()
        .eq('tenant_id', ctx.tenant.tenantId)
        .eq('user_id', input.userId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),

  // ============================================================================
  // INVITATIONS
  // ============================================================================

  // List pending invitations
  listInvitations: tenantAdminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('tenant_invitations')
      .select('*')
      .eq('tenant_id', ctx.tenant.tenantId)
      .is('accepted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return data
  }),

  // Create invitation
  createInvitation: tenantAdminProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(['admin', 'instructor', 'member']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if already invited
      const { data: existing } = await ctx.supabase
        .from('tenant_invitations')
        .select('id')
        .eq('tenant_id', ctx.tenant.tenantId)
        .eq('email', input.email)
        .is('accepted_at', null)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Invitation already sent to this email',
        })
      }

      const { data, error } = await ctx.supabase
        .from('tenant_invitations')
        .insert({
          tenant_id: ctx.tenant.tenantId,
          email: input.email,
          role: input.role,
          invited_by: ctx.user.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      // TODO: Send invitation email

      return data
    }),

  // Delete invitation
  deleteInvitation: tenantAdminProcedure
    .input(
      z.object({
        invitationId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('tenant_invitations')
        .delete()
        .eq('id', input.invitationId)
        .eq('tenant_id', ctx.tenant.tenantId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),

  // Accept invitation (user accepting their own invitation)
  acceptInvitation: protectedProcedure
    .input(
      z.object({
        token: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find invitation by token
      const { data: invitation, error: findError } = await ctx.supabase
        .from('tenant_invitations')
        .select('*')
        .eq('token', input.token)
        .is('accepted_at', null)
        .single()

      if (findError || !invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid or expired invitation',
        })
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invitation has expired',
        })
      }

      // Get user's email
      const { data: authUser } = await ctx.supabase.auth.getUser()
      if (authUser.user?.email?.toLowerCase() !== invitation.email.toLowerCase()) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This invitation is for a different email address',
        })
      }

      // Create membership
      const { error: memberError } = await ctx.supabase.from('tenant_memberships').insert({
        tenant_id: invitation.tenant_id,
        user_id: ctx.user.id,
        role: invitation.role,
        invited_by: invitation.invited_by,
        invited_at: invitation.created_at,
        accepted_at: new Date().toISOString(),
      })

      if (memberError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: memberError.message,
        })
      }

      // Mark invitation as accepted
      await ctx.supabase
        .from('tenant_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id)

      return { success: true, tenantId: invitation.tenant_id }
    }),
})
