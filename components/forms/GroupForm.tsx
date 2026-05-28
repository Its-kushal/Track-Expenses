"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGroup } from "@/features/groups/createGroup";

export default function GroupForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleSubmit(formData: FormData) {
        setError(null);
        startTransition(async () => {
            const result = await createGroup(formData);

            if (result.error) {
                setError(result.error);
                return;
            }

            if (result.success && result.groupId) {
                // Immediately route them into their newly created group hub
                router.push(`/groups/${result.groupId}`);
            }
        });
    }

    return (
        <main className="min-h-[100dvh] bg-[var(--color-background)] flex flex-col pb-safe">
            <div className="flex-1 flex flex-col w-full max-w-md mx-auto bg-[var(--color-surface)] sm:mt-10 sm:mb-10 sm:border sm:border-[var(--color-border)] sm:rounded-3xl sm:shadow-2xl overflow-hidden">
                <header className="flex justify-between items-center p-6 border-b border-[var(--color-border)] shrink-0">
                    <h2 className="text-xl font-bold">Create Group</h2>
                    <button
                        onClick={() => router.back()}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label="Go Back"
                    >
                        ✕
                    </button>
                </header>

                <div className="p-6 overflow-y-auto flex-1">
                    <form
                        action={handleSubmit}
                        id="create-group-form"
                        className="space-y-4"
                    >
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-muted)] mb-2">
                                Group Name
                            </label>
                            <input
                                name="name"
                                type="text"
                                placeholder="e.g., Goa Trip 2026, Apartment 4B"
                                required
                                disabled={isPending}
                                maxLength={50}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-muted)] mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                name="description"
                                placeholder="What is this group for?"
                                disabled={isPending}
                                rows={3}
                                maxLength={200}
                            />
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
                    <button
                        type="submit"
                        form="create-group-form"
                        disabled={isPending}
                        className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {isPending ? "Initializing Ledger..." : "Create Group"}
                    </button>
                </div>
            </div>
        </main>
    );
}
