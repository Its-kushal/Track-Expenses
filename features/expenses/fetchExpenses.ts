import { SupabaseClient } from "@supabase/supabase-js";

// We inject the SupabaseClient so this function is environment-agnostic.
export async function fetchExpenses(supabase: SupabaseClient, limit?: number) {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
        .from("expenses")
        .select(
            `
            *,
            categories (id, name),
            payment_modes (id, name)
        `,
        )
        .eq("created_by", user.id)
        .order("expense_date", { ascending: false })
        .limit(limit || 100);

    if (error) {
        console.error("FETCH EXPENSES ERROR:", error);
        throw error;
    }

    return data || [];
}
