import { supabase } from "@/lib/supabase/client";

export async function fetchExpenseMeta() {
    const [categoriesResponse, paymentModesResponse] = await Promise.all([
        supabase.from("categories").select("*").order("name"),

        supabase.from("payment_modes").select("*").order("name"),
    ]);

    return {
        categories: categoriesResponse.data || [],
        paymentModes: paymentModesResponse.data || [],
    };
}
