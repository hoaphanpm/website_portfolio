import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`
// (exported function `proxy` instead of `middleware`); the request/response
// API and `config.matcher` shape are unchanged. See:
// https://nextjs.org/docs/app/api-reference/file-conventions/proxy
export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
