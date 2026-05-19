"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
    validateProfile,
    type ProfileFormData,
} from "@/features/profile/profile.schema";

import { updateProfile } from "@/features/profile/updateProfile";

export default function OnboardingPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<ProfileFormData>({
        full_name: "",
        username: "",
        currency: "INR",
        timezone: "Asia/Kolkata",
        phone: "",
    });

    async function handleSubmit() {
        const validationError = validateProfile(formData);

        if (validationError) {
            alert(validationError);
            return;
        }

        try {
            setLoading(true);

            await updateProfile(formData);

            router.push("/dashboard");
        } catch (error) {
            console.error(error);

            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{ padding: 24 }}>
            <h1>Complete Your Profile</h1>

            <br />

            <input
                placeholder="Full Name"
                value={formData.full_name}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        full_name: e.target.value,
                    })
                }
            />

            <br />
            <br />

            <input
                placeholder="Username"
                value={formData.username}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        username: e.target.value,
                    })
                }
            />

            <br />
            <br />

            <input
                placeholder="Currency"
                value={formData.currency}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        currency: e.target.value,
                    })
                }
            />

            <br />
            <br />

            <input
                placeholder="Timezone"
                value={formData.timezone}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        timezone: e.target.value,
                    })
                }
            />

            <br />
            <br />

            <input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        phone: e.target.value,
                    })
                }
            />

            <br />
            <br />

            <button onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : "Complete Profile"}
            </button>
        </main>
    );
}
