"use client";

import { useEffect, useState } from "react";
import { fetchExpense } from "@/features/expenses/fetchExpense";
import FloatingExpenseButton from "@/components/ui/FloatingExpenseButton";
import ExpenseCard from "@/components/ui/ExpenseCard";

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
                const data = await fetchExpense();
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
                    {expenses.map((expense) => (<ExpenseCard key={expense.id} expense={expense}/>))}
                </div>
            )}
        <FloatingExpenseButton />
        </main>
    );
}
