import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { logError } from "./lib/logger";


export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "FitTrack Pro",
  description: "Your personal fitness companion",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.png",
    shortcut: "/logo.svg",
  },
};

async function getUser() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    logError("layout.user_fetch.failed", error);
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <NavBar user={user} />
        <main className="flex-grow max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
