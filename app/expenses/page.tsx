"use client";

import { useEffect, useState } from "react";
import { fetchExpenses } from "@/features/expenses/fetchExpenses";
import FloatingExpenseButton from "@/components/ui/FloatingExpenseButton";
import ExpenseCard from "@/components/ui/ExpenseCard";
import Navbar from "@/components/layout/Navbar";

type Expense = {
    id: string;
    title: string;
    amount: number;
    expense_date: string;
    categories: {
        name: string;
        type: string;
    };
    payment_modes: {
        name: string;
    };
};

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadExpenses() {
            try {
                const data = await fetchExpenses();
                setExpenses(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        loadExpenses();
    }, []);
    if (loading) {
        return <div>Loading expenses...</div>;
    }
    return (
        <main style={{ padding: 24 }}>
            <Navbar />
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                <h1>Expenses</h1>
            </div>
            <br />
            {expenses.length === 0 ? (
                <div>No expenses found.</div>
            ) : (
                <div>
                    {expenses.map((expense) => (
                        <ExpenseCard key={expense.id} expense={expense} />
                    ))}
                </div>
            )}
            <FloatingExpenseButton />
        </main>
    );
}
