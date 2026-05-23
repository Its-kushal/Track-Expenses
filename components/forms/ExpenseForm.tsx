"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ExpenseFormData,
    validateExpense,
} from "@/features/expenses/expense.schema";
import { fetchExpenseMeta } from "@/features/expenses/fetchExpenseMeta";
import { createExpense } from "@/features/expenses/createExpense";

type Category = { id: string; name: string; type: string };
type PaymentMode = { id: string; name: string };

type ExpenseFormProps = {
    onClose?: () => void;
};

export default function ExpenseForm({ onClose }: ExpenseFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
    const [formData, setFormData] = useState<ExpenseFormData>({
        title: "",
        amount: 0,
        category_id: "",
        payment_mode_id: "",
        type: "need",
        notes: "",
        expense_date: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        async function loadMeta() {
            const data = await fetchExpenseMeta();
            setCategories(data.categories);
            setPaymentModes(data.paymentModes);
        }
        loadMeta();
    }, []);

    async function handleSubmit() {
        const validationError = validateExpense(formData);
        const localDate = new Date();
        const [year, month, day] = formData.expense_date.split("-");
        localDate.setFullYear(Number(year), Number(month) - 1, Number(day));
        if (validationError) {
            alert(validationError);
            return;
        }
        try {
            setLoading(true);
            await createExpense(formData);
            if (onClose) {
                onClose();
                window.location.reload();
            } else {
                router.push("/dashboard");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to create expense");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm md:p-6">
            <div className="bg-[var(--color-surface)] w-full md:w-full md:max-w-md h-[90vh] md:h-auto rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
                <header className="flex justify-between items-center p-6 border-b border-[var(--color-border)] shrink-0">
                    <h2 className="text-xl font-bold">Add Expense</h2>
                    <button
                        onClick={() => (onClose ? onClose() : router.back())}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label="Close">
                        ✕
                    </button>
                </header>
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                    <input
                        placeholder="Expense Title"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                    />
                    <div className="flex gap-4">
                        <input
                            type="number"
                            placeholder="Amount"
                            value={formData.amount || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    amount: Number(e.target.value),
                                })
                            }
                        />
                        <input
                            type="date"
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
                            value={formData.category_id}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    category_id: e.target.value,
                                })
                            }>
                            <option value="" disabled>
                                Category
                            </option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={formData.payment_mode_id}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    payment_mode_id: e.target.value,
                                })
                            }>
                            <option value="" disabled>
                                Payment Mode
                            </option>
                            {paymentModes.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={formData.type}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    type: e.target.value,
                                })
                            }
                            className="w-full p-3 rounded-xl bg-[#09090b] border border-[var(--color-border)] text-white">
                            <option value="need">Need</option>
                            <option value="want">Want</option>
                            <option value="saving">Saving</option>
                        </select>
                    </div>
                    <textarea
                        placeholder="Additional Notes"
                        value={formData.notes}
                        onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                        }
                        rows={2}
                    />
                </div>
                <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors">
                        {loading ? "Saving..." : "Save Expense"}
                    </button>
                </div>
            </div>
        </div>
    );
}
