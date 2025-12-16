"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Chrome, Rocket, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext.jsx";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
// import ThemeToggle from "@/components/ThemeToggle.jsx";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState([]);
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

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
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16 relative z-10">
        <div className="absolute top-6 right-6 lg:left-6 lg:right-auto">
          {/* <ThemeToggle /> */}
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md mx-auto w-full"
        >
          <div className="mb-8">
            <Link href="/">
              <h2 className="text-2xl font-bold bg-linear-to-r from-slate-300 via-purple-400 to-violet-500 bg-clip-text text-transparent mb-6 inline-block">
                UniVerse
              </h2>
            </Link>
            <h1 className="text-4xl font-bold text-white mb-3">WELCOME BACK</h1>
            <p className="text-gray-400">
              Welcome back! Please enter your details to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="sarah.mackwils@gmail.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400">
                <input
                  type="checkbox"
                  className="rounded border-gray-600 bg-white/5 text-purple-500 focus:ring-purple-500/20"
                />
                Remember me
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-purple-400 hover:text-purple-300 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

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
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 mb-4">Or login with</p>
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-white/10 rounded-full hover:bg-white/5 transition-colors text-white"
            >
              <Chrome className="w-5 h-5" />
              <span className="font-medium">Google</span>
            </button>
            <p className="mt-6 text-center text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-purple-400 font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-[#050505] relative overflow-hidden items-center justify-center border-l border-white/5">
        {/* Decorative Circles/Planets */}
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

        {/* Rocket Illustration Placeholder */}
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

        {/* Navigation Links (Visual only as per design) */}
        <div className="absolute top-8 right-12 flex gap-6 text-gray-300 text-sm font-medium">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            About Us
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Services
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Contact Us
          </Link>
          <Link
            href="/auth/signup"
            className="hover:text-white transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
