import GroupForm from "@/components/forms/GroupForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewGroupPage() {
    const supabase = await createClient();

    // Auth Check
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth");

    return <GroupForm />;
}
