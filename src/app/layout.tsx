import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'OS Playground — Learn by Breaking. Understand by Building.',
  description: 'An interactive Operating System laboratory & simulation platform for students and computer science engineers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090a0f] text-slate-100 antialiased selection:bg-[#9cf944]/30 selection:text-white">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
