import Navbar from "@/components/layout/Navbar";
import ExpenseCard from "@/components/ui/ExpenseCard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { fetchExpenseMeta } from "@/features/expenses/fetchExpenseMeta";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth");

    const [profileRes, meta, expensesResponse] = await Promise.all([
        supabase
            .from("profiles")
            .select("full_name, username")
            .eq("id", user.id)
            .single(),
        fetchExpenseMeta(supabase),
        supabase
            .from("expenses")
            .select(
                `
            id, title, amount, expense_date, type, notes, category_id, payment_mode_id,
            categories (id, name),
            payment_modes (id, name)
        `,
            )
            .eq("created_by", user.id)
            .order("expense_date", { ascending: false })
            .limit(7),
    ]);
    if (!profileRes.data?.full_name || !profileRes.data?.username) {
        redirect("/onboarding");
    }

    const expenses = expensesResponse.data;
    const { categories, paymentModes } = meta;

    return (
        <main className="min-h-screen bg-[var(--color-background)] pb-24 md:pb-0">
            <Navbar />
            <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
                <header className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-[var(--color-muted)] mt-1">
                            Your recent financial activity
                        </p>
                    </div>
                    <Link
                        href="/expenses/new"
                        className="hidden md:block bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                    >
                        + Add Expense
                    </Link>
                </header>
                <section>
                    {!expenses || expenses.length === 0 ? (
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center text-[var(--color-muted)]">
                            No recent expenses found.
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
        </main>
    );
}
