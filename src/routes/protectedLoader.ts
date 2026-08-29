import { redirect } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";

// Client-side auth guard for /app, replacing TanStack Start's
// `beforeLoad` redirect on the old `_authenticated` layout route.
export async function protectedLoader() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    throw redirect("/sign-in");
  }
  return null;
}
