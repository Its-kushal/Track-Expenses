"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { validateProfile } from "./profile.schema";

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return { error: "User not authenticated. Please log in again." };
    }

    const profileData = {
        full_name: formData.get("full_name") as string,
        username: formData.get("username") as string,
        currency: formData.get("currency") as string,
        timezone: formData.get("timezone") as string,
        phone: (formData.get("phone") as string) || "",
    };

    const validationError = validateProfile(profileData);
    if (validationError) {
        return { error: validationError };
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
        return { error: error.message };
    }

    redirect("/dashboard");
}
