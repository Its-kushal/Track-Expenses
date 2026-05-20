"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import FloatingExpenseButton from "@/components/ui/FloatingExpenseButton";
import ExpenseCard from "@/components/ui/ExpenseCard";
import { fetchExpense } from "@/features/expenses/fetchExpense";

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
    useEffect(() => {
        async function loadExpenses() {
            try {
                const data = await fetchExpense(7);
                setExpenses(data);
            } catch (error) {
                console.error(error);
            }
        }
        loadExpenses();
    }, []);
    return (
        <main>
            <Navbar />
            <div style={{ padding: 24 }}>
                <h1>Dashboard</h1>
                <h2>Recent Expenses</h2>
                <br/>
                {expenses.length === 0 ? (
                    <p>No recent expenses</p>
                ) : (
                    expenses.map((expense) => (
                        <ExpenseCard key={expense.id} expense={expense} />
                    )))}
            </div>
            <FloatingExpenseButton />
        </main>
    );
}
