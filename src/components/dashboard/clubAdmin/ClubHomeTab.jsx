"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Calendar,
  Award,
  TrendingUp,
  Bell,
  Plus,
  Coins,
  Loader2,
  Check,
  X,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function ClubHomeTab({ setActiveTab }) {
  const [club, setClub] = useState({
    name: "Computer Science Club",
    icon: "💡",
    color: "from-blue-600 to-purple-600",
    members: 0,
    pendingRequests: 0,
    totalCoinsAwarded: 0,
    upcomingEvents: 0,
    activeVolunteers: 0,
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/club/stats");
      const data = await res.json();
      if (data.success) {
        setClub(data.club);
        setPendingRequests(data.pendingRequests);
        setRecentActivities(data.recentActivities);
      }
    } catch (err) {
      console.error("Failed to load club stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await fetch("/api/club/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId: requestId, action: "approve" }),
      });
      const data = await res.json();
      if (data.success) {
        loadStats();
      } else {
        alert(data.error || "Failed to accept membership request");
      }
    } catch (err) {
      console.error(err);
      alert("Error approving request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!confirm("Are you sure you want to reject this membership request?"))
      return;
    try {
      const res = await fetch("/api/club/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId: requestId, action: "reject" }),
      });
      const data = await res.json();
      if (data.success) {
        loadStats();
      } else {
        alert(data.error || "Failed to reject membership request");
      }
    } catch (err) {
      console.error(err);
      alert("Error rejecting request");
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500">Loading club details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">{club.icon}</span>
            {club.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Club Dashboard
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
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 bg-gray-100 dark:bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-lg font-bold">
                    {req.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {req.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Requested {req.requestedAt}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    className="py-1! px-3! text-sm! flex items-center gap-1"
                    onClick={() => handleAcceptRequest(req.id)}
                  >
                    <Check className="w-3 h-3" /> Accept
                  </Button>
                  <Button
                    variant="ghost"
                    className="py-1! px-3! text-sm! flex items-center gap-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    onClick={() => handleRejectRequest(req.id)}
                  >
                    <X className="w-3 h-3" /> Reject
                  </Button>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <p className="text-sm text-gray-500 italic py-4 text-center">
                No pending membership requests.
              </p>
            )}
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
            {recentActivities.length === 0 && (
              <p className="text-sm text-gray-500 italic py-4 text-center">
                No recent activity recorded.
              </p>
            )}
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
