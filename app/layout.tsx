import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { LotProvider } from "@/contexts/lot-context";
import { UsersProvider } from "@/contexts/users-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { ErrorProvider } from "@/contexts/error-context";
import { ErrorModal } from "@/components/ui/error-modal";
import { Toaster } from "@/components/ui/sonner";
import ScrollRestoration from "@/components/ScrollRestoration";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Golden Trace | Sistema de Trazabilidad",
  description:
    "Sistema de trazabilidad industrial para Golden Leaf - Control completo del proceso productivo del tabaco mediante codigos QR",
  generator: "Golden Trace v1.0",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8faf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1a14" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ErrorProvider>
          <AuthProvider>
            <UsersProvider>
              <LotProvider>
                <NotificationProvider>
                  <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                  >
                    <ScrollRestoration />
                    {children}
                    <ErrorModal />
                    <Toaster />
                  </ThemeProvider>
                </NotificationProvider>
              </LotProvider>
            </UsersProvider>
          </AuthProvider>
        </ErrorProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
