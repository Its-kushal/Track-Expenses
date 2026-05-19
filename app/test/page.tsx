"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Category = {
    id: string;
    name: string;
};

export default function TestPage() {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        async function fetchCategories() {
            const { data, error } = await supabase
                .from("categories")
                .select("*");

            if (error) {
                console.error("SUPABASE ERROR:", error);
                return;
            }

            console.log("CATEGORIES:", data);

            setCategories(data || []);
        }

        fetchCategories();
    }, []);

    return (
        <main style={{ padding: "24px" }}>
            <h1>Supabase Connection Test</h1>

            <ul>
                {categories.map((category) => (
                    <li key={category.id}>{category.name}</li>
                ))}
            </ul>
        </main>
    );
}
