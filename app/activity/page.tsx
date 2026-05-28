import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ConfirmSettlementButton from "@/components/ui/ConfirmSettlementButton";

export default async function ActivityPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth");

    // Fetch settlements where the user is either the payer or the payee
    const { data: rawSettlements, error } = await supabase
        .from("settlements")
        .select(
            `
            id, amount, status, created_at,
            payer_id, payer_shadow_id,
            payee_id, payee_shadow_id,
            groups (name),
            payment_modes (name),
            payer_profile:payer_id (full_name),
            payer_shadow:payer_shadow_id (temp_name),
            payee_profile:payee_id (full_name),
            payee_shadow:payee_shadow_id (temp_name)
        `,
        )
        .or(`payer_id.eq.${user.id},payee_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) console.error("Error fetching activity:", error);

    const settlements = rawSettlements || [];

    // Separate pending actionable items from historical feed
    const pendingApprovals = settlements.filter(
        (s) => s.status === "pending" && s.payee_id === user.id,
    );
    const history = settlements.filter(
        (s) => !(s.status === "pending" && s.payee_id === user.id),
    );

    return (
        <main className="min-h-screen bg-[var(--color-background)] pb-24 md:pb-0">
            <Navbar />
            <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-8">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Activity Feed
                    </h1>
                    <p className="text-[var(--color-muted)] mt-1">
                        Pending approvals and settlement history
                    </p>
                </header>

                {/* ACTION REQUIRED: Pending Approvals */}
                {pendingApprovals.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                            <span>⚠️</span> Needs Your Confirmation
                        </h2>
                        <div className="space-y-3">
                            {pendingApprovals.map((s) => {
                                const payerName =
                                    s.payer_profile?.full_name ||
                                    s.payer_shadow?.temp_name ||
                                    "Someone";
                                return (
                                    <div
                                        key={s.id}
                                        className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
                                    >
                                        <div>
                                            <p className="font-medium text-white">
                                                {payerName} paid you{" "}
                                                <span className="font-bold text-yellow-400">
                                                    ₹{s.amount.toLocaleString()}
                                                </span>
                                            </p>
                                            <p className="text-sm text-[var(--color-muted)] mt-1">
                                                via{" "}
                                                {s.payment_modes?.name ||
                                                    "Unknown Method"}{" "}
                                                • in {s.groups?.name}
                                            </p>
                                        </div>
                                        <ConfirmSettlementButton
                                            settlementId={s.id}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                <hr className="border-[var(--color-border)]" />

                {/* HISTORICAL FEED */}
                <section className="space-y-4">
                    <h2 className="text-lg font-bold">Past Activity</h2>
                    {history.length === 0 ? (
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center text-[var(--color-muted)]">
                            No settlement history found.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((s) => {
                                const isPayer = s.payer_id === user.id;
                                const otherName = isPayer
                                    ? s.payee_profile?.full_name ||
                                      s.payee_shadow?.temp_name ||
                                      "Someone"
                                    : s.payer_profile?.full_name ||
                                      s.payer_shadow?.temp_name ||
                                      "Someone";

                                return (
                                    <div
                                        key={s.id}
                                        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex justify-between items-center gap-4 opacity-75"
                                    >
                                        <div>
                                            <p className="font-medium text-white">
                                                {isPayer
                                                    ? `You paid ${otherName}`
                                                    : `${otherName} paid you`}
                                            </p>
                                            <p className="text-xs text-[var(--color-muted)] mt-1">
                                                via{" "}
                                                {s.payment_modes?.name ||
                                                    "Unknown Method"}{" "}
                                                •{" "}
                                                {new Date(
                                                    s.created_at,
                                                ).toLocaleDateString("en-IN", {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`text-lg font-bold ${isPayer ? "text-white" : "text-green-400"}`}
                                            >
                                                ₹{s.amount.toLocaleString()}
                                            </span>
                                            {s.status === "pending" && (
                                                <span className="block text-xs text-yellow-400 font-semibold mt-1">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
