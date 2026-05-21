import { supabase } from "@/lib/supabase/client";

export async function deleteExpense(id: string) {
    const {data: { user },} = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: expense, error: fetchError } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError || !expense) {throw new Error("Expense not found");}
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) throw error;
    await supabase.from("activities").insert({
        user_id: user.id,
        expense_id: id,
        action: "deleted",
        old_data: expense,
    });
    return true;
}
