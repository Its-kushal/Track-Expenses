import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { fetchExpenseMeta } from "@/features/expenses/fetchExpenseMeta";
import GroupExpenseForm from "@/components/forms/GroupExpenseForm";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function NewGroupExpensePage({ params }: PageProps) {
    const { id: groupId } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth");

    const [metaResponse, membersResponse] = await Promise.all([
        fetchExpenseMeta(supabase),
        supabase
            .from("group_members")
            .select(
                `
                user_id,
                shadow_id,
                profiles:user_id (full_name),
                shadow_profiles:shadow_id (temp_name)
            `,
            )
            .eq("group_id", groupId),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawMembers = (membersResponse.data as any[]) || [];
    if (!rawMembers || !rawMembers.some((m) => m.user_id === user.id)) {
        redirect("/dashboard");
    }

    const members = rawMembers.map((m) => {
        const isShadow = m.user_id === null;
        return {
            id: isShadow ? m.shadow_id! : m.user_id!,
            name: isShadow
                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                ? m.shadow_profiles?.temp_name!
                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                : m.profiles?.full_name!,
            isShadow,
        };
    });

    const { categories, paymentModes } = metaResponse;

    return (
        <GroupExpenseForm
            groupId={groupId}
            categories={categories}
            paymentModes={paymentModes}
            members={members}
        />
    );
}
