import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { MessagesSquareIcon, PenSquareIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "게시판",
    template: "%s | 게시판",
  },
  description: "Next.js와 shadcn/ui로 만든 게시판",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-muted/30">
        <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <MessagesSquareIcon className="size-5" />
              게시판
            </Link>
            <Link href="/posts/new" className={buttonVariants({ size: "sm" })}>
              <PenSquareIcon data-icon="inline-start" />
              글쓰기
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t py-6 text-center text-xs text-muted-foreground">
          Built with Next.js · shadcn/ui · TypeScript
        </footer>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
