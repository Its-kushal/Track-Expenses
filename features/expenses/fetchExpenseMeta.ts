import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchExpenseMeta(supabase: SupabaseClient) {
    const [categoriesResponse, paymentModesResponse] = await Promise.all([
        supabase.from("categories").select("id, name").order("name"),
        supabase.from("payment_modes").select("id, name").order("name"),
    ]);

    return {
        categories: categoriesResponse.data || [],
        paymentModes: paymentModesResponse.data || [],
    };
}
