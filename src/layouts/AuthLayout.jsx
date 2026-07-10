import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Users, TrendingUp, Bell } from 'lucide-react';
import { APP_NAME } from '@/constants';

const features = [
  { icon: Users,      text: 'Manage leads & contacts effortlessly' },
  { icon: TrendingUp, text: 'Track your sales pipeline in real-time' },
  { icon: BarChart3,  text: 'Insights with rich analytics dashboards' },
  { icon: Bell,       text: 'Smart follow-up reminders & notifications' },
];

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full" />
          <div className="absolute bottom-10 -left-20 w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.03] rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <BarChart3 size={22} className="text-white" />
            </div>
            <span className="text-white font-extrabold text-xl tracking-tight">{APP_NAME}</span>
          </div>
          <p className="text-blue-200 text-sm">Sales Intelligence Platform</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10"
        >
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
            Close more deals,<br />
            <span className="text-blue-200">faster.</span>
          </h1>
          <p className="text-blue-200/80 text-sm mb-8 max-w-xs leading-relaxed">
            Your all-in-one CRM platform for managing leads, tracking pipelines, and growing your business.
          </p>
          <ul className="space-y-3">
            {features.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 text-white/90 text-sm"
              >
                <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={14} />
                </div>
                {text}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <div className="relative z-10 text-blue-200/60 text-xs">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <BarChart3 size={18} className="text-white" />
            </div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">{APP_NAME}</span>
          </div>
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};
