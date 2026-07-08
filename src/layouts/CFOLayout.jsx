import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Receipt, CreditCard, TrendingDown,
  Users, ShoppingCart, BarChart3, Calendar, FolderOpen,
  Settings, LogOut, Menu, X, ChevronRight, DollarSign,
  Bell, Search, Moon, Sun,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Dashboard',      path: '/cfo/dashboard',       icon: LayoutDashboard },
  { label: 'Quotations',     path: '/cfo/quotations',      icon: FileText },
  { label: 'Invoices',       path: '/cfo/invoices',        icon: Receipt },
  { label: 'Payments',       path: '/cfo/payments',        icon: CreditCard },
  { label: 'Expenses',       path: '/cfo/expenses',        icon: TrendingDown },
  { label: 'Payroll',        path: '/cfo/payroll',         icon: Users },
  { label: 'Vendors',        path: '/cfo/vendors',         icon: ShoppingCart },
  { label: 'Purchase Orders',path: '/cfo/purchase-orders', icon: ShoppingCart },
  { label: 'Reports',        path: '/cfo/reports',         icon: BarChart3 },
  { label: 'Calendar',       path: '/cfo/calendar',        icon: Calendar },
  { label: 'Documents',      path: '/cfo/documents',       icon: FolderOpen },
  { label: 'Settings',       path: '/cfo/settings',        icon: Settings },
];

export default function CFOLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    logout();
    navigate('/cfo/login');
    toast.success('Logged out');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <p className="font-bold text-white text-sm leading-tight">A5X CRM</p>
              <p className="text-xs text-primary-400 font-medium">Finance</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileSidebar(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              }`
            }
          >
            <item.icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
            <AnimatePresence>
              {(sidebarOpen || mobileSidebar) && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Tooltip for collapsed sidebar */}
            {!sidebarOpen && !mobileSidebar && (
              <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-dark-800 border border-white/10 rounded-lg text-xs font-medium text-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] ${!sidebarOpen ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 68 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-dark-900 border-r border-white/[0.06] flex-shrink-0 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileSidebar(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 bg-dark-900 border-r border-white/[0.06] z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06] bg-dark-900/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileSidebar(true)}
              className="md:hidden p-2 rounded-lg hover:bg-white/[0.06] text-slate-400"
            >
              <Menu size={18} />
            </button>

            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 transition-colors"
            >
              {sidebarOpen ? <ChevronRight size={18} className="rotate-180" /> : <ChevronRight size={18} />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 transition-colors">
              <Bell size={18} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-dark-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
