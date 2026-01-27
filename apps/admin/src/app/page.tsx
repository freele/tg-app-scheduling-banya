import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@bania/supabase/server";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = await createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  redirect("/dashboard");
}
