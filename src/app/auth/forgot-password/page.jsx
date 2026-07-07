"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: request OTP, 2: verify and reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newStars = Array.from({ length: 20 }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 3 + 2}s`,
      }));
      setStars(newStars);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to send OTP. Please check your email.",
        );
      }

      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white">
      {/* Stars background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        {stars.map((star, i) => (
          <Star
            key={i}
            className="absolute text-white w-2 h-2"
            style={{
              top: star.top,
              left: star.left,
              animation: `twinkle ${star.animationDuration} infinite`,
            }}
          />
        ))}
      </div>

      {/* Main container */}
      <div className="w-full max-w-md mx-auto flex flex-col justify-center p-8 relative z-10">
        <div className="text-center mb-8">
          <Link href="/">
            <h2 className="text-2xl font-bold bg-linear-to-r from-slate-300 via-purple-400 to-violet-500 bg-clip-text text-transparent mb-6 inline-block">
              UniVerse
            </h2>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            FORGOT PASSWORD
          </h1>
          <p className="text-gray-400 text-sm">
            {!success
              ? step === 1
                ? "Enter your email address and we'll send you an OTP to reset your password."
                : `We've sent a 6-digit OTP to ${email}.`
              : "Password changed successfully."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6"
            >
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]" />
              </div>
              <p className="text-gray-300">
                Your password has been successfully updated. You can now log in
                using your new password.
              </p>
              <div className="pt-4">
                <Link href="/auth/login">
                  <Button className="w-full rounded-full">Go to Login</Button>
                </Link>
              </div>
            </motion.div>
          ) : step === 1 ? (
            <motion.form
              key="step1"
              onSubmit={handleRequestOtp}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-5"
            >
              <Input
                label="Email Address"
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
              />

              {error && (
                <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/20">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full py-3 font-semibold shadow-lg shadow-purple-500/20 transition-all"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP Verification"}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/auth/login"
                  className="text-sm text-purple-400 hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="step2"
              onSubmit={handleResetPassword}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <Input
                label="6-Digit OTP Code"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white text-center font-bold tracking-widest placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
              />

              <Input
                label="New Password"
                type="password"
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
              />

              {error && (
                <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/20">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full py-3 font-semibold shadow-lg shadow-purple-500/20 transition-all"
                disabled={loading}
              >
                {loading ? "Resetting password..." : "Confirm & Reset Password"}
              </Button>

              <div className="text-center pt-2 flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-purple-400 hover:underline"
                >
                  Resend OTP
                </button>
                <Link
                  href="/auth/login"
                  className="text-purple-400 hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
