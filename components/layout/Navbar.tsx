"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logout } from "@/features/auth/actions";
import { useTransition } from "react";

type NavbarProps = {
    onAddClick?: () => void;
};

export default function Navbar({ onAddClick }: NavbarProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    return (
        <>
            <nav className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link
                            href="/dashboard"
                            className="text-xl font-extrabold text-[var(--color-primary)] tracking-tight"
                        >
                            BFM.
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
                        onClick={() => startTransition(() => logout())}
                        disabled={isPending}
                        className="text-sm font-medium text-red-500 hover:text-red-600 transition disabled:opacity-50"
                    >
                        {isPending ? "Logging out..." : "Logout"}
                    </button>
                </div>
            </nav>

            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] pb-safe z-50 px-6 shadow-2xl">
                <div className="flex justify-between items-center h-16 relative">
                    <Link
                        href="/dashboard"
                        className="flex flex-col items-center justify-center w-12 text-[var(--color-muted)] hover:text-white transition-colors"
                    >
                        <svg
                            className="w-5 h-5 mb-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                        <span className="text-[10px] font-medium">Home</span>
                    </Link>
                    <button
                        onClick={() =>
                            onAddClick
                                ? onAddClick()
                                : router.push("/expenses/new")
                        }
                        className="absolute left-1/2 -translate-x-1/2 -top-6 flex items-center justify-center bg-white text-black w-14 h-14 rounded-full shadow-[0_8px_30px_rgba(255,255,255,0.3)] active:scale-95 transition-transform border-4 border-[var(--color-background)]"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                    </button>
                    <Link
                        href="/expenses"
                        className="flex flex-col items-center justify-center w-12 text-[var(--color-muted)] hover:text-white transition-colors"
                    >
                        <svg
                            className="w-5 h-5 mb-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <span className="text-[10px] font-medium">
                            Expenses
                        </span>
                    </Link>
                </div>
            </div>
        </>
    );
}
