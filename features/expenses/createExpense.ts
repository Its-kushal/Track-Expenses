import { supabase } from "@/lib/supabase/client";
import { ExpenseFormData } from "./expense.schema";

export async function createExpense(expenseData: ExpenseFormData) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated");
    }

    const { error } = await supabase.from("expenses").insert({
        created_by: user.id,
        paid_by: user.id,
        scope: "personal",
        title: expenseData.title,
        amount: expenseData.amount,
        category_id: expenseData.category_id,
        payment_mode_id: expenseData.payment_mode_id,
        type: expenseData.type,
        notes: expenseData.notes || null,
        expense_date: expenseData.expense_date,
        is_split: false,
    });

    if (error) {
        console.error(error);
        throw error;
    }

    return true;
}
