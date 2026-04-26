import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kingdom Builders | RCCG The King's House",
  description: "Elite Donor Management System for the RCCG TKH Building Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
