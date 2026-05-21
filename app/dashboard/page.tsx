"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import FloatingExpenseButton from "@/components/ui/FloatingExpenseButton";
import ExpenseCard from "@/components/ui/ExpenseCard";
import { fetchExpenses } from "@/features/expenses/fetchExpenses";

type Expense = {
    id: string;
    title: string;
    amount: number;
    expense_date: string;
    description?: string;
    notes?: string;
    categories?: {
        name: string;
        type: string;
    };
    payment_modes?: {
        name: string;
    };
};

export default function DashboardPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadExpenses() {
            try {
                const data = await fetchExpenses(7);
                setExpenses(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        loadExpenses();
    }, []);
    return (
        <main className="min-h-screen bg-[var(--color-background)]">
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
                    <button
                        className="hidden md:block bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                        onClick={() => (window.location.href = "/expenses/new")}
                    >
                        + Add Expense
                    </button>
                </header>

                <section>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="animate-pulse h-32 bg-[var(--color-surface)] rounded-2xl"
                                ></div>
                            ))}
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center text-[var(--color-muted)]">
                            No recent expenses found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start">
                            {expenses.map((expense) => (
                                <ExpenseCard
                                    key={expense.id}
                                    expense={expense}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
            <div className="md:hidden">
                <FloatingExpenseButton />
            </div>
        </main>
    );
}