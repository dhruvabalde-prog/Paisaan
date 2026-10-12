import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Persistent client with localStorage session storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

export async function signInWithGoogle() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  ) {
    // Persistent Local Fallback: saves into localStorage so it never disconnects unless disconnect button is clicked
    const user = {
      id: "demo-user-1",
      email: "vibecoder@gmail.com",
      user_metadata: {
        full_name: "Vibe Coder",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      },
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("paisaan_user_google", JSON.stringify({
        name: user.user_metadata.full_name,
        email: user.email,
        avatar: user.user_metadata.avatar_url,
      }));
    }
    return { user, error: null };
  }

  // Always use the live online Vercel domain to eliminate any localhost redirects
  const siteUrl = typeof window !== "undefined" && window.location.origin.includes("vercel.app")
    ? window.location.origin
    : "https://paisaan-chi.vercel.app";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      scopes: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  return { data, error };
}

export async function signOutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("paisaan_user_google");
  }
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  ) {
    await supabase.auth.signOut();
  }
}
