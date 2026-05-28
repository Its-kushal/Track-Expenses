import { Analytics } from "@vercel/analytics/next";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <Analytics />
        </>
    );
}
