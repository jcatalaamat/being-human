import { useSessionContext } from '@supabase/auth-helpers-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { api } from '../../utils/api'
import { Tenant, TenantContext, setCurrentTenantSlug } from './TenantContext'

const TENANT_STORAGE_KEY = 'current-tenant-slug'

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSessionContext()
  const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch user's tenants - only when authenticated
  const {
    data: tenantsData,
    isLoading,
    refetch,
  } = api.tenants.listMine.useQuery(undefined, {
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const tenants: Tenant[] = useMemo(() => {
    return (
      tenantsData?.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        logoUrl: t.logoUrl,
        role: t.role,
      })) ?? []
    )
  }, [tenantsData])

  // Initialize tenant from storage or first available
  useEffect(() => {
    if (isLoading || isInitialized) return
    if (!session?.user) {
      // Not logged in - clear tenant
      setCurrentTenantState(null)
      setCurrentTenantSlug(null)
      setIsInitialized(true)
      return
    }

    if (tenants.length === 0) {
      setCurrentTenantState(null)
      setCurrentTenantSlug(null)
      setIsInitialized(true)
      return
    }

    // Try to restore from localStorage
    let storedSlug: string | null = null
    if (typeof window !== 'undefined') {
      storedSlug = localStorage.getItem(TENANT_STORAGE_KEY)
    }

    const storedTenant = storedSlug ? tenants.find((t) => t.slug === storedSlug) : null
    const tenantToSet = storedTenant ?? tenants[0]

    if (tenantToSet) {
      setCurrentTenantState(tenantToSet)
      setCurrentTenantSlug(tenantToSet.slug)
    }

    setIsInitialized(true)
  }, [tenants, isLoading, session?.user, isInitialized])

  // Clear tenant on logout
  useEffect(() => {
    if (!session?.user) {
      setCurrentTenantState(null)
      setCurrentTenantSlug(null)
      setIsInitialized(false)
    }
  }, [session?.user])

  const setCurrentTenant = useCallback((tenant: Tenant) => {
    setCurrentTenantState(tenant)
    setCurrentTenantSlug(tenant.slug)
    if (typeof window !== 'undefined') {
      localStorage.setItem(TENANT_STORAGE_KEY, tenant.slug)
    }
  }, [])

  const refetchTenants = useCallback(() => {
    refetch()
  }, [refetch])

  const value = useMemo(
    () => ({
      currentTenant,
      tenants,
      isLoading: isLoading || !isInitialized,
      setCurrentTenant,
      refetchTenants,
    }),
    [currentTenant, tenants, isLoading, isInitialized, setCurrentTenant, refetchTenants]
  )

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}
