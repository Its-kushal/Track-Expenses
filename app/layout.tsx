import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
    themeColor: "#09090b",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    title: "BFM",
    description: "Ruthless financial clarity.",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "BFM",
    },
    icons: {
        apple: "/icon-192x192.png",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
            <Analytics />
        </html>
    );
}
