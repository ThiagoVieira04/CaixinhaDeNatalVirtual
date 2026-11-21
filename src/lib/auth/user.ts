import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ProfileRow } from "@/lib/supabase/database.types";

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/entrar");
  }

  return user;
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    let { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!data) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && user.id === userId) {
        const { data: newProfile } = await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              full_name: (user.user_metadata?.full_name as string) || "",
              business_name: (user.user_metadata?.business_name as string) || "",
            },
            { onConflict: "id" },
          )
          .select("*")
          .maybeSingle();

        data = newProfile;
      }
    }

    return data;
  } catch {
    return null;
  }
}

export function profileDisplayName(
  profile: ProfileRow | null,
  user: User,
): string {
  const businessName = profile?.business_name?.trim();
  if (businessName) return businessName;

  const fullName = profile?.full_name?.trim();
  if (fullName) return fullName;

  return user.email?.split("@")[0] ?? "Comerciante";
}
