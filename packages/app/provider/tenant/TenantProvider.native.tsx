import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useSessionContext } from '../../utils/supabase/useSessionContext'
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

    // Try to restore from AsyncStorage
    AsyncStorage.getItem(TENANT_STORAGE_KEY).then((storedSlug) => {
      const storedTenant = storedSlug ? tenants.find((t) => t.slug === storedSlug) : null
      const tenantToSet = storedTenant ?? tenants[0]

      // Clear stale slug if stored tenant no longer exists
      if (storedSlug && !storedTenant) {
        AsyncStorage.removeItem(TENANT_STORAGE_KEY)
      }

      if (tenantToSet) {
        setCurrentTenantState(tenantToSet)
        setCurrentTenantSlug(tenantToSet.slug)
        // Persist the fallback selection
        if (!storedTenant) {
          AsyncStorage.setItem(TENANT_STORAGE_KEY, tenantToSet.slug)
        }
      }

      setIsInitialized(true)
    })
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
    AsyncStorage.setItem(TENANT_STORAGE_KEY, tenant.slug)
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
