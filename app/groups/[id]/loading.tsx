import Navbar from "@/components/layout/Navbar";

export default function GroupLoading() {
    return (
        <main className="min-h-screen bg-[var(--color-background)] pb-24 md:pb-0">
            <Navbar />
            <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8 animate-pulse">
                <div className="h-10 w-1/3 bg-white/10 rounded-lg"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    <div className="lg:col-span-1 h-64 bg-[var(--color-surface)] rounded-2xl"></div>
                    <div className="lg:col-span-2 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-24 bg-[var(--color-surface)] rounded-2xl"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
