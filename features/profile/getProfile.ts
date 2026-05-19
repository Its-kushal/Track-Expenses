import { supabase } from "@/lib/supabase/client";

export async function getProfile() {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return null;
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error("PROFILE FETCH ERROR:", error);
        return null;
    }

    return data;
}
