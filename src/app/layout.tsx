import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'PipelineIQ — Sales Intelligence',
  description: 'AI-powered sales pipeline management with Google Sheets integration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-56 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
