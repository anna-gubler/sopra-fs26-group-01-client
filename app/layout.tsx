import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Onest } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme } from "antd";
import { antdTheme } from "@/styles/antdTheme";
import { buildCssVariables } from "@/styles/cssVariables";
import "@/styles/globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const onest = Onest({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      className={`${bricolage.variable} ${onest.variable}`}
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
