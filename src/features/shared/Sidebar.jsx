import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserCheck, Kanban,
  CheckSquare, Phone, Calendar, Bell, Settings, X, BarChart3,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { APP_NAME } from '@/constants';
import { Avatar } from '@/components/ui/Avatar';

const NAV_ITEMS = [
  { label: 'Dashboard',     path: '/dashboard',      icon: LayoutDashboard },
  { label: 'Leads',         path: '/leads',           icon: Users },
  { label: 'Contacts',      path: '/contacts',        icon: UserCheck },
  { label: 'Pipeline',      path: '/pipeline',        icon: Kanban },
  { label: 'Tasks',         path: '/tasks',           icon: CheckSquare },
  { label: 'Follow-ups',    path: '/followups',       icon: Phone },
  { label: 'Calendar',      path: '/calendar',        icon: Calendar },
  { label: 'Notifications', path: '/notifications',   icon: Bell },
  { label: 'Settings',      path: '/settings',        icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
            <BarChart3 size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
            {APP_NAME}
          </span>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
          return (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User info at bottom */}
      {user && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-4 flex-shrink-0">
          <div className="flex items-center gap-3 px-2">
            <Avatar name={user.name || 'User'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {user.name}
              </p>
              <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 text-[10px] font-bold rounded">
                {user.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar — overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
