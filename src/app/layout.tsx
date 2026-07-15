import type { Metadata } from "next";
import { Oswald, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import { auth } from "@/auth";
import SiteHeader from "@/components/SiteHeader";
import BottomNav from "@/components/dashboard/BottomNav";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Athleticore — Athlete Profile",
  description:
    "International sports platform for athlete performance, recovery, and scouting.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const athleteHandle =
    session?.user?.role === "athlete" ? session.user.athleteHandle : undefined;

  return (
    <html
      lang="en"
      className={`${oswald.variable} ${publicSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className={`flex-1 ${athleteHandle ? "pb-24 lg:pb-0" : ""}`}>{children}</main>
        {athleteHandle && <BottomNav handle={athleteHandle} />}
      </body>
    </html>
  );
}
