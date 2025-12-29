-- Migration: Add multi-tenancy support
-- Members only see courses from their tenant (closed enrollment)

-- ============================================================================
-- 1. Create tenant role enum
-- ============================================================================
CREATE TYPE tenant_role AS ENUM ('owner', 'admin', 'instructor', 'member');

-- ============================================================================
-- 2. Create tenants table
-- ============================================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_is_active ON tenants(is_active);

COMMENT ON TABLE tenants IS 'Organizations/tenants that own courses';
COMMENT ON COLUMN tenants.slug IS 'URL-friendly identifier (e.g., "acme-training")';

-- ============================================================================
-- 3. Create tenant_memberships table
-- ============================================================================
CREATE TABLE tenant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role tenant_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_tenant_memberships_tenant_id ON tenant_memberships(tenant_id);
CREATE INDEX idx_tenant_memberships_user_id ON tenant_memberships(user_id);
CREATE INDEX idx_tenant_memberships_role ON tenant_memberships(role);

COMMENT ON TABLE tenant_memberships IS 'User membership in tenants with role';

-- ============================================================================
-- 4. Create tenant_invitations table
-- ============================================================================
CREATE TABLE tenant_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role tenant_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token UUID DEFAULT gen_random_uuid() UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(tenant_id, email)
);

CREATE INDEX idx_tenant_invitations_token ON tenant_invitations(token);
CREATE INDEX idx_tenant_invitations_email ON tenant_invitations(email);

COMMENT ON TABLE tenant_invitations IS 'Pending invitations to join a tenant';

-- ============================================================================
-- 5. Add tenant_id to courses (nullable first for migration)
-- ============================================================================
ALTER TABLE courses
  ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX idx_courses_tenant_id ON courses(tenant_id);

-- ============================================================================
-- 6. Helper functions for authorization
-- ============================================================================

-- Check if user is a member of a tenant
CREATE OR REPLACE FUNCTION is_tenant_member(p_user_id UUID, p_tenant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_memberships
    WHERE user_id = p_user_id AND tenant_id = p_tenant_id
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Get user's role in a tenant
CREATE OR REPLACE FUNCTION get_user_tenant_role(p_user_id UUID, p_tenant_id UUID)
RETURNS tenant_role AS $$
  SELECT role FROM tenant_memberships
  WHERE user_id = p_user_id AND tenant_id = p_tenant_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user has specific roles in a tenant
CREATE OR REPLACE FUNCTION user_has_tenant_role(
  p_user_id UUID,
  p_tenant_id UUID,
  p_roles tenant_role[]
) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_memberships
    WHERE user_id = p_user_id
      AND tenant_id = p_tenant_id
      AND role = ANY(p_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user can manage content (owner, admin, instructor)
CREATE OR REPLACE FUNCTION can_manage_tenant_content(p_user_id UUID, p_tenant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT user_has_tenant_role(p_user_id, p_tenant_id, ARRAY['owner', 'admin', 'instructor']::tenant_role[]);
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user can administer tenant (owner, admin)
CREATE OR REPLACE FUNCTION can_admin_tenant(p_user_id UUID, p_tenant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT user_has_tenant_role(p_user_id, p_tenant_id, ARRAY['owner', 'admin']::tenant_role[]);
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is tenant owner
CREATE OR REPLACE FUNCTION is_tenant_owner(p_user_id UUID, p_tenant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT user_has_tenant_role(p_user_id, p_tenant_id, ARRAY['owner']::tenant_role[]);
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- 7. Default tenant is now created via seed.sql (Inner Ascend)
-- ============================================================================
-- Tenant creation moved to supabase/seed.sql

-- ============================================================================
-- 8. Make tenant_id NOT NULL after migration
-- ============================================================================
ALTER TABLE courses
  ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================================================
-- 9. Enable RLS on new tables
-- ============================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 10. RLS Policies for tenants
-- ============================================================================

-- Users can only view tenants they belong to
CREATE POLICY "Users can view their tenants"
  ON tenants FOR SELECT
  USING (is_tenant_member(auth.uid(), id));

-- Only owners can update tenant settings
CREATE POLICY "Owners can update tenant"
  ON tenants FOR UPDATE
  USING (is_tenant_owner(auth.uid(), id));

-- ============================================================================
-- 11. RLS Policies for tenant_memberships
-- ============================================================================

-- Users can see their own memberships
CREATE POLICY "Users can view own memberships"
  ON tenant_memberships FOR SELECT
  USING (user_id = auth.uid());

-- Admins can see all memberships in their tenant
CREATE POLICY "Tenant admins can view all memberships"
  ON tenant_memberships FOR SELECT
  USING (can_admin_tenant(auth.uid(), tenant_id));

-- Admins can add members (except owners)
CREATE POLICY "Tenant admins can insert memberships"
  ON tenant_memberships FOR INSERT
  WITH CHECK (
    can_admin_tenant(auth.uid(), tenant_id)
    AND role != 'owner'
  );

-- Admins can update member roles (except owners)
CREATE POLICY "Tenant admins can update memberships"
  ON tenant_memberships FOR UPDATE
  USING (
    can_admin_tenant(auth.uid(), tenant_id)
    AND role != 'owner'
  )
  WITH CHECK (role != 'owner');

-- Admins can remove members (except owners)
CREATE POLICY "Tenant admins can delete memberships"
  ON tenant_memberships FOR DELETE
  USING (
    can_admin_tenant(auth.uid(), tenant_id)
    AND role != 'owner'
  );

-- ============================================================================
-- 12. RLS Policies for tenant_invitations
-- ============================================================================

-- Users can view invitations for their email
CREATE POLICY "Users can view invitations for their email"
  ON tenant_invitations FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR can_admin_tenant(auth.uid(), tenant_id)
  );

-- Admins can create invitations
CREATE POLICY "Tenant admins can create invitations"
  ON tenant_invitations FOR INSERT
  WITH CHECK (can_admin_tenant(auth.uid(), tenant_id));

-- Admins can delete invitations
CREATE POLICY "Tenant admins can delete invitations"
  ON tenant_invitations FOR DELETE
  USING (can_admin_tenant(auth.uid(), tenant_id));

-- ============================================================================
-- 13. Update courses RLS policies
-- ============================================================================
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;
DROP POLICY IF EXISTS "Instructors can manage their own courses" ON courses;

-- Tenant members can view published courses in their tenant
CREATE POLICY "Tenant members can view published courses"
  ON courses FOR SELECT
  USING (
    is_tenant_member(auth.uid(), tenant_id)
    AND (is_published = true OR can_manage_tenant_content(auth.uid(), tenant_id))
  );

-- Content managers can create courses
CREATE POLICY "Content managers can create courses"
  ON courses FOR INSERT
  WITH CHECK (can_manage_tenant_content(auth.uid(), tenant_id));

-- Content managers can update courses
CREATE POLICY "Content managers can update courses"
  ON courses FOR UPDATE
  USING (can_manage_tenant_content(auth.uid(), tenant_id));

-- Admins can delete courses
CREATE POLICY "Admins can delete courses"
  ON courses FOR DELETE
  USING (can_admin_tenant(auth.uid(), tenant_id));

-- ============================================================================
-- 14. Update modules RLS policies
-- ============================================================================
DROP POLICY IF EXISTS "Modules are viewable if course is accessible" ON modules;
DROP POLICY IF EXISTS "Instructors can manage modules for their courses" ON modules;

-- Modules viewable if user is tenant member and course is accessible
CREATE POLICY "Modules viewable by tenant members"
  ON modules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = modules.course_id
    AND is_tenant_member(auth.uid(), c.tenant_id)
    AND (c.is_published = true OR can_manage_tenant_content(auth.uid(), c.tenant_id))
  ));

-- Content managers can manage modules
CREATE POLICY "Content managers can manage modules"
  ON modules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = modules.course_id
    AND can_manage_tenant_content(auth.uid(), c.tenant_id)
  ));

-- ============================================================================
-- 15. Update lessons RLS policies
-- ============================================================================
DROP POLICY IF EXISTS "Lessons are viewable if module is accessible" ON lessons;
DROP POLICY IF EXISTS "Instructors can manage lessons for their courses" ON lessons;

-- Lessons viewable by tenant members
CREATE POLICY "Lessons viewable by tenant members"
  ON lessons FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = lessons.module_id
    AND is_tenant_member(auth.uid(), c.tenant_id)
    AND (c.is_published = true OR can_manage_tenant_content(auth.uid(), c.tenant_id))
  ));

-- Content managers can manage lessons
CREATE POLICY "Content managers can manage lessons"
  ON lessons FOR ALL
  USING (EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = lessons.module_id
    AND can_manage_tenant_content(auth.uid(), c.tenant_id)
  ));

-- ============================================================================
-- 16. Update user_module_unlocks RLS policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own module unlocks" ON user_module_unlocks;
DROP POLICY IF EXISTS "Admins can view all module unlocks" ON user_module_unlocks;
DROP POLICY IF EXISTS "Admins can insert module unlocks" ON user_module_unlocks;
DROP POLICY IF EXISTS "Admins can delete module unlocks" ON user_module_unlocks;

-- Users can view own module unlocks
CREATE POLICY "Users can view own module unlocks"
  ON user_module_unlocks FOR SELECT
  USING (auth.uid() = user_id);

-- Tenant admins can view all unlocks for their courses
CREATE POLICY "Tenant admins can view unlocks"
  ON user_module_unlocks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = user_module_unlocks.module_id
    AND can_admin_tenant(auth.uid(), c.tenant_id)
  ));

-- Tenant admins can insert unlocks
CREATE POLICY "Tenant admins can insert unlocks"
  ON user_module_unlocks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = module_id
    AND can_admin_tenant(auth.uid(), c.tenant_id)
  ));

-- Tenant admins can delete unlocks
CREATE POLICY "Tenant admins can delete unlocks"
  ON user_module_unlocks FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = user_module_unlocks.module_id
    AND can_admin_tenant(auth.uid(), c.tenant_id)
  ));

-- ============================================================================
-- 17. Add updated_at triggers for new tables
-- ============================================================================

-- Ensure the trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_memberships_updated_at
  BEFORE UPDATE ON tenant_memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
