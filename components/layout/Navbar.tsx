"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function Navbar() {
    const router = useRouter();

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/auth");
    }

    return (
        <>
            <nav className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link
                            href="/dashboard"
                            className="text-xl font-extrabold text-[var(--color-primary)] tracking-tight"
                        >
                            Track.
                        </Link>
                        <div className="hidden md:flex gap-6 text-sm font-medium text-[var(--color-muted)]">
                            <Link
                                href="/dashboard"
                                className="hover:text-[var(--color-primary)] transition"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/expenses"
                                className="hover:text-[var(--color-primary)] transition"
                            >
                                All Expenses
                            </Link>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-red-500 hover:text-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] pb-safe z-50 flex justify-around items-center h-16 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <Link
                    href="/dashboard"
                    className="flex flex-col items-center text-[var(--color-muted)] hover:text-[var(--color-primary)] text-xs font-medium"
                >
                    <span className="text-xl mb-1">🏠</span>
                    Home
                </Link>
                <Link
                    href="/expenses/new"
                    className="flex items-center justify-center bg-black text-white w-12 h-12 rounded-full -mt-6 shadow-lg shadow-black/20 hover:scale-105 transition-transform"
                >
                    <span className="text-2xl font-light">+</span>
                </Link>
                <Link
                    href="/expenses"
                    className="flex flex-col items-center text-[var(--color-muted)] hover:text-[var(--color-primary)] text-xs font-medium"
                >
                    <span className="text-xl mb-1">🧾</span>
                    Expenses
                </Link>
            </div>
        </>
    );
}
