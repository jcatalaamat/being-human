import { TRPCError } from '@trpc/server'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const userRouter = createTRPCRouter({
  requestAccountDeletion: protectedProcedure.mutation(async ({ ctx: { supabase, user } }) => {
    const { error } = await supabase
      .from('profiles')
      .update({ deletion_requested_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      console.error('Error requesting account deletion:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to submit deletion request',
      })
    }

    return { success: true }
  }),

  cancelDeletionRequest: protectedProcedure.mutation(async ({ ctx: { supabase, user } }) => {
    const { error } = await supabase
      .from('profiles')
      .update({ deletion_requested_at: null })
      .eq('id', user.id)

    if (error) {
      console.error('Error canceling deletion request:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to cancel deletion request',
      })
    }

    return { success: true }
  }),

  getDeletionStatus: protectedProcedure.query(async ({ ctx: { supabase, user } }) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('deletion_requested_at')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error getting deletion status:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get deletion status',
      })
    }

    return {
      deletionRequested: !!data.deletion_requested_at,
      requestedAt: data.deletion_requested_at,
    }
  }),
})
