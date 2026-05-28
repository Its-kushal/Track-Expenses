"use client";
import { useState } from "react";
import { login, signup } from "../../features/auth/actions";

export default function AuthPage() {
    const [isSignup, setIsSignup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: "error" | "success";
        text: string;
    } | null>(null);
    async function handleAuth(formData: FormData) {
        setLoading(true);
        setMessage(null);

        const action = isSignup ? signup : login;
        const result = await action(formData);

        if (result?.error) {
            setMessage({ type: "error", text: result.error });
        } else if (result?.success) {
            setMessage({ type: "success", text: result.success });
        }
        setLoading(false);
    }
    return (
        <main className="flex flex-col justify-center min-h-[100dvh] p-6 max-w-md mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    {isSignup ? "Create Account" : "Welcome Back"}
                </h1>
                <p className="text-[var(--color-muted)] mt-2">
                    Secure access to your finances.
                </p>
            </div>

            <form action={handleAuth} className="space-y-4">
                <input
                    name="email"
                    type="email"
                    placeholder="Email address"
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                />

                {message && (
                    <p
                        className={`text-sm font-medium ${message.type === "error" ? "text-red-400" : "text-green-400"}`}
                    >
                        {message.text}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black font-semibold rounded-2xl py-4 mt-4"
                >
                    {loading
                        ? "Processing..."
                        : isSignup
                          ? "Sign Up"
                          : "Log In"}
                </button>
            </form>

            <button
                onClick={() => {
                    setIsSignup(!isSignup);
                    setMessage(null);
                }}
                type="button"
                className="mt-8 text-[var(--color-muted)] text-sm font-medium hover:text-white transition-colors"
            >
                {isSignup
                    ? "Already have an account? Log in"
                    : "Need an account? Sign up"}
            </button>
        </main>
    );
}
