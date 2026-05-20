"use client";

import { useRouter } from "next/navigation";

export default function FloatingExpenseButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push("/expenses/new")}
            style={{
                position: "fixed",
                bottom: 24,
                right: 24,
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "none",
                fontSize: 32,
                background: "black",
                color: "white",
                cursor: "pointer",
            }}
        >
            +
        </button>
    );
}
