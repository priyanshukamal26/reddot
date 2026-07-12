'use client';

import DashboardNavbar from '@/components/DashboardNavbar';
import AuthGuard from '@/components/auth/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireOnboarding={true}>
      <div className="min-h-screen bg-grid text-white relative flex flex-col">
        {/* Dynamic ambient lighting from the top */}
        <div className="pointer-events-none absolute top-[-20%] left-1/2 transform -translate-x-1/2 w-[80%] h-[40%] bg-[rgba(229,29,56,0.1)] blur-[120px] rounded-full" />
        
        <DashboardNavbar />
        
        <main className="flex-grow pt-24 px-6 pb-6 relative z-10">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
