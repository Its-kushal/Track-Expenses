"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addMemberToGroup(
    groupId: string,
    email: string,
    tempName?: string,
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // 1. Check if the user is registered using the Secure RPC bypass
    const { data: rawData } = await supabase
        .rpc("get_profile_by_email", { lookup_email: email })
        .maybeSingle();

    // Explicitly cast the response type because types/database.ts is outdated
    const registeredUser = rawData as { id: string; full_name: string } | null;

    if (registeredUser) {
        // User exists! Add them to the group immediately.
        const { error } = await supabase.from("group_members").insert({
            group_id: groupId,
            user_id: registeredUser.id,
        });

        if (error)
            return {
                error: "User is already in this group or an error occurred.",
            };

        revalidatePath(`/groups/${groupId}`);
        return {
            success: true,
            message: `Added ${registeredUser.full_name} to the group.`,
        };
    }

    // 2. User is NOT registered. Do we have a temporary name to create a Shadow Profile?
    if (!tempName) {
        return {
            requiresName: true,
            message:
                "No registered user found with this email. Please provide a temporary name for them.",
        };
    }

    // 3. Create the Shadow Profile
    let shadowId;
    const { data: existingShadow } = await supabase
        .from("shadow_profiles")
        .select("id")
        .eq("email", email.toLowerCase())
        .maybeSingle();

    if (existingShadow) {
        shadowId = existingShadow.id;
    } else {
        const { data: newShadow, error: shadowError } = await supabase
            .from("shadow_profiles")
            .insert({
                email: email.toLowerCase(),
                temp_name: tempName,
                created_by: user.id,
            })
            .select("id")
            .single();

        if (shadowError)
            return { error: "Failed to create temporary profile." };
        shadowId = newShadow.id;
    }

    // 4. Add the Shadow Profile to the Group
    const { error: memberError } = await supabase.from("group_members").insert({
        group_id: groupId,
        shadow_id: shadowId,
    });

    if (memberError) return { error: "Failed to add user to group." };

    revalidatePath(`/groups/${groupId}`);
    return {
        success: true,
        message: `Added ${tempName} as a temporary member.`,
    };
}
