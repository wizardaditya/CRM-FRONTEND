import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/features/shared/Sidebar';
import { Topbar } from '@/features/shared/Topbar';
import { useSocket } from '@/hooks/useSocket';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useSocket();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 lg:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
