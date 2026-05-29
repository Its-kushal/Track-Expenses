import Navbar from "@/components/layout/Navbar";

export default function DashboardLoading() {
    return (
        <main className="min-h-screen bg-[var(--color-background)] pb-24 md:pb-0">
            <Navbar />
            <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8 animate-pulse">
                <header className="flex justify-between items-end">
                    <div className="space-y-3">
                        <div className="h-10 w-48 bg-white/10 rounded-lg"></div>
                        <div className="h-4 w-64 bg-white/5 rounded-md"></div>
                    </div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-32 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5"
                        ></div>
                    ))}
                </div>
            </div>
        </main>
    );
}
