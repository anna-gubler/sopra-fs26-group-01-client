import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@/styles/globals.css";

// Geist fonts exposed as CSS variables, applied via className on <body>
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mappd",
  description: "Mappd — SoPra FS26 Group 01",
};

// root layout: wraps every page in the Ant Design theme and registry
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* ConfigProvider applies the Catppuccin Mocha theme globally to all Ant Design components */}
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: "#cba6f7",   // mauve
              borderRadius: 8,
              colorText: "#cdd6f4",      // text
              fontSize: 16,
              colorBgContainer: "#1e1e2e", // base
            },
            components: {
              Button: {
                colorPrimary: "#cba6f7",
                algorithm: true,
                controlHeight: 38,
              },
              Input: {
                colorBorder: "#585b70",          // surface2
                colorTextPlaceholder: "#a6adc8", // subtext0
                algorithm: false,
              },
              Form: {
                labelColor: "#cdd6f4",
                algorithm: theme.defaultAlgorithm,
              },
              Card: {
                colorBgContainer: "#181825", // mantle
              },
              Table: {
                headerBg: "#181825",          // mantle
                headerColor: "#cdd6f4",       // text
                rowHoverBg: "#313244",        // surface0
                colorBgContainer: "#1e1e2e", // base
                colorText: "#cdd6f4",         // text
                borderColor: "#45475a",       // surface1
              },
              Pagination: {
                colorPrimary: "#cba6f7",     // mauve
                colorBgContainer: "#181825", // mantle
              },
            },
          }}
        >
          {/* AntdRegistry prevents style flicker on first render in Next.js App Router */}
          <AntdRegistry>
            <AntdApp>{children}</AntdApp>
          </AntdRegistry>
        </ConfigProvider>
      </body>
    </html>
  );
}
