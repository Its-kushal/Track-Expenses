"use client";

import { useState, useTransition } from "react";
import { addMemberToGroup } from "@/features/groups/addMember";

type AddMemberModalProps = {
    groupId: string;
    onClose: () => void;
};

export default function AddMemberModal({
    groupId,
    onClose,
}: AddMemberModalProps) {
    const [isPending, startTransition] = useTransition();
    const [email, setEmail] = useState("");
    const [tempName, setTempName] = useState("");

    // State to track if we need to ask for a temporary name
    const [requiresName, setRequiresName] = useState(false);
    const [message, setMessage] = useState<{
        type: "error" | "info" | "success";
        text: string;
    } | null>(null);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);

        // Basic frontend validation for email
        if (!email.includes("@") || !email.includes(".")) {
            setMessage({
                type: "error",
                text: "Please enter a valid email address.",
            });
            return;
        }

        startTransition(async () => {
            const result = await addMemberToGroup(
                groupId,
                email,
                requiresName ? tempName : undefined,
            );

            if (result?.error) {
                setMessage({ type: "error", text: result.error });
                return;
            }

            if (result?.requiresName) {
                // The server couldn't find the user, switch UI to ask for a shadow profile name
                setRequiresName(true);
                setMessage({ type: "info", text: result.message! });
                return;
            }

            if (result?.success) {
                setMessage({ type: "success", text: result.message! });
                // Small delay so they see the success message before it closes
                setTimeout(() => {
                    onClose();
                }, 1000);
            }
        });
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm md:p-6">
            <div className="bg-[var(--color-surface)] w-full md:w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
                <header className="flex justify-between items-center p-6 border-b border-[var(--color-border)] shrink-0">
                    <h2 className="text-xl font-bold">Add Member</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </header>

                <div className="p-6 overflow-y-auto space-y-4">
                    {message && (
                        <div
                            className={`p-4 rounded-xl text-sm font-medium ${
                                message.type === "error"
                                    ? "bg-red-500/10 text-red-400"
                                    : message.type === "success"
                                      ? "bg-green-500/10 text-green-400"
                                      : "bg-blue-500/10 text-blue-400"
                            }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <form
                        id="add-member-form"
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-muted)] mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (requiresName) setRequiresName(false);
                                }}
                                disabled={requiresName || isPending}
                                placeholder="friend@example.com"
                                className="disabled:opacity-50"
                                required
                            />
                        </div>

                        {requiresName && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-medium text-[var(--color-muted)] mb-2">
                                    Temporary Name (They can change this later)
                                </label>
                                <input
                                    type="text"
                                    value={tempName}
                                    onChange={(e) =>
                                        setTempName(e.target.value)
                                    }
                                    disabled={isPending}
                                    placeholder="e.g., Mom"
                                    required
                                />
                            </div>
                        )}
                    </form>
                </div>

                <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
                    <button
                        form="add-member-form"
                        type="submit"
                        disabled={isPending}
                        className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {isPending
                            ? "Processing..."
                            : requiresName
                              ? "Add Temporary Member"
                              : "Search & Add"}
                    </button>
                </div>
            </div>
        </div>
    );
}
