import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ExpenseCard from "@/components/ui/ExpenseCard";
import { fetchExpenseMeta } from "@/features/expenses/fetchExpenseMeta";
import GroupHeaderActions from "./GroupHeaderActions";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function GroupPage({ params }: PageProps) {
    const { id: groupId } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth");

    // Execute all 5 queries in parallel for maximum performance
    const [groupRes, membersRes, balancesRes, expensesRes, metaRes] =
        await Promise.all([
            supabase.from("groups").select("*").eq("id", groupId).single(),
            supabase
                .from("group_members")
                .select(
                    `
            user_id, shadow_id, role,
            profiles:user_id (full_name),
            shadow_profiles:shadow_id (temp_name)
        `,
                )
                .eq("group_id", groupId),
            supabase.from("group_balances").select("*").eq("group_id", groupId),
            supabase
                .from("expenses")
                .select(
                    `
            *,
            categories (id, name),
            payment_modes (id, name),
            expense_participants (
                user_id, 
                shadow_id, 
                paid_amount, 
                owed_amount
            )
        `,
                )
                .eq("group_id", groupId)
                .order("expense_date", { ascending: false })
                .limit(50),
            fetchExpenseMeta(supabase),
        ]);

    // RLS Security Check: If groupRes throws an error or returns null, they aren't authorized.
    if (groupRes.error || !groupRes.data) {
        redirect("/groups");
    }

    const group = groupRes.data;
    const members = membersRes.data || [];
    const balances = balancesRes.data || [];
    const expenses = expensesRes.data || [];
    const { categories, paymentModes } = metaRes;

    // Helper to map a member's ID to their name and balance
    const mappedMembers = members.map((m) => {
        const isShadow = m.user_id === null;
        const id = isShadow ? m.shadow_id! : m.user_id!;
        const name = isShadow
            ? m.shadow_profiles?.temp_name
            : m.profiles?.full_name;

        // Find their balance from the trigger-updated table
        const balanceRow = balances.find(
            (b) =>
                (isShadow && b.shadow_id === id) ||
                (!isShadow && b.user_id === id),
        );
        const balance = balanceRow ? Number(balanceRow.balance) : 0;

        return { id, name, isShadow, balance, role: m.role };
    });

    return (
        <main className="min-h-screen bg-[var(--color-background)] pb-24 md:pb-0">
            <Navbar />

            <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
                {/* 1. HEADER SECTION */}
                <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-[var(--color-border)] pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {group.name}
                        </h1>
                        {group.description && (
                            <p className="text-[var(--color-muted)] mt-1">
                                {group.description}
                            </p>
                        )}
                    </div>
                    <GroupHeaderActions
                        groupId={groupId}
                        members={mappedMembers}
                        paymentModes={paymentModes}
                    />
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 2. BALANCES SECTION (The Ledger) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
                            <h2 className="text-lg font-bold mb-4">
                                Group Balances
                            </h2>
                            <div className="space-y-4">
                                {mappedMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex justify-between items-center pb-4 border-b border-[var(--color-border)] last:border-0 last:pb-0"
                                    >
                                        <div>
                                            <p className="font-medium text-white">
                                                {member.name}{" "}
                                                {member.id === user.id &&
                                                    "(You)"}
                                            </p>
                                            {member.isShadow && (
                                                <p className="text-xs text-[var(--color-muted)]">
                                                    Guest
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {member.balance === 0 ? (
                                                <span className="text-[var(--color-muted)] font-semibold">
                                                    Settled
                                                </span>
                                            ) : member.balance > 0 ? (
                                                <span className="text-green-400 font-semibold block">
                                                    Gets back
                                                </span>
                                            ) : (
                                                <span className="text-red-400 font-semibold block">
                                                    Owes
                                                </span>
                                            )}
                                            {member.balance !== 0 && (
                                                <span
                                                    className={`text-lg font-bold ${member.balance > 0 ? "text-green-400" : "text-red-400"}`}
                                                >
                                                    ₹
                                                    {Math.abs(
                                                        member.balance,
                                                    ).toLocaleString(
                                                        undefined,
                                                        {
                                                            minimumFractionDigits: 2,
                                                        },
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. EXPENSES FEED */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-bold mb-2">
                            Recent Expenses
                        </h2>
                        {expenses.length === 0 ? (
                            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center text-[var(--color-muted)]">
                                No expenses yet. Click &#34;Add Expense&#34; to
                                start splitting.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {expenses.map((expense) => (
                                    <ExpenseCard
                                        key={expense.id}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        expense={expense as any}
                                        categories={categories}
                                        paymentModes={paymentModes}
                                        currentUserId={user.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
