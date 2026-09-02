import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nestara Estates - Find a Property You Can Trust",
  description: "Discover, compare, verify and connect with premium properties through Nestara Estates.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { NavbarWrapper } from "@/components/layout/navbar-wrapper";
import { CompareFloatingButton } from "@/components/properties/CompareFloatingButton";
import { UrlToasts } from "@/components/layout/UrlToasts";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let accountStatus = 'ACTIVE';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_status')
      .eq('id', user.id)
      .single();
    if (profile?.account_status) {
      accountStatus = profile.account_status;
    }
  }

  if (accountStatus === 'SUSPENDED' || accountStatus === 'BANNED') {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex items-center justify-center bg-zinc-50`}>
          <div className="max-w-md p-8 bg-white border border-zinc-200 rounded-xl shadow-sm text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Account {accountStatus.charAt(0) + accountStatus.slice(1).toLowerCase()}</h1>
            <p className="text-zinc-600 mb-6">
              Your account has been {accountStatus.toLowerCase()}. Please contact support for more assistance.
            </p>
            <form action={async () => {
              'use server'
              const supabase = await createClient()
              await supabase.auth.signOut()
            }}>
              <button type="submit" className="px-4 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors">
                Sign Out
              </button>
            </form>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <NavbarWrapper>
          <Navbar />
        </NavbarWrapper>
        <Suspense fallback={null}>
          <UrlToasts />
        </Suspense>
        <main className="flex-1 flex flex-col pb-16 md:pb-0">
          {children}
        </main>
        <CompareFloatingButton />
      </body>
    </html>
  );
}
