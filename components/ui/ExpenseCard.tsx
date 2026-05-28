"use client";
import { useState, useTransition } from "react";
import { deleteExpense } from "@/features/expenses/deleteExpense";
import { updateExpense } from "@/features/expenses/updateExpense";

type Category = { id: string; name: string };
type PaymentMode = { id: string; name: string };

type ExpenseCardProps = {
    expense: {
        id: string;
        title: string;
        amount: number;
        expense_date: string;
        type: string;
        notes?: string;
        category_id?: string;
        payment_mode_id?: string;
        categories?: { name: string; type?: string };
        payment_modes?: { name: string };
    };
    categories: Category[];
    paymentModes: PaymentMode[];
};

export default function ExpenseCard({
    expense,
    categories,
    paymentModes,
}: ExpenseCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState({
        title: expense.title,
        amount: expense.amount,
        category_id: expense.category_id || "",
        payment_mode_id: expense.payment_mode_id || "",
        type: expense.type,
        notes: expense.notes || "",
        // Safely extract YYYY-MM-DD for the date input
        expense_date: new Date(expense.expense_date)
            .toISOString()
            .split("T")[0],
    });

    function handleUpdate() {
        startTransition(async () => {
            const result = await updateExpense(expense.id, formData);
            if (result?.error) {
                alert(result.error);
            } else {
                setEditing(false);
            }
        });
    }

    function handleDelete() {
        const confirmed = confirm("Delete expense?");
        if (!confirmed) return;

        startTransition(async () => {
            const result = await deleteExpense(expense.id);
            if (result?.error) {
                alert(result.error);
            }
        });
    }

    return (
        <div
            className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm transition-all overflow-hidden ${isPending ? "opacity-50 pointer-events-none" : ""}`}
        >
            {!editing ? (
                <div className="flex flex-col gap-4">
                    <div
                        className="flex justify-between items-start cursor-pointer"
                        onClick={() => setExpanded(!expanded)}
                    >
                        <div className="flex-1 pr-4">
                            <h3 className="text-lg font-semibold text-white truncate">
                                {expense.title}
                            </h3>
                            <p className="text-sm text-[var(--color-muted)] mt-1">
                                {expense.categories?.name} • {expense.type}
                            </p>
                        </div>

                        <div className="text-right shrink-0">
                            <span className="text-xl font-bold text-white tracking-tight">
                                ₹{expense.amount.toLocaleString()}
                            </span>
                            <p className="text-xs text-[var(--color-muted)] mt-1">
                                {new Date(
                                    expense.expense_date,
                                ).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                    {expanded && (
                        <div className="pt-4 border-t border-[var(--color-border)] space-y-3 text-sm text-[var(--color-muted)]">
                            <div className="flex justify-between">
                                <span>Payment Mode</span>
                                <span className="text-white font-medium">
                                    {expense.payment_modes?.name}
                                </span>
                            </div>

                            <div className="flex gap-3 mt-4 pt-2">
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex-1 bg-white/10 text-white py-2.5 rounded-xl font-medium hover:bg-white/20"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 bg-red-500/10 text-red-500 py-2.5 rounded-xl font-medium hover:bg-red-500/20"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <input
                        className="w-full p-3 rounded-xl bg-white border border-[var(--color-border)] text-black"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Expense Title"
                    />
                    <div className="flex gap-4">
                        <input
                            type="number"
                            className="w-full p-3 rounded-xl bg-white border border-[var(--color-border)] text-black"
                            value={formData.amount}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    amount: Number(e.target.value),
                                })
                            }
                            placeholder="Amount"
                        />
                        <input
                            type="date"
                            className="w-full p-3 rounded-xl bg-white border border-[var(--color-border)] text-black"
                            value={formData.expense_date}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    expense_date: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="flex gap-4">
                        <select
                            className="w-full p-3 rounded-xl bg-white border border-[var(--color-border)] text-black"
                            value={formData.category_id}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    category_id: e.target.value,
                                })
                            }
                        >
                            <option value="">Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <select
                            className="w-full p-3 rounded-xl bg-white border border-[var(--color-border)] text-black"
                            value={formData.payment_mode_id}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    payment_mode_id: e.target.value,
                                })
                            }
                        >
                            <option value="">Payment Mode</option>
                            {paymentModes.map((mode) => (
                                <option key={mode.id} value={mode.id}>
                                    {mode.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setEditing(false)}
                            className="px-4 py-2 text-sm text-[var(--color-muted)] font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdate}
                            disabled={isPending}
                            className="px-6 py-2 bg-black text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                        >
                            {isPending ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
