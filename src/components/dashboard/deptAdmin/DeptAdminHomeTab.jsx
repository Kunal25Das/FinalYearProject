"use client";

import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Calendar,
  Bell,
  TrendingUp,
  Clock,
  ArrowRight,
  GraduationCap,
  UserCheck,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function DeptAdminHomeTab({ setActiveTab }) {
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState({
    name: "Loading...",
    code: "",
    totalFaculty: 0,
    totalStudents: 0,
    totalClasses: 0,
    batches: 0,
  });
  const [recentNotices, setRecentNotices] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);

  useEffect(() => {
    async function getStats() {
      try {
        const res = await fetch("/api/dept-admin/stats");
        const data = await res.json();
        if (data.success) {
          setDepartment(data.department);
          setRecentNotices(data.recentNotices);
          setPendingActions(data.pendingActions);
          setTodaySchedule(data.todaySchedule);
        }
      } catch (error) {
        console.error("Failed to load department stats", error);
      } finally {
        setLoading(false);
      }
    }
    getStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Faculty",
      value: department.totalFaculty,
      icon: Users,
      color: "from-blue-600 to-cyan-600",
      change: "Active in department",
    },
    {
      label: "Total Students",
      value: department.totalStudents,
      icon: GraduationCap,
      color: "from-purple-600 to-pink-600",
      change: "Enrolled in department",
    },
    {
      label: "Active Classes",
      value: department.totalClasses,
      icon: BookOpen,
      color: "from-orange-600 to-red-600",
      change: "Across all batches",
    },
    {
      label: "Batches",
      value: department.batches,
      icon: Calendar,
      color: "from-green-600 to-emerald-600",
      change: "Active academic years",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Department Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {department.name} ({department.code})
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setActiveTab("dept-notices")}
          >
            <Bell className="w-4 h-4 mr-2" />
            Issue Notice
          </Button>
          <Button onClick={() => setActiveTab("schedule-upload")}>
            <Calendar className="w-4 h-4 mr-2" />
            Upload Schedule
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-8 -mt-8`}
              />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Actions */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Pending Actions
            </h3>
            <span className="px-2 py-1 bg-orange-500/20 text-orange-500 text-xs font-medium rounded-full">
              {pendingActions.filter((a) => a.urgent).length} Urgent
            </span>
          </div>
          <div className="space-y-3">
            {pendingActions.map((action) => (
              <div
                key={action.id}
                className={`flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-white/5 border ${
                  action.urgent
                    ? "border-orange-500/30"
                    : "border-gray-200 dark:border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  {action.urgent && (
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  )}
                  <span className="text-gray-900 dark:text-white">
                    {action.title}
                  </span>
                </div>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Today&apos;s Schedule
            </h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {todaySchedule.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="text-xs font-medium text-purple-500 w-16 shrink-0">
                  {item.time}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.event}
                  </p>
                  <p className="text-xs text-gray-500">{item.location}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Notices & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Notices */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Notices
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("dept-notices")}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentNotices.map((notice) => (
              <div
                key={notice.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      notice.priority === "high"
                        ? "bg-red-500"
                        : notice.priority === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {notice.title}
                    </p>
                    <p className="text-xs text-gray-500">{notice.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => setActiveTab("batch-classes")}
            >
              <BookOpen className="w-6 h-6" />
              <span className="text-xs">Assign Classes</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => setActiveTab("schedule-upload")}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-xs">Upload Schedule</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => setActiveTab("faculty-assign")}
            >
              <UserCheck className="w-6 h-6" />
              <span className="text-xs">Assign Faculty</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => setActiveTab("dept-faculty")}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs">View Faculty</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
