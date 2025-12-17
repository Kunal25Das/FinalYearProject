"use client";

import {
  Users,
  Calendar,
  Award,
  TrendingUp,
  Bell,
  Plus,
  Coins,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function ClubHomeTab({ setActiveTab, clubData }) {
  const club = clubData || {
    name: "Computer Science Club",
    icon: "🖥️",
    members: 234,
    pendingRequests: 5,
    totalCoinsAwarded: 1250,
    upcomingEvents: 3,
    activeVolunteers: 12,
  };

  const quickStats = [
    {
      label: "Total Members",
      value: club.members,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      label: "Upcoming Events",
      value: club.upcomingEvents,
      icon: Calendar,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      label: "Coins Awarded",
      value: club.totalCoinsAwarded,
      icon: Coins,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
    {
      label: "Active Volunteers",
      value: club.activeVolunteers,
      icon: Award,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      text: "New member joined: John Doe",
      time: "2 hours ago",
      type: "member",
    },
    {
      id: 2,
      text: "Event 'Hackathon 2025' registration opened",
      time: "5 hours ago",
      type: "event",
    },
    {
      id: 3,
      text: "50 coins awarded to volunteer team",
      time: "1 day ago",
      type: "coins",
    },
    {
      id: 4,
      text: "New notice posted: Exam Break Schedule",
      time: "2 days ago",
      type: "notice",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">{club.icon}</span>
            {club.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Club Admin Dashboard
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setActiveTab("events")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
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
        {/* Pending Requests */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-400" />
              Pending Requests
            </h2>
            <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-sm font-medium">
              {club.pendingRequests} new
            </span>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-100 dark:bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Student {i}
                    </p>
                    <p className="text-xs text-gray-500">
                      Requested 2 days ago
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" className="py-1! px-3! text-sm!">
                    Accept
                  </Button>
                  <Button variant="ghost" className="py-1! px-3! text-sm!">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => setActiveTab("members")}
          >
            View All Requests
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
                    activity.type === "member"
                      ? "bg-blue-500"
                      : activity.type === "event"
                        ? "bg-purple-500"
                        : activity.type === "coins"
                          ? "bg-yellow-500"
                          : "bg-green-500"
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
            onClick={() => setActiveTab("events")}
          >
            <Calendar className="w-6 h-6 mb-2" />
            Manage Events
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto! py-4!"
            onClick={() => setActiveTab("members")}
          >
            <Users className="w-6 h-6 mb-2" />
            Manage Members
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto! py-4!"
            onClick={() => setActiveTab("notices")}
          >
            <Bell className="w-6 h-6 mb-2" />
            Post Notice
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto! py-4!"
            onClick={() => setActiveTab("awards")}
          >
            <Coins className="w-6 h-6 mb-2" />
            Award Coins
          </Button>
        </div>
      </Card>
    </div>
  );
}
