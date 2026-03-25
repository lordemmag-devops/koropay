import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-surface-950">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-emerald-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-primary-500/5 rounded-full blur-[100px]" />
      </div>

      <Sidebar />

      <main className="ml-72 min-h-screen relative">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
