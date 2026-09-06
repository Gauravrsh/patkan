import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getMyAdminAccess } from "@/lib/admin.functions";

/** True only for signed-in accounts holding the admin role (verified server-side). */
export function useIsAdmin(enabled: boolean) {
  const checkAccess = useServerFn(getMyAdminAccess);
  const { data } = useQuery({
    queryKey: ["my-admin-access"],
    queryFn: () => checkAccess(),
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  return Boolean(data?.isAdmin);
}
