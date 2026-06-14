import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export class AuthenticationError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export function isAuthenticationError(error: unknown) {
  return error instanceof AuthenticationError;
}

export async function getCurrentUserId() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        }
      }
    });

    const { data } = await supabase.auth.getUser();
    if (data.user?.id) return data.user.id;

    throw new AuthenticationError();
  }

  if (process.env.NODE_ENV !== "production") {
    return process.env.DEV_USER_ID || "dev-user";
  }

  throw new AuthenticationError();
}
