"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Calendar,
  Users,
  BookOpen,
  Sparkles,
  Award,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
// import ThemeToggle from '@/components/ThemeToggle.jsx';
import Button from "@/components/ui/Button";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.5]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -100]);

  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Generate spiral galaxy stars on next tick to avoid cascading renders
    const timer = setTimeout(() => {
      const generateGalaxy = () => {
        const starCount = 300;
        const arms = 3;
        const armSpread = 0.5; // How spread out the arms are

        return Array.from({ length: starCount }, (_, i) => {
          const distance = Math.random(); // 0 to 1 distance from center
          const angle =
            (i % arms) * ((2 * Math.PI) / arms) + distance * Math.PI * 4; // Spiral angle
          const randomOffset = (Math.random() - 0.5) * armSpread * distance; // Random scatter
          const finalAngle = angle + randomOffset;

          // Convert polar to cartesian, scaled to percentage (50% is center)
          // Using a logarithmic spiral distribution for more realistic look
          const r = Math.pow(distance, 0.8) * 45; // Max radius 45%
          const x = 50 + r * Math.cos(finalAngle);
          const y = 50 + r * Math.sin(finalAngle);

          const size = Math.random() * 2 + (1 - distance) * 2; // Larger stars in center
          const color =
            i % 5 === 0 ? "#a78bfa" : i % 7 === 0 ? "#60a5fa" : "#ffffff"; // Purple, Blue, White

          return {
            id: i,
            left: x,
            top: y,
            size,
            color,
            delay: Math.random() * 2,
            duration: Math.random() * 2 + 2,
          };
        });
      };

      setStars(generateGalaxy());
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Smart Schedule",
      description:
        "Organize your classes, track changes, and never miss an update",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: BookOpen,
      title: "Class Resources",
      description:
        "Access materials, submit assignments, and generate flashcards",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Community & Clubs",
      description: "Join clubs, participate in events, and connect with peers",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Sparkles,
      title: "Live Feed",
      description: "Stay updated with the latest happenings in your college",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Award,
      title: "Rewards System",
      description:
        "Earn coins for participation and redeem for exclusive goodies",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: TrendingUp,
      title: "AI-Powered Tools",
      description: "Smart features to enhance your learning experience",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden selection:bg-purple-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/10 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold bg-linear-to-r from-slate-300 via-purple-400 to-violet-500 bg-clip-text text-transparent"
          >
            UniVerse
          </motion.div>
          <div className="flex items-center gap-4">
            {/* <ThemeToggle /> */}
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="border-white/20 hover:bg-white/10 text-white!"
              >
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-white! text-black! hover:bg-gray-200 border-none">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Galaxy */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden perspective-1000">
        {/* Galaxy Container */}
        <motion.div
          style={{ opacity, scale, y }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative w-[800px] h-[800px] md:w-[1000px] md:h-[1000px]">
            {/* Core Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full blur-[100px] opacity-20 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500 rounded-full blur-[120px] opacity-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full blur-[150px] opacity-10" />

            {/* Rotating Galaxy */}
            <motion.div
              className="w-full h-full relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            >
              {stars.map((star) => (
                <motion.div
                  key={star.id}
                  className="absolute rounded-full"
                  style={{
                    top: `${star.top}%`,
                    left: `${star.left}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    backgroundColor: star.color,
                    boxShadow: `0 0 ${star.size * 2}px ${star.color}`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: star.duration,
                    repeat: Infinity,
                    delay: star.delay,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Content Overlay */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-7xl md:text-9xl font-bold mb-6 tracking-tighter bg-linear-to-b from-white via-white to-white/50 bg-clip-text text-transparent">
              UniVerse
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl mb-10 text-gray-400 max-w-2xl mx-auto font-light"
          >
            Your entire college universe, synchronized.
            <br />
            <span className="text-white/60 text-lg">
              Schedule • Resources • Community • Events
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/auth/signup">
              <Button className="h-14 px-8 text-lg rounded-full bg-white! text-black! hover:bg-gray-200 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="h-14 px-8 text-lg rounded-full border-white/20 hover:bg-white/10 text-white! backdrop-blur-sm"
            >
              Explore Features
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/30 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-linear-to-b from-white/50 to-transparent" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="p-3 text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to streamline your academic and social
              life on campus.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-linear-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />
                <div
                  className={`w-14 h-14 rounded-2xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-based Access Section */}
      <section className="relative py-32 px-6 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Built for Everyone
            </h2>
            <p className="text-xl text-gray-400">
              Tailored experiences for every role in your college ecosystem
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Students",
              "Faculty",
              "Club Admins",
              "Event Organizers",
              "Faculty Admins",
              "College Admin",
            ].map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 hover:bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/5 text-center cursor-pointer transition-all"
              >
                <h3 className="text-xl font-semibold text-gray-200">{role}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-black via-purple-900/20 to-black" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
              Ready to Transform
              <br />
              Your College Life?
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join thousands of students already organizing their campus
              experience with UniVerse.
            </p>
            <Link href="/auth/signup">
              <Button className="h-16 px-10 text-xl rounded-full bg-white! text-black! hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]">
                Start Your Journey
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-sm">
          <p>&copy; 2025 UniVerse. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
