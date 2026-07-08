"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Building,
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
  Pin,
  Mail,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle.jsx";
import Modal from "@/components/ui/Modal";

export default function DashboardLayout({ children, activeTab, setActiveTab }) {
  const { user, logout, userRole, setUserRole } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [notices, setNotices] = useState([]);
  const [showNoticesDropdown, setShowNoticesDropdown] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  useEffect(() => {
    if (user && user.specialRoles && user.specialRoles.length > 0) {
      if (!sessionStorage.getItem("activeRole")) {
        const timer = setTimeout(() => setShowRoleSelector(true), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // On mobile start closed, on desktop start open
      setSidebarOpen(!mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch("/api/admin/notices");
        const data = await res.json();
        if (res.ok) {
          setNotices(data.notices || []);
        }
      } catch (err) {
        console.error("Layout notices fetch error:", err);
      }
    };
    if (user) {
      fetchNotices();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const studentMenuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "schedule", label: "Class Timings", icon: Clock },
    { id: "classes", label: "Classes", icon: BookOpen },
    { id: "feed", label: "Feed", icon: Sparkles },
    { id: "happenings", label: "Happenings", icon: Zap },
    { id: "community", label: "Community", icon: Users },
    { id: "wallet", label: "Wallet", icon: Wallet },
  ];

  const superAdminMenuItems = [
    { id: "super-home", label: "Dashboard", icon: Home },
    { id: "super-requests", label: "Institute Requests", icon: FileText },
  ];

  const collegeAdminMenuItems = [
    { id: "admin-home", label: "Dashboard", icon: Home },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "department-management", label: "Departments", icon: BookOpen },
    { id: "club-management", label: "Clubs", icon: Building },
    { id: "email-broadcast", label: "Email Broadcast", icon: Mail },
    { id: "approvals", label: "Approvals", icon: FileText },
    { id: "user-management", label: "Users Directory", icon: Users },
    { id: "student-import", label: "Student Import", icon: Users },
    { id: "batch-management", label: "Batch Management", icon: BookOpen },
    { id: "faculty-management", label: "Faculty", icon: Users },
    { id: "opportunities", label: "Opportunities", icon: Award },
    { id: "admin-notices", label: "Notices", icon: Bell },
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
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "my-classes", label: "My Classes", icon: BookOpen },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "resources", label: "Resources", icon: FileText },
    { id: "class-notices", label: "Class Notices", icon: Bell },
    { id: "schedule-manager", label: "Schedule Manager", icon: Clock },
  ];

  const deptAdminMenuItems = [
    { id: "dept-home", label: "Dashboard", icon: Home },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "batch-classes", label: "Batch Classes", icon: BookOpen },
    { id: "schedule-upload", label: "Schedule Upload", icon: Calendar },
    { id: "faculty-assign", label: "Faculty Assignment", icon: Users },
    { id: "dept-faculty", label: "Dept. Faculty", icon: Users },
    { id: "dept-notices", label: "Notices", icon: Bell },
  ];

  const getMenuItems = () => {
    switch (userRole) {
      case "super-admin":
        return superAdminMenuItems;
      case "college-admin":
        return collegeAdminMenuItems;
      case "club-admin":
      case "club-advisor":
        return clubAdminMenuItems;
      case "event-organizer":
        return eventOrganizerMenuItems;
      case "faculty":
        return facultyMenuItems;
      case "dept-admin":
        return deptAdminMenuItems;
      default:
        return studentMenuItems;
    }
  };

  const menuItems = getMenuItems();

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Sidebar Framer Motion configurations
  const asideVariants = {
    mobileOpen: { x: 0, width: 256 },
    mobileClosed: { x: -256, width: 256 },
    desktopOpen: { x: 0, width: 256 },
    desktopClosed: { x: 0, width: 80 },
  };

  const getAsideVariant = () => {
    if (isMobile) {
      return sidebarOpen ? "mobileOpen" : "mobileClosed";
    }
    return sidebarOpen ? "desktopOpen" : "desktopClosed";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white pb-16 lg:pb-0">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 z-45">
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 dark:from-slate-300 dark:via-purple-400 dark:to-violet-500 bg-clip-text text-transparent">
              UniVerse
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell with Dropdown Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNoticesDropdown(!showNoticesDropdown)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg relative text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Bell className="w-6 h-6" />
                {notices.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] text-center leading-none">
                    {notices.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNoticesDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                        Notifications
                      </h4>
                      <button
                        onClick={() => {
                          setShowNoticesDropdown(false);
                          if (userRole === "college-admin") {
                            setActiveTab("admin-notices");
                          } else {
                            setActiveTab("feed");
                          }
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        View All
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
                      {notices.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-xs">
                          No active notices.
                        </div>
                      ) : (
                        notices.slice(0, 5).map((n) => (
                          <div
                            key={n._id || n.id}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-white/2 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedNotice(n);
                              setShowNoticeModal(true);
                              setShowNoticesDropdown(false);
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider ${
                                  n.priority === "Urgent"
                                    ? "text-red-400"
                                    : n.priority === "Important"
                                      ? "text-amber-400"
                                      : "text-blue-400"
                                }`}
                              >
                                {n.priority}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {new Date(n.publishedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h5 className="font-bold text-xs text-gray-900 dark:text-white mt-1 line-clamp-1">
                              {n.title}
                            </h5>
                            <p className="text-gray-500 text-[11px] line-clamp-1 mt-0.5">
                              {n.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ThemeToggle />
            {user?.specialRoles && user.specialRoles.length > 0 ? (
              <div className="relative">
                {/* Role Switcher Dropdown */}
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-950/40 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-semibold capitalize">
                    {userRole === "dept-admin"
                      ? "HOD"
                      : userRole === "club-admin"
                        ? "Club Rep"
                        : userRole.replace("-", " ")}
                  </span>
                  <span className="text-xs text-purple-400">
                    &bull; {user?.name}
                  </span>
                </button>

                <AnimatePresence>
                  {showRoleDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100"
                    >
                      <div className="p-3 border-b border-gray-200 dark:border-white/10 text-xs text-gray-500">
                        Switch Workspace
                      </div>
                      <div className="p-1 space-y-1">
                        {/* Primary role option */}
                        {user.primaryRole && (
                          <button
                            onClick={() => {
                              setUserRole(user.primaryRole);
                              setShowRoleDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                              userRole === user.primaryRole
                                ? "bg-purple-100 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                            }`}
                          >
                            {user.primaryRole === "dept-admin"
                              ? "HOD"
                              : user.primaryRole === "club-admin"
                                ? "Club Rep"
                                : user.primaryRole.replace("-", " ")}{" "}
                            (Primary)
                          </button>
                        )}
                        {/* Special roles options */}
                        {user.specialRoles.map((role) => (
                          <button
                            key={role}
                            onClick={() => {
                              setUserRole(role);
                              setShowRoleDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                              userRole === role
                                ? "bg-purple-100 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                            }`}
                          >
                            {role === "dept-admin"
                              ? "HOD"
                              : role === "club-admin"
                                ? "Club Rep"
                                : role.replace("-", " ")}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => handleTabClick("profile")}
                className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                <User className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.name || "User"}
                </span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Backdrop overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden top-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <motion.aside
        initial={isMobile ? "mobileClosed" : "desktopOpen"}
        animate={getAsideVariant()}
        variants={asideVariants}
        transition={{ type: "tween", duration: 0.2 }}
        className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/95 dark:bg-[#050505]/95 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 z-40 overflow-y-auto shadow-xl"
      >
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isCollapsed = !sidebarOpen && !isMobile;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-purple-100 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
                title={isCollapsed ? item.label : ""}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </button>
            );
          })}

          <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-2">
            <button
              onClick={() => handleTabClick("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all ${
                !sidebarOpen && !isMobile ? "justify-center px-0" : ""
              }`}
              title={!sidebarOpen && !isMobile ? "Settings" : ""}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {(sidebarOpen || isMobile) && (
                <span className="font-medium">Settings</span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all ${
                !sidebarOpen && !isMobile ? "justify-center px-0" : ""
              }`}
              title={!sidebarOpen && !isMobile ? "Logout" : ""}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {(sidebarOpen || isMobile) && (
                <span className="font-medium">Logout</span>
              )}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content with padding matching sidebar locked state */}
      <main
        style={{
          paddingLeft: isMobile ? 0 : sidebarOpen ? 256 : 80,
          transition: "padding-left 0.2s ease-out",
        }}
        className="pt-16 pb-24 lg:pb-6"
      >
        <div className="p-6">{children}</div>
      </main>

      {/* PWA Mobile Bottom Navigation Bar (Students only, mobile viewports) */}
      {userRole === "student" && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#050505]/95 border-t border-gray-200 dark:border-white/10 z-50 px-2 py-2 pb-safe backdrop-blur-md shadow-lg">
          <div className="flex justify-around items-center">
            {studentMenuItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                    isActive
                      ? "text-purple-600 dark:text-purple-400 font-semibold scale-105"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Read Notice Modal */}
      <Modal
        isOpen={showNoticeModal}
        onClose={() => setShowNoticeModal(false)}
        title="Campus Announcement"
      >
        {selectedNotice && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-white/10 relative">
              {selectedNotice.pinned && (
                <span className="absolute top-0 right-0 text-purple-400 flex items-center gap-1 text-[10px] uppercase font-bold">
                  <Pin className="w-3.5 h-3.5 fill-purple-400" />
                  <span>Pinned Announcement</span>
                </span>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    selectedNotice.priority === "Urgent"
                      ? "bg-red-500/20 text-red-400"
                      : selectedNotice.priority === "Important"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {selectedNotice.priority}
                </span>
                <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400">
                  Target: {selectedNotice.audience}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 leading-tight">
                {selectedNotice.title}
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {selectedNotice.content}
              </p>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-white/5 p-4 rounded-xl text-xs text-gray-400 border border-white/5">
                <div>
                  <span className="block font-semibold uppercase text-gray-500 mb-0.5">
                    Author Office
                  </span>
                  <span className="text-white font-medium">
                    {selectedNotice.author}
                  </span>
                </div>
                <div>
                  <span className="block font-semibold uppercase text-gray-500 mb-0.5">
                    Publish Date
                  </span>
                  <span className="text-white font-medium">
                    {new Date(selectedNotice.publishedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-end">
              <button
                onClick={() => setShowNoticeModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Workspace / Special Role Selector Overlay Modal */}
      <AnimatePresence>
        {showRoleSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-55 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-2xl p-8 max-w-2xl w-full text-center space-y-6 shadow-2xl relative"
            >
              <div className="space-y-2">
                <div className="w-16 h-16 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome to UniVerse
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You hold multiple workspaces on this account. Which workspace
                  would you like to open today?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto p-1">
                {/* Primary role choice */}
                {user?.primaryRole && (
                  <button
                    onClick={() => {
                      setUserRole(user.primaryRole);
                      setShowRoleSelector(false);
                    }}
                    className="flex flex-col items-center justify-center p-6 border border-gray-200 dark:border-white/5 rounded-2xl bg-gray-50 dark:bg-white/2 hover:border-purple-500 dark:hover:border-purple-500/40 hover:bg-purple-50 dark:hover:bg-purple-950/10 transition-all group text-center space-y-3 cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 group-hover:border-purple-500/35 transition-colors">
                      {user.primaryRole === "student" ? (
                        <Users className="w-6 h-6 text-purple-500" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-purple-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white capitalize group-hover:text-purple-400 transition-colors">
                        {user.primaryRole === "dept-admin"
                          ? "HOD Workspace"
                          : `${user.primaryRole === "club-admin" ? "Club Rep" : user.primaryRole.replace("-", " ")} Workspace`}
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                        Primary Account
                      </p>
                    </div>
                  </button>
                )}

                {/* Special role choices */}
                {user?.specialRoles?.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setUserRole(role);
                      setShowRoleSelector(false);
                    }}
                    className="flex flex-col items-center justify-center p-6 border border-gray-200 dark:border-white/5 rounded-2xl bg-gray-50 dark:bg-white/2 hover:border-purple-500 dark:hover:border-purple-500/40 hover:bg-purple-50 dark:hover:bg-purple-950/10 transition-all group text-center space-y-3 cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 group-hover:border-purple-500/35 transition-colors">
                      {role === "club-admin" && (
                        <Building className="w-6 h-6 text-purple-500" />
                      )}
                      {role === "event-organizer" && (
                        <Sparkles className="w-6 h-6 text-purple-500" />
                      )}
                      {role === "club-advisor" && (
                        <Award className="w-6 h-6 text-purple-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white capitalize group-hover:text-purple-400 transition-colors">
                        {role === "dept-admin"
                          ? "HOD Workspace"
                          : `${role === "club-admin" ? "Club Rep" : role.replace("-", " ")}`}
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                        Special Assignment
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
