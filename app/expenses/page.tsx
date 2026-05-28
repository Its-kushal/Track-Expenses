import { createClient } from "@/lib/supabase/server";
import { fetchExpenses } from "@/features/expenses/fetchExpenses";
import { fetchExpenseMeta } from "@/features/expenses/fetchExpenseMeta";
import ExpenseCard from "@/components/ui/ExpenseCard";
import Navbar from "@/components/layout/Navbar";
import FloatingExpenseButton from "@/components/ui/FloatingExpenseButton";
import { redirect } from "next/navigation";

export default async function ExpensesPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth");

    const [expenses, meta] = await Promise.all([
        fetchExpenses(supabase),
        fetchExpenseMeta(supabase),
    ]);

    const { categories, paymentModes } = meta;

    return (
        <main className="min-h-screen bg-[var(--color-background)] pb-24 md:pb-0">
            <Navbar />
            <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
                <header className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">
                        All Expenses
                    </h1>
                </header>

                <section>
                    {expenses.length === 0 ? (
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center text-[var(--color-muted)]">
                            No expenses found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start">
                            {expenses.map((expense) => (
                                <ExpenseCard
                                    key={expense.id}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    expense={expense as any}
                                    categories={categories}
                                    paymentModes={paymentModes}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <FloatingExpenseButton />
        </main>
    );
}
