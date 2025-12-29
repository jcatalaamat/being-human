-- Migration: Auto-join new users to the default tenant
-- This ensures new users are automatically added to the "inner-ascend" tenant

-- ============================================================================
-- 1. Update handle_new_user() to also add user to default tenant
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_default_tenant_id UUID;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id)
  VALUES (new.id);

  -- Find the default tenant (inner-ascend or first available)
  SELECT id INTO v_default_tenant_id
  FROM public.tenants
  WHERE slug = 'inner-ascend'
  LIMIT 1;

  -- If no inner-ascend tenant, get first available tenant
  IF v_default_tenant_id IS NULL THEN
    SELECT id INTO v_default_tenant_id
    FROM public.tenants
    WHERE is_active = true
    LIMIT 1;
  END IF;

  -- Add user to default tenant as member if a tenant exists
  IF v_default_tenant_id IS NOT NULL THEN
    INSERT INTO public.tenant_memberships (tenant_id, user_id, role, accepted_at)
    VALUES (v_default_tenant_id, new.id, 'member', NOW())
    ON CONFLICT (tenant_id, user_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

-- Note: The trigger already exists from the original migration,
-- so we just need to replace the function. The trigger will use the updated function.
