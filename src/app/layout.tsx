import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TaskProvider } from "@/contexts/TaskContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Agent Task Dispatcher",
  description: "Manage and dispatch tasks to AI agents with OpenClaw Gateway integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <ThemeProvider>
          <TaskProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </TaskProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
