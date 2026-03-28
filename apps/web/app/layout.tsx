import type { Metadata } from "next";
import { GameStateProvider } from "@/components/providers/game-state-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusQuest URI",
  description: "Fantasy-themed student productivity RPG for the University of Rhode Island."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GameStateProvider>{children}</GameStateProvider>
      </body>
    </html>
  );
}
