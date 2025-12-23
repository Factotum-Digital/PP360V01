import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({
     variable: "--font-inter",
     subsets: ["latin"],
     weight: ["300", "400", "700", "900"],
});

const jetbrainsMono = JetBrains_Mono({
     variable: "--font-mono",
     subsets: ["latin"],
     weight: ["400", "700"],
});

export const metadata: Metadata = {
     title: "PP360VE | Brutalist Exchange",
     description: "Secure, fast, and brutalist exchange terminal.",
};

export default function RootLayout({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     return (
          <html lang="es">
               <body
                    className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen selection:bg-[#FF4D00] selection:text-white`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
               >
                    <div className="noise" />
                    <div className="flex">
                         <Sidebar />
                         <main className="flex-1 p-6 md:p-12 lg:p-20 overflow-hidden">
                              <div className="max-w-6xl mx-auto">
                                   {children}
                              </div>
                         </main>
                    </div>
               </body>
          </html>
     );
}
