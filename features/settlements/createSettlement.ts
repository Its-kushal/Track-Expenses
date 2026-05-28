"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type SettlementPayload = {
    groupId: string;
    payer: { id: string; isShadow: boolean };
    payee: { id: string; isShadow: boolean };
    amount: number;
    paymentModeId: string; // <-- 1. Add this to the payload
};

export async function createSettlement(data: SettlementPayload) {
    const supabase = await createClient();

    // 1. Security Check
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // 2. Ironclad Validation
    if (data.amount <= 0) return { error: "Amount must be greater than zero." };
    if (data.payer.id === data.payee.id)
        return { error: "You cannot settle up with yourself." };
    if (!data.paymentModeId)
        return { error: "Please select a payment method." };

    // 3. The State Machine (Determining Trust)
    let initialStatus = "pending";
    const isCurrentUserThePayee =
        !data.payee.isShadow && data.payee.id === user.id;
    const isPayeeAShadowUser = data.payee.isShadow;

    if (isCurrentUserThePayee || isPayeeAShadowUser) {
        initialStatus = "completed";
    }

    // 4. Insert into the Ledger
    const { error } = await supabase.from("settlements").insert({
        group_id: data.groupId,
        payer_id: data.payer.isShadow ? null : data.payer.id,
        payer_shadow_id: data.payer.isShadow ? data.payer.id : null,
        payee_id: data.payee.isShadow ? null : data.payee.id,
        payee_shadow_id: data.payee.isShadow ? data.payee.id : null,
        amount: data.amount,
        payment_mode_id: data.paymentModeId, // <-- 2. Insert into database
        status: initialStatus,
        created_by: user.id,
        completed_at:
            initialStatus === "completed" ? new Date().toISOString() : null,
    });

    if (error) return { error: error.message };

    revalidatePath(`/groups/${data.groupId}`);
    return { success: true, status: initialStatus };
}
