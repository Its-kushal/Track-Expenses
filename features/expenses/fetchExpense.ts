import { supabase } from "@/lib/supabase/client";

export async function fetchExpense(limit?: number) {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("User not authenticated");
    }
    const { data, error } = await supabase.from("expenses").select(
    `
      *,
      categories (id, name, type),
      payment_modes (id, name)
    `,
        ).eq("created_by", user.id).order("expense_date", {ascending: false,}).limit(limit || 100);
    if (error) {
        console.error(error);
        throw error;
    }
    return data || [];
}
