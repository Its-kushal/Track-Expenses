"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type UpdateExpenseData = {
    title: string;
    amount: number;
    category_id: string;
    payment_mode_id: string;
    type: string;
    notes?: string;
    expense_date: string;
};

export async function updateExpense(id: string, data: UpdateExpenseData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from("expenses")
        .update({
            title: data.title,
            amount: data.amount,
            category_id: data.category_id,
            payment_mode_id: data.payment_mode_id,
            type: data.type,
            notes: data.notes || null,
            expense_date: data.expense_date,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("created_by", user.id); // Security: Ensure they own it

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/expenses");
    return { success: true };
}
