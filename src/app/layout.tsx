import type { Metadata } from "next";
import { Baloo_2, Quicksand, ZCOOL_KuaiLe } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["vietnamese", "latin"],
  weight: ["500", "600", "700", "800"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
});

const kuaiLe = ZCOOL_KuaiLe({
  variable: "--font-kuai",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Nhật ký Hán ngữ – Lộ trình tiếng Trung: HSK 3.0 · YCT · Boya · Giáo trình Hán ngữ",
  description:
    "Lộ trình học tiếng Trung rõ ràng theo chuẩn HSK 3.0 (9 cấp độ), YCT cho thiếu nhi, giáo trình Boya Chinese và Giáo trình Hán ngữ 6 quyển.",
  keywords: [
    "học tiếng Trung",
    "HSK 3.0",
    "YCT",
    "Boya Chinese",
    "Giáo trình Hán ngữ",
    "lộ trình HSK",
  ],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${baloo.variable} ${quicksand.variable} ${kuaiLe.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
