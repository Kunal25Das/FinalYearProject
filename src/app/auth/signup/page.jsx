"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Star, CheckCircle } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    adminName: "",
    adminEmail: "",
    password: "",
    confirmPassword: "",
    instituteName: "",
    instituteAddress: "",
    instituteWebsite: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
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
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16 relative z-10 overflow-y-auto max-h-screen">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md mx-auto w-full py-8"
        >
          <div className="mb-6">
            <Link href="/">
              <h2 className="text-2xl font-bold bg-linear-to-r from-slate-300 via-purple-400 to-violet-500 bg-clip-text text-transparent mb-4 inline-block">
                UniVerse
              </h2>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">
              INSTITUTE SETUP
            </h1>
            <p className="text-gray-400 text-sm">
              Register your college or university with the UniVerse platform.
              Your registration is subject to verification.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form
                key="signup-form"
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                    1. Institute Details
                  </h3>
                  <div className="space-y-3">
                    <Input
                      label="Institute Name"
                      type="text"
                      placeholder="e.g. Stanford University"
                      value={formData.instituteName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          instituteName: e.target.value,
                        })
                      }
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                    />

                    <Input
                      label="Institute Address"
                      type="text"
                      placeholder="e.g. Palo Alto, CA, USA"
                      value={formData.instituteAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          instituteAddress: e.target.value,
                        })
                      }
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                    />

                    <Input
                      label="Institute Website"
                      type="url"
                      placeholder="e.g. https://stanford.edu"
                      value={formData.instituteWebsite}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          instituteWebsite: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                    2. Primary Admin Account
                  </h3>
                  <div className="space-y-3">
                    <Input
                      label="Admin Full Name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.adminName}
                      onChange={(e) =>
                        setFormData({ ...formData, adminName: e.target.value })
                      }
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                    />

                    <Input
                      label="Admin Email"
                      type="email"
                      placeholder="admin@college.edu"
                      value={formData.adminEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, adminEmail: e.target.value })
                      }
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                    />

                    <Input
                      label="Password"
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                    />

                    <Input
                      label="Retype Password"
                      type="password"
                      placeholder="Retype Password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/20">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full py-3 font-semibold shadow-lg shadow-purple-500/20 transition-all mt-4"
                  disabled={loading}
                >
                  {loading
                    ? "Submitting setup request..."
                    : "Submit Registration Request"}
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6"
              >
                <div className="flex justify-center">
                  <CheckCircle className="w-20 h-20 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Request Submitted!
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Your request to setup{" "}
                    <strong>{formData.instituteName}</strong> is now pending
                    verification. The platform Super Admin will review your
                    credentials shortly.
                  </p>
                  <p className="text-gray-400 text-sm mt-3">
                    You will receive an email notification once your request is
                    approved.
                  </p>
                </div>
                <div className="pt-4">
                  <Link href="/auth/login">
                    <Button variant="secondary" className="rounded-full w-full">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <p className="mt-6 text-center text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-purple-400 font-medium hover:underline"
              >
                Login
              </Link>
            </p>
          )}
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-[#050505] relative overflow-hidden items-center justify-center border-l border-white/5">
        <div className="absolute top-20 left-20 w-24 h-24 bg-purple-500 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-indigo-600 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>

        {/* Stars */}
        <div className="absolute inset-0 opacity-30">
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

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <div className="relative w-80 h-80 flex items-center justify-center">
            <Rocket
              className="w-64 h-64 text-white transform -rotate-45 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              strokeWidth={1}
            />
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-orange-500 rounded-full blur-3xl opacity-30"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
