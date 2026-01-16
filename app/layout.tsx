import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '鸡娃 - 教育养成游戏',
  description: '领养和培养孩子，从中学到名校 offer，再到顶尖公司 offer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
