"use client";

import { useState } from "react";
import {
  Users,
  GraduationCap,
  Building,
  Calendar,
  Bell,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function AdminHomeTab({ setActiveTab }) {
  const [college] = useState({
    name: "University Institute of Technology",
    code: "UIT",
    departments: 8,
    totalStudents: 4500,
    totalFaculty: 280,
    totalClubs: 24,
  });

  const stats = [
    {
      label: "Total Students",
      value: college.totalStudents.toLocaleString(),
      icon: GraduationCap,
      color: "from-blue-600 to-cyan-600",
      change: "+120 this semester",
    },
    {
      label: "Total Faculty",
      value: college.totalFaculty,
      icon: Users,
      color: "from-purple-600 to-pink-600",
      change: "Across 8 departments",
    },
    {
      label: "Active Clubs",
      value: college.totalClubs,
      icon: Building,
      color: "from-orange-600 to-red-600",
      change: "3 pending approval",
    },
    {
      label: "Departments",
      value: college.departments,
      icon: Building,
      color: "from-green-600 to-emerald-600",
      change: "All active",
    },
  ];

  const pendingApprovals = [
    {
      id: 1,
      type: "Club Admin",
      name: "Robotics Club",
      requestedBy: "John Doe",
      date: "Dec 17, 2025",
      urgent: true,
    },
    {
      id: 2,
      type: "Event Organizer",
      name: "TechFest 2026",
      requestedBy: "Sarah Wilson",
      date: "Dec 16, 2025",
      urgent: true,
    },
    {
      id: 3,
      type: "Club Admin",
      name: "Photography Club",
      requestedBy: "Mike Chen",
      date: "Dec 15, 2025",
      urgent: false,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: "New batch created",
      details: "CSE Batch 2025",
      time: "2 hours ago",
      type: "batch",
    },
    {
      id: 2,
      action: "Faculty account created",
      details: "Dr. Lisa Park - CSE",
      time: "5 hours ago",
      type: "faculty",
    },
    {
      id: 3,
      action: "Club approved",
      details: "AI Research Club",
      time: "1 day ago",
      type: "approval",
    },
    {
      id: 4,
      action: "Notice published",
      details: "Winter Break Schedule",
      time: "1 day ago",
      type: "notice",
    },
    {
      id: 5,
      action: "Students imported",
      details: "120 students - ECE 2025",
      time: "2 days ago",
      type: "import",
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      name: "Semester End Exams",
      date: "Dec 20, 2025",
      type: "Academic",
    },
    { id: 2, name: "Annual Day", date: "Jan 15, 2026", type: "Cultural" },
    { id: 3, name: "Placement Drive", date: "Jan 20, 2026", type: "Career" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {college.name} ({college.code})
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setActiveTab("admin-notices")}
          >
            <Bell className="w-4 h-4 mr-2" />
            Post Notice
          </Button>
          <Button onClick={() => setActiveTab("approvals")}>
            <ShieldCheck className="w-4 h-4 mr-2" />
            Approvals ({pendingApprovals.length})
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
                className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br ${stat.color} opacity-10 rounded-full -mr-8 -mt-8`}
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
                <div className={`p-3 rounded-xl bg-linear-to-br ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Pending Approvals
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("approvals")}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {pendingApprovals.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-white/5 border ${
                  item.urgent
                    ? "border-orange-500/30"
                    : "border-gray-200 dark:border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.urgent && (
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-500 text-xs rounded-full">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Requested by {item.requestedBy} • {item.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-green-500">
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500">
                    <AlertCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Upcoming Events
            </h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 bg-gray-100 dark:bg-white/5 rounded-lg"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500 text-xs font-bold">
                  {event.date.split(" ")[1].replace(",", "")}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {event.name}
                  </p>
                  <p className="text-xs text-gray-500">{event.type}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.type === "approval"
                      ? "bg-green-500"
                      : activity.type === "batch"
                        ? "bg-blue-500"
                        : activity.type === "faculty"
                          ? "bg-purple-500"
                          : activity.type === "notice"
                            ? "bg-yellow-500"
                            : "bg-orange-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.details}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
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
              onClick={() => setActiveTab("student-import")}
            >
              <GraduationCap className="w-6 h-6" />
              <span className="text-xs">Import Students</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => setActiveTab("batch-management")}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs">Manage Batches</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => setActiveTab("faculty-management")}
            >
              <Building className="w-6 h-6" />
              <span className="text-xs">Add Faculty</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => setActiveTab("opportunities")}
            >
              <Briefcase className="w-6 h-6" />
              <span className="text-xs">Post Opportunity</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
