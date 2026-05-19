"use client";

import { useEffect, useState } from "react";

import Navbar from "@/components/layout/Navbar";

import { getCurrentUser } from "@/features/auth/getCurrentUser";

export default function DashboardPage() {
    const [email, setEmail] = useState("");

    useEffect(() => {
        async function loadUser() {
            const user = await getCurrentUser();

            if (!user) return;

            setEmail(user.email || "");
        }

        loadUser();
    }, []);

    return (
        <main>
            <Navbar />

            <div style={{ padding: 24 }}>
                <h1>Dashboard</h1>

                <p>Logged in as: {email}</p>
            </div>
        </main>
    );
}
