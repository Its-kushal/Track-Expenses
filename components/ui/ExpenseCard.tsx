"use client";
import { useState } from "react";

type ExpenseCardProps = {
    expense: {
        id: string;
        title: string;
        amount: number;
        expense_date: string;
        description?: string;
        notes?: string;
        categories?: {name: string;type: string;};
        payment_modes?: {name: string;};
    };
};

export default function ExpenseCard({ expense }: ExpenseCardProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
            }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                <div>
                    <h3 style={{margin: 0,}}>{expense.title}</h3>
                    <p style={{margin: "4px 0",color: "#666",}}>
                        {expense.categories?.name} • {expense.categories?.type}
                    </p>
                </div>
                <div style={{textAlign: "right",}}>
                    <strong>₹{expense.amount}</strong>
                    <p style={{margin: "4px 0", color: "#666", fontSize: 14,}}>
                        {new Date(expense.expense_date).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <button
                onClick={() => setExpanded(!expanded)}
                style={{marginTop: 12,}}>
                {expanded ? "Hide Details" : "View Details"}
            </button>
            {expanded && (
                <div
                    style={{
                        marginTop: 16,
                        borderTop: "1px solid #eee",
                        paddingTop: 12,
                    }}>
                    <p>
                        <strong>Payment:</strong> {expense.payment_modes?.name}
                    </p>
                    {expense.description && (
                        <p>
                            <strong>Description:</strong> {expense.description}
                        </p>
                    )}
                    {expense.notes && (
                        <p>
                            <strong>Notes:</strong> {expense.notes}
                        </p>
                    )}
                    <div style={{display: "flex", gap: 12, marginTop: 16,}}>
                        <button>Edit</button>
                        <button>Delete</button>
                    </div>
                </div>)}
        </div>
    );
}
