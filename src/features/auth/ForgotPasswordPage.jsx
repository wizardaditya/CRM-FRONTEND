import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Send, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '@/services/authService';
import { Button } from '@/components/ui/Button';

export const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '' } });

  const onSubmit = async ({ email }) => {
    try {
      await authService.forgotPassword({ email });
      setSubmittedEmail(email);
      setSubmitted(true);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(msg);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Check your inbox</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
          We sent a password reset link to
        </p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-6">{submittedEmail}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
          Didn't receive it? Check your spam folder or try again.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Forgot password?</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Email Address</label>
          <input
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            className={`input-base ${errors.email ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500' : ''}`}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
            })}
          />
          {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
        </div>

        <Button type="submit" className="w-full justify-center py-2.5" loading={isSubmitting}>
          <Send size={15} />
          Send reset link
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>
    </div>
  );
};
