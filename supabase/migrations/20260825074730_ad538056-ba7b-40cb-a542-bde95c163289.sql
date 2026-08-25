REVOKE EXECUTE ON FUNCTION public.record_field_usage(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_field_usage(text, text) TO service_role;