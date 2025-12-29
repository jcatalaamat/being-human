import { createContext, useContext } from 'react'

export type TenantRole = 'owner' | 'admin' | 'instructor' | 'member'

export interface Tenant {
  id: string
  name: string
  slug: string
  logoUrl?: string | null
  role: TenantRole
}

export interface TenantContextType {
  currentTenant: Tenant | null
  tenants: Tenant[]
  isLoading: boolean
  setCurrentTenant: (tenant: Tenant) => void
  refetchTenants: () => void
}

export const TenantContext = createContext<TenantContextType | null>(null)

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

export function useTenantSlug(): string | null {
  const context = useContext(TenantContext)
  return context?.currentTenant?.slug ?? null
}

// Store for accessing tenant slug outside of React context (e.g., in tRPC headers)
let currentTenantSlug: string | null = null

export function setCurrentTenantSlug(slug: string | null) {
  currentTenantSlug = slug
}

export function getCurrentTenantSlug(): string | null {
  return currentTenantSlug
}
