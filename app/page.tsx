import Link from "next/link";

export default function HomePage() {
    return (
        <main className="flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center">
            <div className="max-w-md w-full space-y-6">
                <div className="space-y-2">
                    <h1 className="text-5xl font-extrabold tracking-tight text-white">
                        BFM.
                    </h1>
                    <p className="text-[var(--color-muted)] text-lg font-medium">
                        Ruthless financial clarity.
                    </p>
                </div>

                <div className="pt-10">
                    <Link
                        href="/auth"
                        className="block w-full bg-white text-black font-semibold rounded-2xl py-4 hover:bg-gray-200 transition-colors shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                    >
                        Enter Application
                    </Link>
                </div>
            </div>
        </main>
    );
}
