"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  BookOpen,
  TrendingUp,
  Award,
  Bell,
  Briefcase,
  Loader2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext.jsx";

export default function HomeTab({ setActiveTab }) {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [noticesRes, oppsRes] = await Promise.all([
          fetch("/api/admin/notices"),
          fetch("/api/admin/opportunities"),
        ]);
        const noticesData = await noticesRes.json();
        const oppsData = await oppsRes.json();

        if (noticesRes.ok) setNotices(noticesData.notices || []);
        if (oppsRes.ok) setOpportunities(oppsData.opportunities || []);
      } catch (err) {
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 86400);

    if (interval >= 1) return `${interval} day${interval > 1 ? "s" : ""} ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hr${interval > 1 ? "s" : ""} ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} min${interval > 1 ? "s" : ""} ago`;
    return "just now";
  };

  const quickStats = [
    {
      label: "Official Notices",
      value: notices.length.toString(),
      icon: Bell,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      label: "Active Placements",
      value: opportunities
        .filter((o) => o.type === "Placement")
        .length.toString(),
      icon: Briefcase,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
    {
      label: "Internships Open",
      value: opportunities
        .filter((o) => o.type === "Internship")
        .length.toString(),
      icon: Award,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
    {
      label: "Other Drives",
      value: opportunities
        .filter((o) => o.type !== "Placement" && o.type !== "Internship")
        .length.toString(),
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500">Loading your student dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back, {user?.name || "Student"}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here is what is happening with your college campus connect today.
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
              <Card className="border border-gray-200 dark:border-white/10">
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
        {/* Campus Announcements Notices */}
        <Card className="border border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-purple-500" />
              Official Notices
            </h2>
            <Button
              variant="ghost"
              className="!text-sm !py-2 !px-3 text-purple-400 hover:text-purple-300"
              onClick={() => setActiveTab("feed")}
            >
              View Feed
            </Button>
          </div>
          <div className="space-y-3">
            {notices.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No official notices published yet.
              </div>
            ) : (
              notices.slice(0, 4).map((notice) => (
                <div
                  key={notice._id || notice.id}
                  className="p-4 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => setActiveTab("feed")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                          {notice.priority}
                        </span>
                        {notice.pinned && (
                          <span className="text-[9px] uppercase bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                            Pinned
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white mt-1">
                        {notice.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        By {notice.author} • {formatTimeAgo(notice.publishedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Placements & Placements timelines */}
        <Card className="border border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-violet-500" />
              Career & Placements
            </h2>
            <Button
              variant="ghost"
              className="!text-sm !py-2 !px-3 text-purple-400 hover:text-purple-300"
              onClick={() => setActiveTab("happenings")}
            >
              View Drives
            </Button>
          </div>
          <div className="space-y-3">
            {opportunities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No recruitment or internship drives active.
              </div>
            ) : (
              opportunities.slice(0, 4).map((opp) => (
                <div
                  key={opp._id || opp.id}
                  className="p-4 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => setActiveTab("happenings")}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {opp.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {opp.company} • {opp.location}
                      </p>
                      <p className="text-xs text-gray-500 mt-1.5 font-semibold text-purple-400">
                        Deadline: {new Date(opp.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded font-bold uppercase">
                      {opp.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border border-gray-200 dark:border-white/10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Navigation
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="flex-col !h-auto !py-4 border-white/5 bg-white/5 hover:bg-white/10"
            onClick={() => setActiveTab("schedule")}
          >
            <Calendar className="w-6 h-6 mb-2 text-blue-400" />
            <span className="text-sm font-semibold">View Schedule</span>
          </Button>
          <Button
            variant="outline"
            className="flex-col !h-auto !py-4 border-white/5 bg-white/5 hover:bg-white/10"
            onClick={() => setActiveTab("classes")}
          >
            <BookOpen className="w-6 h-6 mb-2 text-emerald-400" />
            <span className="text-sm font-semibold">My Classes</span>
          </Button>
          <Button
            variant="outline"
            className="flex-col !h-auto !py-4 border-white/5 bg-white/5 hover:bg-white/10"
            onClick={() => setActiveTab("feed")}
          >
            <TrendingUp className="w-6 h-6 mb-2 text-purple-400" />
            <span className="text-sm font-semibold">Check Feed</span>
          </Button>
          <Button
            variant="outline"
            className="flex-col !h-auto !py-4 border-white/5 bg-white/5 hover:bg-white/10"
            onClick={() => setActiveTab("wallet")}
          >
            <Award className="w-6 h-6 mb-2 text-yellow-400" />
            <span className="text-sm font-semibold">View Wallet</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
