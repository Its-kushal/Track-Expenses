"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkSession() {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                router.push("/auth/login");
                return;
            }

            setLoading(false);
        }

        checkSession();
    }, [router]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
}
