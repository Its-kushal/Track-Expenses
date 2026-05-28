"use client";

import { useState } from "react";
import { updateProfile } from "@/features/profile/updateProfile";

export default function OnboardingPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleFormAction(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = await updateProfile(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <main className="flex flex-col justify-center min-h-[100dvh] p-6 max-w-md mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Complete Your Profile</h1>
                <p className="text-[var(--color-muted)] mt-2">
                    Set up your preferences to continue.
                </p>
            </div>

            <form action={handleFormAction} className="space-y-4">
                <input name="full_name" placeholder="Full Name" required />
                <input name="username" placeholder="Username" required />
                <input
                    name="currency"
                    defaultValue="INR"
                    placeholder="Currency (e.g., INR, USD)"
                    required
                />
                <input
                    name="timezone"
                    defaultValue="Asia/Kolkata"
                    placeholder="Timezone"
                    required
                />
                <input name="phone" placeholder="Phone (Optional)" type="tel" />

                {error && (
                    <p className="text-sm font-medium text-red-400">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black font-semibold rounded-2xl py-4 mt-4"
                >
                    {loading ? "Saving..." : "Complete Profile"}
                </button>
            </form>
        </main>
    );
}
