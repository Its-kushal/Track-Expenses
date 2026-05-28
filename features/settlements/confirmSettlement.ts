"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function confirmSettlement(settlementId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // 1. Security Check: Only the Payee can confirm they received the money
    const { data: settlement } = await supabase
        .from("settlements")
        .select("payee_id, status")
        .eq("id", settlementId)
        .single();

    if (!settlement || settlement.payee_id !== user.id) {
        return { error: "You are not authorized to confirm this payment." };
    }

    if (settlement.status === "completed") {
        return { error: "This payment has already been confirmed." };
    }

    // 2. Update the status
    // The moment this updates, your 'on_settlement_status_change' DB trigger fires and adjusts balances
    const { error } = await supabase
        .from("settlements")
        .update({
            status: "completed",
            completed_at: new Date().toISOString(),
        })
        .eq("id", settlementId);

    if (error) return { error: "Failed to confirm settlement." };

    // 3. Purge all relevant caches
    revalidatePath("/activity");
    revalidatePath("/groups/[id]", "page");
    revalidatePath("/dashboard");

    return { success: true };
}
