"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext.jsx";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function UpdatePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState([]);
  const { user, updateSession } = useAuth();
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
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      // Update next-auth session to reflect the updated password status
      await updateSession({ requiresPasswordUpdate: false });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white">
      {/* Stars Background */}
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

      <div className="w-full max-w-md mx-auto flex flex-col justify-center p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="w-16 h-16 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            SECURE YOUR ACCOUNT
          </h1>
          <p className="text-gray-400 text-sm">
            Hello {user?.name || "there"}, you are logging in with a one-time
            temporary password. Please update your password to proceed.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Retype password"
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
              {loading ? "Updating password..." : "Secure Account & Enter"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
