import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme } from "antd";
import { antdTheme } from "@/styles/antdTheme";
import { buildCssVariables } from "@/styles/cssVariables";
import "@/styles/globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cssVars = buildCssVariables();

export const metadata: Metadata = {
  title: "Mappd",
  description: "Map your skills. Track your mastery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable}`}
      style={cssVars}
    >
      <body>
        <a className="skip-to-content" href="#main-content">
          Skip to content
        </a>
        <AntdRegistry>
          <ConfigProvider theme={{ ...antdTheme, algorithm: theme.darkAlgorithm }}>
            {children}
          </ConfigProvider>
        </AntdRegistry>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
