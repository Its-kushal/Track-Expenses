export type ProfileFormData = {
    full_name: string;
    username: string;
    currency: string;
    timezone: string;
    phone?: string;
};

export function validateProfile(data: ProfileFormData) {
    if (!data.full_name.trim()) {
        return "Full name is required";
    }

    if (!data.username.trim()) {
        return "Username is required";
    }

    if (data.username.length < 3) {
        return "Username must be at least 3 characters";
    }

    if (!data.currency.trim()) {
        return "Currency is required";
    }

    if (!data.timezone.trim()) {
        return "Timezone is required";
    }

    return null;
}
