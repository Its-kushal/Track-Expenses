"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGroup(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!name || name.trim() === "") {
        return { error: "Group name is required." };
    }

    // 1. Create the Group Entity
    const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
            name: name.trim(),
            description: description ? description.trim() : null,
            created_by: user.id,
        })
        .select("id")
        .single();

    if (groupError) return { error: groupError.message };

    // 2. Automatically make the creator an admin member
    const { error: memberError } = await supabase.from("group_members").insert({
        group_id: group.id,
        user_id: user.id,
        role: "admin",
    });

    if (memberError) {
        // Rollback: If we can't add them as a member, destroy the group to prevent orphans
        await supabase.from("groups").delete().eq("id", group.id);
        return {
            error: "Failed to initialize group membership. Please try again.",
        };
    }

    // 3. Purge the cache so the /groups page updates instantly
    revalidatePath("/groups");

    // We return the ID so the frontend knows exactly where to redirect the user
    return { success: true, groupId: group.id };
}
