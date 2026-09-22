-- Public catalog policies call this helper. Anonymous calls return false;
-- no private rows or administrative permissions are granted.
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO anon;
