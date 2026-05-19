"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function Navbar() {
    const router = useRouter();

    async function handleLogout() {
        await supabase.auth.signOut();

        router.push("/auth/login");
    }

    return (
        <nav
            style={{
                padding: 16,
                borderBottom: "1px solid #ccc",
            }}
        >
            <button onClick={handleLogout}>Logout</button>
        </nav>
    );
}
