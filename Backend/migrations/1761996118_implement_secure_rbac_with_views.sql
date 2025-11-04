-- Migration: implement_secure_rbac_with_views
-- Created at: 1761996118

-- Create a materialized view to cache user roles without RLS
-- This breaks the recursion cycle
CREATE MATERIALIZED VIEW user_roles_cache AS
SELECT user_id, role, hospital_id
FROM user_profiles;

-- Grant access to the cache
GRANT SELECT ON user_roles_cache TO authenticated, anon;

-- Create index for performance
CREATE UNIQUE INDEX idx_user_roles_cache_user_id ON user_roles_cache(user_id);
CREATE INDEX idx_user_roles_cache_role ON user_roles_cache(role);
CREATE INDEX idx_user_roles_cache_hospital ON user_roles_cache(hospital_id);

-- Function to refresh the cache (called after user_profile changes)
CREATE OR REPLACE FUNCTION refresh_user_roles_cache()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_roles_cache;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-refresh cache
CREATE TRIGGER user_profiles_changed
AFTER INSERT OR UPDATE OR DELETE ON user_profiles
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_user_roles_cache();

-- Now recreate the RBAC policies using the cache (no recursion)
CREATE POLICY "Hospital admins view staff" ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles_cache urc
      WHERE urc.user_id = auth.uid()
      AND urc.role = 'hospital_admin'
      AND urc.hospital_id = user_profiles.hospital_id
    )
    OR auth.uid() = user_id
  );

CREATE POLICY "Health ministry view all" ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles_cache urc
      WHERE urc.user_id = auth.uid()
      AND urc.role = 'health_ministry'
    )
    OR auth.uid() = user_id
  );
;