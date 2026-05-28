"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGroupExpense } from "@/features/groups/createGroupExpense";
import { Category, PaymentMode } from "@/types/modals"

type Member = { id: string; name: string; isShadow: boolean };

type GroupExpenseFormProps = {
    groupId: string;
    categories: Category[];
    paymentModes: PaymentMode[];
    members: Member[];
};

export default function GroupExpenseForm({
    groupId,
    categories,
    paymentModes,
    members,
}: GroupExpenseFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [title, setTitle] = useState("");
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [categoryId, setCategoryId] = useState("");
    const [paymentModeId, setPaymentModeId] = useState("");
    const [expenseDate, setExpenseDate] = useState(
        new Date().toISOString().split("T")[0],
    );
    const [notes, setNotes] = useState("");

    // State for Exact Amounts
    // Key is the member.id, Value is the exact numeric amount
    const [payers, setPayers] = useState<Record<string, number>>({});
    const [consumers, setConsumers] = useState<Record<string, number>>({});

    // Math Validation Engine
    const currentTotalPaid = Object.values(payers).reduce(
        (sum, val) => sum + (val || 0),
        0,
    );
    const currentTotalConsumed = Object.values(consumers).reduce(
        (sum, val) => sum + (val || 0),
        0,
    );

    // The form is only valid if both lists match the declared total EXACTLY.
    const isMathValid =
        totalAmount > 0 &&
        Math.abs(currentTotalPaid - totalAmount) < 0.01 &&
        Math.abs(currentTotalConsumed - totalAmount) < 0.01;

    function handlePayerChange(id: string, amount: number) {
        setPayers((prev) => ({ ...prev, [id]: amount }));
    }

    function handleConsumerChange(id: string, amount: number) {
        setConsumers((prev) => ({ ...prev, [id]: amount }));
    }

    // UX Helper: Instantly divide the total equally among everyone
    function splitEqually() {
        if (!totalAmount || members.length === 0) return;
        const equalShare = Number((totalAmount / members.length).toFixed(2));

        // Handle the orphan cent by giving it to the first member
        const remainder = Number(
            (totalAmount - equalShare * members.length).toFixed(2),
        );

        const newConsumers: Record<string, number> = {};
        members.forEach((m, index) => {
            newConsumers[m.id] =
                index === 0 ? equalShare + remainder : equalShare;
        });
        setConsumers(newConsumers);
    }

    function handleSubmit() {
        if (!title.trim() || !categoryId || !paymentModeId || !isMathValid) {
            alert(
                "Please fill all required fields and ensure the math balances perfectly.",
            );
            return;
        }

        startTransition(async () => {
            const result = await createGroupExpense({
                groupId,
                title,
                totalAmount,
                categoryId,
                paymentModeId,
                expenseDate,
                notes,
                payers,
                consumers,
            });

            if (result?.error) {
                alert(result.error);
                return;
            }

            router.push(`/groups/${groupId}`);
        });
    }

    return (
        <main className="min-h-[100dvh] bg-[var(--color-background)] flex flex-col pb-safe">
            <div className="flex-1 w-full max-w-xl mx-auto bg-[var(--color-surface)] sm:mt-10 sm:mb-10 sm:border sm:border-[var(--color-border)] sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col">
                <header className="flex justify-between items-center p-6 border-b border-[var(--color-border)] shrink-0 bg-black">
                    <h2 className="text-xl font-bold">Add Group Expense</h2>
                    <button
                        onClick={() => router.back()}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20"
                    >
                        ✕
                    </button>
                </header>

                <div className="p-6 overflow-y-auto space-y-8 flex-1">
                    {/* CORE EXPENSE DETAILS */}
                    <div className="space-y-4">
                        <input
                            placeholder="What was this for?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <input
                                type="number"
                                placeholder="Total Amount (₹)"
                                value={totalAmount || ""}
                                onChange={(e) =>
                                    setTotalAmount(Number(e.target.value))
                                }
                                className="font-bold text-lg text-white"
                            />
                            <input
                                type="date"
                                value={expenseDate}
                                onChange={(e) => setExpenseDate(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
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
                                value={paymentModeId}
                                onChange={(e) =>
                                    setPaymentModeId(e.target.value)
                                }
                            >
                                <option value="" disabled>
                                    Payment Mode
                                </option>
                                {paymentModes.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* WHO PAID SECTION */}
                    <div className="bg-white/5 border border-[var(--color-border)] p-4 rounded-2xl space-y-3">
                        <div className="flex justify-between items-end mb-2">
                            <h3 className="font-semibold text-white">
                                Who Paid?
                            </h3>
                            <span
                                className={`text-sm font-medium ${Math.abs(currentTotalPaid - totalAmount) < 0.01 ? "text-green-400" : "text-red-400"}`}
                            >
                                ₹{currentTotalPaid.toFixed(2)} / ₹
                                {totalAmount.toFixed(2)}
                            </span>
                        </div>
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="flex justify-between items-center gap-4"
                            >
                                <span className="text-sm text-[var(--color-muted)] truncate">
                                    {member.name} {member.isShadow && "(Guest)"}
                                </span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-32 text-right !bg-black"
                                    value={payers[member.id] || ""}
                                    onChange={(e) =>
                                        handlePayerChange(
                                            member.id,
                                            Number(e.target.value),
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    {/* WHO CONSUMED SECTION (THE SPLIT) */}
                    <div className="bg-white/5 border border-[var(--color-border)] p-4 rounded-2xl space-y-3">
                        <div className="flex justify-between items-end mb-2">
                            <h3 className="font-semibold text-white">
                                For Whom? (Exact Amounts)
                            </h3>
                            <div className="text-right">
                                <span
                                    className={`text-sm font-medium block ${Math.abs(currentTotalConsumed - totalAmount) < 0.01 ? "text-green-400" : "text-red-400"}`}
                                >
                                    ₹{currentTotalConsumed.toFixed(2)} / ₹
                                    {totalAmount.toFixed(2)}
                                </span>
                                <button
                                    onClick={splitEqually}
                                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold mt-1"
                                >
                                    Split Equally
                                </button>
                            </div>
                        </div>
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="flex justify-between items-center gap-4"
                            >
                                <span className="text-sm text-[var(--color-muted)] truncate">
                                    {member.name} {member.isShadow && "(Guest)"}
                                </span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-32 text-right !bg-black"
                                    value={consumers[member.id] || ""}
                                    onChange={(e) =>
                                        handleConsumerChange(
                                            member.id,
                                            Number(e.target.value),
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    <textarea
                        placeholder="Additional Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                    />
                </div>

                <div className="p-6 border-t border-[var(--color-border)] bg-black shrink-0">
                    {!isMathValid && totalAmount > 0 && (
                        <p className="text-red-400 text-xs font-semibold text-center mb-3">
                            The math doesn&#39;t add up. Ensure both lists equal ₹{totalAmount.toFixed(2)}
                        </p>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={isPending || !isMathValid}
                        className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:bg-gray-600 disabled:text-gray-400"
                    >
                        {isPending ? "Saving..." : "Save Group Expense"}
                    </button>
                </div>
            </div>
        </main>
    );
}
