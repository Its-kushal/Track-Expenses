import { supabase } from "@/lib/supabase/client";

type UpdateExpenseData = {
    title: string;
    amount: number;
    category_id: string;
    payment_mode_id: string;
    description?: string;
    notes?: string;
    expense_date: string;
};

export async function updateExpense(id: string, data: UpdateExpenseData) {
    const {data: { user },} = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: oldExpense, error: fetchError } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError || !oldExpense) {
        throw new Error("Expense not found");
    }

    const { error } = await supabase
        .from("expenses")
        .update({
            title: data.title,
            amount: data.amount,
            category_id: data.category_id,
            payment_mode_id: data.payment_mode_id,
            description: data.description || null,
            notes: data.notes || null,
            expense_date: data.expense_date,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) throw error;
    await supabase.from("activities").insert({
        user_id: user.id,
        expense_id: id,
        action: "updated",
        old_data: oldExpense,
        new_data: data,
    });
    return true;
}
