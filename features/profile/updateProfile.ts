import { supabase } from "@/lib/supabase/client";

import { ProfileFormData } from "./profile.schema";

export async function updateProfile(profileData: ProfileFormData) {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("User not authenticated");
    }

    const { error } = await supabase
        .from("profiles")
        .update({
            full_name: profileData.full_name,
            username: profileData.username,
            currency: profileData.currency,
            timezone: profileData.timezone,
            phone: profileData.phone || null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (error) {
        console.error("PROFILE UPDATE ERROR:", error);
        throw error;
    }

    return true;
}
