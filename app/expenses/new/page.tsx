import ExpenseForm from "@/components/forms/ExpenseForm";
import { createClient } from "@/lib/supabase/server";
import { fetchExpenseMeta } from "@/features/expenses/fetchExpenseMeta";
import { redirect } from "next/navigation";

export default async function NewExpensePage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth");
    const { categories, paymentModes } = await fetchExpenseMeta(supabase);
    return <ExpenseForm categories={categories} paymentModes={paymentModes} />;
}
