"use client";

import { Calendar, BookOpen, TrendingUp, Award, Bell } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function HomeTab({ setActiveTab }) {
  const upcomingClasses = [
    {
      id: 1,
      name: "Computer Networks",
      time: "9:00 AM",
      room: "Room 301",
      status: "upcoming",
    },
    {
      id: 2,
      name: "Data Structures",
      time: "2:00 PM",
      room: "Room 205",
      status: "rescheduled",
    },
  ];

  const recentNotifications = [
    {
      id: 1,
      title: "Assignment Due Tomorrow",
      time: "2 hours ago",
      type: "warning",
    },
    {
      id: 2,
      title: "New Resource Added to Database Systems",
      time: "5 hours ago",
      type: "info",
    },
    {
      id: 3,
      title: "Hackathon Registration Open",
      time: "1 day ago",
      type: "event",
    },
  ];

  const quickStats = [
    {
      label: "Classes Today",
      value: "4",
      icon: BookOpen,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      label: "Pending Assignments",
      value: "2",
      icon: Calendar,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
    {
      label: "Coins Earned",
      value: "450",
      icon: Award,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
    {
      label: "Events Joined",
      value: "12",
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here&apos;s what&apos;s happening with your college life today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <div
                  className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-violet-500 dark:text-violet-400" />
              Today&apos;s Classes
            </h2>
            <Button
              variant="ghost"
              className="!text-sm !py-2 !px-3"
              onClick={() => setActiveTab("schedule")}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingClasses.map((cls) => (
              <div
                key={cls.id}
                className={`p-4 rounded-lg ${
                  cls.status === "rescheduled"
                    ? "bg-yellow-500/10 border border-yellow-500/20"
                    : "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {cls.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {cls.room}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {cls.time}
                    </p>
                    {cls.status === "rescheduled" && (
                      <span className="text-xs text-yellow-400">
                        Rescheduled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-purple-500 dark:text-purple-400" />
              Recent Notifications
            </h2>
            <Button variant="ghost" className="!text-sm !py-2 !px-3">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer border border-gray-200 dark:border-white/5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {notification.time}
                    </p>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === "warning"
                        ? "bg-red-500"
                        : notification.type === "event"
                          ? "bg-green-500"
                          : "bg-blue-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="flex-col !h-auto !py-4"
            onClick={() => setActiveTab("schedule")}
          >
            <Calendar className="w-6 h-6 mb-2" />
            View Schedule
          </Button>
          <Button
            variant="outline"
            className="flex-col !h-auto !py-4"
            onClick={() => setActiveTab("classes")}
          >
            <BookOpen className="w-6 h-6 mb-2" />
            My Classes
          </Button>
          <Button
            variant="outline"
            className="flex-col !h-auto !py-4"
            onClick={() => setActiveTab("feed")}
          >
            <TrendingUp className="w-6 h-6 mb-2" />
            Check Feed
          </Button>
          <Button
            variant="outline"
            className="flex-col !h-auto !py-4"
            onClick={() => setActiveTab("wallet")}
          >
            <Award className="w-6 h-6 mb-2" />
            View Wallet
          </Button>
        </div>
      </Card>
    </div>
  );
}
