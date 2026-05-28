export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Middleware handles the auth check.
    // We will handle profile completion verification in the Server Component pages next.
    return <>{children}</>;
}
