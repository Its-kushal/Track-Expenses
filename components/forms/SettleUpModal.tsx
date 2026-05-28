"use client";
import { useState, useTransition } from "react";
import { createSettlement } from "@/features/settlements/createSettlement";

type Member = { id: string; name: string; isShadow: boolean; balance: number };
type PaymentMode = { id: string; name: string };

type SettleUpModalProps = {
    groupId: string;
    members: Member[];
    paymentModes: PaymentMode[]; // <-- 1. Require payment modes
    onClose: () => void;
};

export default function SettleUpModal({
    groupId,
    members,
    paymentModes,
    onClose,
}: SettleUpModalProps) {
    const [isPending, startTransition] = useTransition();

    const defaultPayer = members.find((m) => m.balance < 0) || members[0];
    const defaultPayee =
        members.find((m) => m.balance > 0 && m.id !== defaultPayer?.id) ||
        members[1];

    const [payerId, setPayerId] = useState(defaultPayer?.id || "");
    const [payeeId, setPayeeId] = useState(defaultPayee?.id || "");
    const [amount, setAmount] = useState<number | "">("");
    const [paymentModeId, setPaymentModeId] = useState(""); // <-- 2. Add state

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!payerId || !payeeId || !amount || amount <= 0 || !paymentModeId) {
            alert(
                "Please provide valid settlement details and select a payment mode.",
            );
            return;
        }

        const payer = members.find((m) => m.id === payerId);
        const payee = members.find((m) => m.id === payeeId);

        if (!payer || !payee) return;

        startTransition(async () => {
            const result = await createSettlement({
                groupId,
                payer: { id: payer.id, isShadow: payer.isShadow },
                payee: { id: payee.id, isShadow: payee.isShadow },
                amount: Number(amount),
                paymentModeId, // <-- 3. Pass to server action
            });

            if (result?.error) {
                alert(result.error);
                return;
            }

            if (result?.status === "pending") {
                alert(
                    "Settlement recorded! It will remain pending until the receiver confirms it.",
                );
            }

            onClose();
        });
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm md:p-6">
            <div className="bg-[var(--color-surface)] w-full md:w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
                <header className="flex justify-between items-center p-6 border-b border-[var(--color-border)] shrink-0 bg-black">
                    <h2 className="text-xl font-bold">Record a Payment</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                    >
                        ✕
                    </button>
                </header>

                <div className="p-6 overflow-y-auto">
                    <form
                        id="settle-form"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* ... Keep the Payer / Payee dropdowns exactly the same ... */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-semibold text-[var(--color-muted)]">
                                    Who paid?
                                </label>
                                <select
                                    value={payerId}
                                    onChange={(e) => setPayerId(e.target.value)}
                                    className="w-full bg-[#09090b] text-white border border-[var(--color-border)] rounded-xl p-3"
                                >
                                    <option value="" disabled>
                                        Select payer
                                    </option>
                                    {members.map((m) => (
                                        <option
                                            key={m.id}
                                            value={m.id}
                                            disabled={m.id === payeeId}
                                        >
                                            {m.name}{" "}
                                            {m.balance < 0
                                                ? `(Owes ₹${Math.abs(m.balance)})`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-8 shrink-0 text-[var(--color-muted)]">
                                →
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-semibold text-[var(--color-muted)]">
                                    To whom?
                                </label>
                                <select
                                    value={payeeId}
                                    onChange={(e) => setPayeeId(e.target.value)}
                                    className="w-full bg-[#09090b] text-white border border-[var(--color-border)] rounded-xl p-3"
                                >
                                    <option value="" disabled>
                                        Select receiver
                                    </option>
                                    {members.map((m) => (
                                        <option
                                            key={m.id}
                                            value={m.id}
                                            disabled={m.id === payerId}
                                        >
                                            {m.name}{" "}
                                            {m.balance > 0
                                                ? `(Owed ₹${m.balance})`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Amount & Payment Mode Row */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[var(--color-muted)]">
                                    Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) =>
                                        setAmount(Number(e.target.value))
                                    }
                                    placeholder="0.00"
                                    className="w-full text-2xl font-bold bg-[#09090b] border border-[var(--color-border)] rounded-xl p-4 text-white placeholder-zinc-700"
                                />
                            </div>

                            {/* 4. Add the Payment Mode Dropdown */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[var(--color-muted)]">
                                    How was it paid?
                                </label>
                                <select
                                    value={paymentModeId}
                                    onChange={(e) =>
                                        setPaymentModeId(e.target.value)
                                    }
                                    className="w-full bg-[#09090b] text-white border border-[var(--color-border)] rounded-xl p-3"
                                >
                                    <option value="" disabled>
                                        Select Payment Method
                                    </option>
                                    {paymentModes.map((mode) => (
                                        <option key={mode.id} value={mode.id}>
                                            {mode.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-[var(--color-border)] shrink-0">
                    <button
                        type="submit"
                        form="settle-form"
                        disabled={isPending}
                        className="w-full py-4 bg-green-500 hover:bg-green-600 text-black rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                        {isPending ? "Recording..." : "Save Payment"}
                    </button>
                </div>
            </div>
        </div>
    );
}
