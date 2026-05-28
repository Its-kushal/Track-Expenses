import { createClient } from "@/lib/supabase/server";
import { fetchExpenses } from "@/features/expenses/fetchExpenses";
import ExpenseCard from "@/components/ui/ExpenseCard";
import Navbar from "@/components/layout/Navbar";
import FloatingExpenseButton from "@/components/ui/FloatingExpenseButton";
import { redirect } from "next/navigation";

// type Expense = {
//     id: string;
//     title: string;
//     amount: number;
//     expense_date: string;
//     type: string;
//     categories: {
//         name: string;
//         type: string;
//     };
//     payment_modes: {
//         name: string;
//     };
// };

export default async function ExpensesPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth");

    // We now pass the server client into our refactored utility
    const expenses = await fetchExpenses(supabase);

    return (
        <main className="p-6">
            <Navbar />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">All Expenses</h1>
            </div>

            {expenses.length === 0 ? (
                <div className="text-[var(--color-muted)]">
                    No expenses found.
                </div>
            ) : (
                <div className="space-y-4">
                    {expenses.map((expense) => (
                        <ExpenseCard
                            key={expense.id}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            expense={expense as any}
                        />
                    ))}
                </div>
            )}

            <FloatingExpenseButton />
        </main>
    );
}
