"use server";
import { createClient } from "@/lib/supabase/server";
import { ExpenseFormData } from "./expense.schema";
import { revalidatePath } from "next/cache";

export async function createExpense(expenseData: ExpenseFormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return { error: "User not authenticated. Please log in." };
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
        console.error("Create Expense Error:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/expenses");

    return { success: true };
}
