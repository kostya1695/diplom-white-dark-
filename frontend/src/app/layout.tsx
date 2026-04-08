import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { SiteHeader } from "@/components/SiteHeader";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "blockchain-diplom",
  description: "Система верификации дипломов на блокчейне",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.className} ${inter.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <SiteHeader />
            <div className="transition-colors duration-200 ease-out">{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
