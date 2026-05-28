"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type GroupExpensePayload = {
    groupId: string;
    title: string;
    totalAmount: number;
    categoryId: string;
    paymentModeId: string;
    expenseDate: string;
    notes?: string;
    payers: Record<string, number>;
    consumers: Record<string, number>;
};

export async function createGroupExpense(data: GroupExpensePayload) {
    const supabase = await createClient();

    // 1. Security check
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // 2. The Ironclad Math Check (Server-Side)
    const totalPaid = Object.values(data.payers).reduce(
        (sum, val) => sum + (val || 0),
        0,
    );
    const totalConsumed = Object.values(data.consumers).reduce(
        (sum, val) => sum + (val || 0),
        0,
    );

    // Using Math.abs to handle JavaScript floating-point quirks (e.g., 0.1 + 0.2 !== 0.3)
    if (
        Math.abs(totalPaid - data.totalAmount) > 0.01 ||
        Math.abs(totalConsumed - data.totalAmount) > 0.01
    ) {
        return {
            error: "Ledger mismatch: The paid and consumed amounts do not perfectly match the total.",
        };
    }

    // 3. Fetch Group Members to map IDs correctly (User vs Shadow)
    const { data: members, error: membersError } = await supabase
        .from("group_members")
        .select("user_id, shadow_id")
        .eq("group_id", data.groupId);

    if (membersError || !members)
        return { error: "Failed to validate group members." };

    // 4. Insert the core Expense record
    const { data: newExpense, error: expenseError } = await supabase
        .from("expenses")
        .insert({
            created_by: user.id,
            group_id: data.groupId,
            scope: "group",
            title: data.title,
            amount: data.totalAmount,
            category_id: data.categoryId,
            payment_mode_id: data.paymentModeId,
            expense_date: data.expenseDate,
            notes: data.notes || null,
            is_split: true,
            split_method: "exact",
        })
        .select("id")
        .single();

    if (expenseError) return { error: expenseError.message };

    // 5. Build the exact participant records
    const participantRows = members
        .map((member) => {
            // Resolve the true identity of the member row
            const identityId = member.user_id || member.shadow_id;
            if (!identityId) return null;

            const paid = data.payers[identityId] || 0;
            const owed = data.consumers[identityId] || 0;

            // Skip members who have nothing to do with this specific transaction
            if (paid === 0 && owed === 0) return null;

            return {
                expense_id: newExpense.id,
                user_id: member.user_id,
                shadow_id: member.shadow_id,
                paid_amount: paid,
                owed_amount: owed,
            };
        })
        .filter((row) => row !== null);

    // 6. Insert participants (This fires your DB triggers instantly)
    const { error: participantsError } = await supabase
        .from("expense_participants")
        .insert(participantRows);

    if (participantsError) {
        // Fallback: If participants fail, delete the orphan expense to keep the database clean
        await supabase.from("expenses").delete().eq("id", newExpense.id);
        return {
            error: "Failed to map expense participants. Transaction rolled back.",
        };
    }

    // 7. Purge Cache
    revalidatePath(`/groups/${data.groupId}`);
    revalidatePath("/dashboard");

    return { success: true };
}
