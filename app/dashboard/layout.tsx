"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getProfile } from "@/features/profile/getProfile";

export default function DashboardLayout({children,}: {children: React.ReactNode;}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAccess() {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) {
                router.push("/auth");
                return;
            }
            const profile = await getProfile();
            if (!profile) {
                router.push("/onboarding");
                return;
            }
            const isProfileIncomplete =
                !profile.full_name ||
                !profile.username ||
                !profile.currency ||
                !profile.timezone;
            if (isProfileIncomplete) {
                router.push("/onboarding");
                return;
            }
            setLoading(false);
        }
        checkAccess();
    }, [router]);
    if (loading) {
        return <div>Loading...</div>;
    }
    return <>{children}</>;
}
