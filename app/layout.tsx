import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hyperion - Global Electricity Production",
  description: "Interactive visualization of global electricity production by country and geopolitical bloc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
