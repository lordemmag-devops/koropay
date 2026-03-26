import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';

function LayoutInner() {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-emerald-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-primary-500/5 rounded-full blur-[100px]" />
      </div>

      <Sidebar />

      <main
        className="min-h-screen relative transition-[margin-left] duration-300"
        style={{ marginLeft: undefined }}
      >
        <div className="p-4 pt-16 md:p-8 md:pt-8" style={{ marginLeft: undefined }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (min-width: 768px) {
          main {
            margin-left: ${collapsed ? '80px' : '288px'} !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function Layout() {
  return (
    <SidebarProvider>
      <LayoutInner />
    </SidebarProvider>
  );
}
