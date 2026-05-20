"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ExpenseFormData,
    validateExpense,
} from "@/features/expenses/expense.schema";
import { fetchExpenseMeta } from "@/features/expenses/fetchExpenseMeta";
import { createExpense } from "@/features/expenses/createExpense";

type Category = {
    id: string;
    name: string;
    type: string;
};
type PaymentMode = {
    id: string;
    name: string;
};

export default function ExpenseForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
    const [formData, setFormData] = useState<ExpenseFormData>({
        title: "",
        amount: 0,
        category_id: "",
        payment_mode_id: "",
        description: "",
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
        if (validationError) {
            alert(validationError);
            return;
        }
        try {
            setLoading(true);
            await createExpense(formData);
            alert("Expense created");
            router.push("/dashboard");
        } catch (error) {
            console.error(error);
            alert("Failed to create expense");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{ padding: 24 }}>
            <h1>Create Expense</h1>
            <br />
            <input
                placeholder="Title"
                value={formData.title}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        title: e.target.value,
                    })
                }
            />
            <br />
            <br />
            <input
                type="number"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        amount: Number(e.target.value),
                    })
                }
            />
            <br />
            <br />
            <select
                value={formData.category_id}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        category_id: e.target.value,
                    })
                }
            >
                <option value="">Select Category</option>

                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.name} ({category.type})
                    </option>
                ))}
            </select>
            <br />
            <br />
            <select
                value={formData.payment_mode_id}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        payment_mode_id: e.target.value,
                    })
                }
            >
                <option value="">Select Payment Mode</option>
                {paymentModes.map((mode) => (
                    <option key={mode.id} value={mode.id}>
                        {mode.name}
                    </option>
                ))}
            </select>
            <br />
            <br />
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
            <br />
            <br />
            <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        description: e.target.value,
                    })
                }
            />
            <br />
            <br />
            <textarea
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        notes: e.target.value,
                    })
                }
            />
            <br />
            <br />
            <button onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : "Save Expense"}
            </button>
        </main>
    );
}
