import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-sm"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg">
            <BarChart3 size={28} className="text-white" />
          </div>
        </div>

        <p className="text-8xl font-black text-slate-200 dark:text-slate-700 leading-none mb-4 select-none">
          404
        </p>

        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
          Page not found
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
};
