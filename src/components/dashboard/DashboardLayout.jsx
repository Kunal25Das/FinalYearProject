"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  BookOpen,
  Users,
  Sparkles,
  LogOut,
  User,
  Wallet,
  Bell,
  Menu,
  X,
  Home,
  Settings,
  Zap,
  Award,
  Coins,
  FileText,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle.jsx";

export default function DashboardLayout({ children, activeTab, setActiveTab }) {
  const { user, logout, userRole } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const studentMenuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "classes", label: "Classes", icon: BookOpen },
    { id: "feed", label: "Feed", icon: Sparkles },
    { id: "happenings", label: "Happenings", icon: Zap },
    { id: "community", label: "Community", icon: Users },
    { id: "wallet", label: "Wallet", icon: Wallet },
  ];

  const clubAdminMenuItems = [
    { id: "club-home", label: "Dashboard", icon: Home },
    { id: "events", label: "Events", icon: Calendar },
    { id: "members", label: "Members", icon: Users },
    { id: "notices", label: "Notices", icon: Bell },
    { id: "awards", label: "Awards & Coins", icon: Coins },
  ];

  const eventOrganizerMenuItems = [
    { id: "organizer-home", label: "Dashboard", icon: Home },
    { id: "my-events", label: "My Events", icon: Calendar },
    { id: "registrations", label: "Registrations", icon: Users },
    { id: "volunteers", label: "Volunteers", icon: Award },
    { id: "award-coins", label: "Award Coins", icon: Coins },
  ];

  const facultyMenuItems = [
    { id: "faculty-home", label: "Dashboard", icon: Home },
    { id: "my-classes", label: "My Classes", icon: BookOpen },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "resources", label: "Resources", icon: FileText },
    { id: "class-notices", label: "Class Notices", icon: Bell },
    { id: "schedule-manager", label: "Schedule Manager", icon: Clock },
  ];

  const getMenuItems = () => {
    switch (userRole) {
      case "club-admin":
        return clubAdminMenuItems;
      case "event-organizer":
        return eventOrganizerMenuItems;
      case "faculty":
        return facultyMenuItems;
      default:
        return studentMenuItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <h1 className="text-2xl font-bold bg-linear-to-r from-violet-600 via-purple-600 to-indigo-600 dark:from-slate-300 dark:via-purple-400 dark:to-violet-500 bg-clip-text text-transparent">
              UniVerse
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg relative text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full" />
            </button>
            <ThemeToggle />
            <button
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              <User className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.name || "User"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: 0 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-70 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 z-30 overflow-y-auto"
      >
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-purple-100 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-2">
            <button
              onClick={() => setActiveTab("settings")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? "ml-70" : "ml-0"
        }`}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
