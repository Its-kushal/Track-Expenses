import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function GroupsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth");

    // RLS ensures they only fetch groups where they have a valid group_members row
    const { data: groups, error } = await supabase
        .from("groups")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching groups:", error);
    }

    return (
        <main className="min-h-screen bg-[var(--color-background)] pb-24 md:pb-0">
            <Navbar />
            <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Your Groups
                        </h1>
                        <p className="text-[var(--color-muted)] mt-1">
                            Manage shared expenses and friendships
                        </p>
                    </div>
                    {/* We will build this Create Group page next */}
                    <Link
                        href="/groups/new"
                        className="bg-white text-black px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition text-sm"
                    >
                        + New Group
                    </Link>
                </header>

                <section>
                    {!groups || groups.length === 0 ? (
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <svg
                                    className="w-8 h-8 text-[var(--color-muted)]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                                No groups yet
                            </h3>
                            <p className="text-sm text-[var(--color-muted)] max-w-sm mb-6">
                                Create a group to start splitting bills with
                                friends, roommates, or family.
                            </p>
                            <Link
                                href="/groups/new"
                                className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                            >
                                Create your first group
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groups.map((group) => (
                                <Link
                                    key={group.id}
                                    href={`/groups/${group.id}`}
                                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm hover:border-white/20 transition-colors group cursor-pointer"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white group-hover:text-white transition-colors">
                                                {group.name}
                                            </h3>
                                            {group.description && (
                                                <p className="text-sm text-[var(--color-muted)] mt-1 line-clamp-1">
                                                    {group.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-white/10 transition-all">
                                            →
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
