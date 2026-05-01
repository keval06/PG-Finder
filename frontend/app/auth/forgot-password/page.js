"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Key,
  Lock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { authApi } from "../../../lib/api/auth";
import StepperBar from "../../pg/[id]/book/components/StepperBar"; // Reusing your component

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: Email, 1: OTP, 2: New Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const steps = ["Email", "Verify", "Reset"];

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword(email);
      setStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await authApi.verifyOtp(email, otp);
      setResetToken(data.resetToken);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword(resetToken, newPassword);
      setStep(3); // Success state
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputContainerClass =
    "relative flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-rose-400 transition-all duration-200 shadow-sm";
  const iconClass = "absolute left-4 text-gray-400 pointer-events-none";
  const inputClass =
    "w-full bg-transparent pl-11 pr-4 py-3.5 text-sm outline-none placeholder:text-gray-400 font-medium";
  const btnClass =
    "w-full bg-[#FF385C] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#E31C5F] active:scale-[0.98] transition-all shadow-md shadow-rose-100 disabled:opacity-50 mt-2";

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="bg-white w-full max-w-[440px] rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden">
        {/* Top Branding Section (Matches Email Design) */}
        <div className="bg-[#FF385C] p-8 text-center text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck size={120} />
          </div>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Security Center</h1>
          <p className="text-rose-100 text-xs mt-1 font-medium uppercase tracking-widest">
            QuickPG Authentication
          </p>
        </div>

        <div className="p-8 sm:p-10 flex flex-col gap-8">
          {/* Stepper Integration */}
          {step < 3 && <StepperBar steps={steps} currentStep={step} />}

          {/* Instruction Text */}
          {step < 3 && (
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">
                {step === 0 && "Forgot Password?"}
                {step === 1 && "Check your inbox"}
                {step === 2 && "Create new password"}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                {step === 0 &&
                  "Don't worry! Enter your email and we'll send you an OTP to reset your password."}
                {step === 1 &&
                  `We sent a 4-digit verification code to ${email}. Please enter it below.`}
                {step === 2 &&
                  "Almost there! Choose a strong password that you haven't used before."}
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Steps Forms */}
          <div className="min-h-[140px]">
            {step === 0 && (
              <form
                onSubmit={handleRequestOtp}
                className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4"
              >
                <div className={inputContainerClass}>
                  <Mail size={18} className={iconClass} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className={inputClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className={btnClass}>
                  {loading ? "Sending..." : "Send Reset Code"}
                </button>
              </form>
            )}

            {step === 1 && (
              <form
                onSubmit={handleVerifyOtp}
                className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4"
              >
                <div className={inputContainerClass}>
                  <Key size={18} className={iconClass} />
                  <input
                    type="text"
                    placeholder="4-Digit OTP"
                    maxLength={4}
                    className={`${inputClass} tracking-[0.5em] text-center pr-11 font-bold text-lg`}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className={btnClass}>
                  {loading ? "Verifying..." : "Verify & Continue"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form
                onSubmit={handleResetPassword}
                className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4"
              >
                <div className={inputContainerClass}>
                  <Lock size={18} className={iconClass} />
                  <input
                    type="password"
                    placeholder="New Password"
                    className={inputClass}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className={btnClass}>
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center gap-6 py-4 animate-in zoom-in-95 duration-500 text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Password Reset!
                  </h2>
                  <p className="text-sm text-gray-500">
                    Your security is updated. Redirecting you to login in a few
                    seconds...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {step < 3 && (
            <div className="pt-2 border-t border-gray-100 mt-2">
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-rose-500 transition-colors font-medium group"
              >
                <ArrowLeft
                  size={16}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
