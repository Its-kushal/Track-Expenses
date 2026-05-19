"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function TestPage() {
    useEffect(() => {
        async function testConnection() {
            const { data, error } = await supabase
                .from("categories")
                .select("*");

            console.log("DATA:", data);
            console.log("ERROR:", error);
        }

        testConnection();
    }, []);

    return <div>Testing Supabase...</div>;
}
