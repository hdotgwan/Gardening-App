import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: "Plot & Petal — Your garden, remembered",
    description: "A thoughtful garden journal, plant care guide, planner and reminder companion.",
    openGraph: {
      title: "Plot & Petal",
      description: "Your garden, remembered.",
      images: [{ url: imageUrl, width: 1728, height: 909, alt: "Plot & Petal garden journal" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Plot & Petal",
      description: "Your garden, remembered.",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
