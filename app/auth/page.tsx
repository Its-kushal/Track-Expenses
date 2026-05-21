"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthPage() {
    const router = useRouter();
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    async function handleAuth(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg("");
        try {
            setLoading(true);
            if (isSignup) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setIsSignup(false);
                setErrorMsg("Success! Please log in.");
                return;
            }
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            router.push("/dashboard");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setErrorMsg(error.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
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

            <form onSubmit={handleAuth} className="space-y-4">
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {errorMsg && (
                    <p className="text-red-400 text-sm font-medium">
                        {errorMsg}
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
                    setErrorMsg("");
                }}
                className="mt-8 text-[var(--color-muted)] text-sm font-medium hover:text-white transition-colors"
            >
                {isSignup
                    ? "Already have an account? Log in"
                    : "Need an account? Sign up"}
            </button>
        </main>
    );
}
