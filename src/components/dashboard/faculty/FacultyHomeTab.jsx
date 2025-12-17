"use client";

import {
  BookOpen,
  Users,
  Bell,
  Calendar,
  FileText,
  Clock,
  TrendingUp,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function FacultyHomeTab({ setActiveTab }) {
  const facultyData = {
    name: "Dr. Test Faculty",
    department: "Computer Science",
    totalClasses: 5,
    totalStudents: 187,
    upcomingClasses: 3,
    pendingNotices: 2,
  };

  const quickStats = [
    {
      label: "My Classes",
      value: facultyData.totalClasses,
      icon: BookOpen,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      label: "Total Students",
      value: facultyData.totalStudents,
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      label: "Today's Classes",
      value: facultyData.upcomingClasses,
      icon: Calendar,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      label: "Active Notices",
      value: facultyData.pendingNotices,
      icon: Bell,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
  ];

  const todaysSchedule = [
    {
      id: 1,
      subject: "Data Structures",
      batch: "CS-A 2024",
      time: "9:00 AM - 10:00 AM",
      room: "Room 301",
      status: "completed",
    },
    {
      id: 2,
      subject: "Algorithm Design",
      batch: "CS-B 2024",
      time: "11:00 AM - 12:00 PM",
      room: "Room 205",
      status: "ongoing",
    },
    {
      id: 3,
      subject: "Database Systems",
      batch: "CS-A 2023",
      time: "2:00 PM - 3:00 PM",
      room: "Lab 102",
      status: "upcoming",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      text: "Shared lecture notes for Data Structures",
      time: "2 hours ago",
      type: "resource",
    },
    {
      id: 2,
      text: "Posted notice: Assignment deadline extended",
      time: "1 day ago",
      type: "notice",
    },
    {
      id: 3,
      text: "Cancelled class: Algorithm Design (Dec 20)",
      time: "2 days ago",
      type: "cancel",
    },
    {
      id: 4,
      text: "Uploaded quiz materials for Database Systems",
      time: "3 days ago",
      type: "resource",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-gray-500/20 text-gray-600 dark:text-gray-400";
      case "ongoing":
        return "bg-green-500/20 text-green-600 dark:text-green-400";
      case "upcoming":
        return "bg-blue-500/20 text-blue-600 dark:text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {facultyData.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {facultyData.department} Department
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setActiveTab("class-notices")}
          >
            <Bell className="w-4 h-4 mr-2" />
            Post Notice
          </Button>
          <Button onClick={() => setActiveTab("my-classes")}>
            <BookOpen className="w-4 h-4 mr-2" />
            My Classes
          </Button>
        </div>
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
              <Clock className="w-5 h-5 text-blue-400" />
              Today&apos;s Schedule
            </h2>
          </div>
          <div className="space-y-3">
            {todaysSchedule.map((cls) => (
              <div
                key={cls.id}
                className="p-3 bg-gray-100 dark:bg-white/5 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {cls.subject}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(cls.status)}`}
                  >
                    {cls.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{cls.batch}</span>
                  <span>{cls.time}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{cls.room}</p>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => setActiveTab("my-classes")}
          >
            View Full Schedule
          </Button>
        </Card>

        {/* Recent Activity */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-gray-100 dark:bg-white/5 rounded-lg"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "resource"
                      ? "bg-blue-500"
                      : activity.type === "notice"
                        ? "bg-orange-500"
                        : "bg-red-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white text-sm">
                    {activity.text}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
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
            className="flex-col h-auto! py-4!"
            onClick={() => setActiveTab("my-classes")}
          >
            <BookOpen className="w-6 h-6 mb-2" />
            View Classes
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto! py-4!"
            onClick={() => setActiveTab("resources")}
          >
            <FileText className="w-6 h-6 mb-2" />
            Share Resources
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto! py-4!"
            onClick={() => setActiveTab("class-notices")}
          >
            <Bell className="w-6 h-6 mb-2" />
            Post Notice
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto! py-4!"
            onClick={() => setActiveTab("schedule-manager")}
          >
            <Calendar className="w-6 h-6 mb-2" />
            Manage Schedule
          </Button>
        </div>
      </Card>
    </div>
  );
}
