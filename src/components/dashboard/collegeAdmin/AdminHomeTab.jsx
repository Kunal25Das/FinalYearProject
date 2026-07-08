"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  Trash2,
  CalendarPlus,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { motion } from "framer-motion";

export default function AdminHomeTab({ setActiveTab }) {
  const [college, setCollege] = useState({
    name: "Loading...",
    code: "...",
    departments: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalClubs: 0,
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState(null);

  // Calendar Management States
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    type: "Academic",
    broadcast: true,
  });
  const [eventSubmitting, setEventSubmitting] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load dashboard statistics");
      }
      setCollege(data.data.college);
      setPendingApprovals(data.data.pendingApprovals);
      setRecentActivities(data.data.recentActivities);
      setUpcomingEvents(data.data.upcomingEvents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarEvents = async () => {
    setCalendarLoading(true);
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      if (res.ok) {
        setCalendarEvents(data.events || []);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setCalendarLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (showCalendarModal) {
      fetchCalendarEvents();
    }
  }, [showCalendarModal]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date) return;

    setEventSubmitting(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule event");

      setEventForm({ title: "", date: "", type: "Academic", broadcast: true });
      fetchCalendarEvents();
      fetchStats(); // Update dashboard calendar list
    } catch (err) {
      alert(err.message);
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to cancel this calendar event?"))
      return;

    try {
      const res = await fetch(`/api/admin/events?id=${eventId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete event");

      fetchCalendarEvents();
      fetchStats(); // Update dashboard calendar list
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApprove = async (requestId) => {
    setActioningId(requestId);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update local state
      setPendingApprovals((prev) =>
        prev.filter((r) => r.id !== requestId && r._id !== requestId),
      );
      fetchStats(); // refresh log/counts
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt("Enter rejection reason:");
    if (reason === null) return; // cancelled
    setActioningId(requestId);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action: "reject",
          rejectReason: reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPendingApprovals((prev) =>
        prev.filter((r) => r.id !== requestId && r._id !== requestId),
      );
      fetchStats(); // refresh log/counts
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) return `${interval} yr ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} mo ago`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval > 1 ? "s" : ""} ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hr ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} min ago`;
    return "just now";
  };

  const quickStats = [
    {
      label: "Total Students",
      value: college.totalStudents,
      icon: GraduationCap,
      color: "from-blue-600 to-indigo-600",
      change: "Enrolled",
    },
    {
      label: "Total Faculty",
      value: college.totalFaculty,
      icon: Users,
      color: "from-purple-600 to-pink-600",
      change: `Across ${college.departments} departments`,
    },
    {
      label: "Active Clubs",
      value: college.totalClubs,
      icon: Building,
      color: "from-orange-600 to-red-600",
      change: "Campus Clubs",
    },
    {
      label: "Departments",
      value: college.departments,
      icon: Building,
      color: "from-green-600 to-emerald-600",
      change: "All active",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500 dark:text-gray-400">
          Loading Dashboard...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="font-bold">Failed to load dashboard statistics</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {college.name}{" "}
            {college.code && college.code !== college.name
              ? `(${college.code})`
              : ""}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-white/10 dark:text-gray-300 hover:text-white"
            onClick={() => setActiveTab("admin-notices")}
          >
            <Bell className="w-4 h-4 mr-2" />
            Post Notice
          </Button>
          <Button
            onClick={() => setActiveTab("approvals")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Approvals ({pendingApprovals.length})
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border border-gray-200 dark:border-white/10 h-full flex flex-col justify-between">
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white mb-4`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-4 border-t border-gray-100 dark:border-white/5 pt-2">
                  {stat.change}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Middle Grid - Approvals & Calendar */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <Card className="lg:col-span-2 border border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Pending Approvals
            </h3>
            <button
              onClick={() => setActiveTab("approvals")}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              View All
            </button>
          </div>

          <div className="space-y-3.5">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                No pending approvals at this time.
              </div>
            ) : (
              pendingApprovals.slice(0, 4).map((item) => (
                <div
                  key={item._id || item.id}
                  className="flex items-center justify-between p-4 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200/50 dark:border-white/5"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {item.requesterName}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Requesting to be:{" "}
                      <span className="text-purple-400 font-medium capitalize">
                        {item.type.replace("-", " ")}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Email: {item.requesterEmail}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-500/20 text-green-500 hover:bg-green-500/10 p-1.5 rounded-lg"
                      onClick={() => handleApprove(item._id || item.id)}
                      disabled={actioningId !== null}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg"
                      onClick={() => handleReject(item._id || item.id)}
                      disabled={actioningId !== null}
                    >
                      <AlertCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Events / Timeline */}
        <Card className="border border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Calendar & Timelines
            </h3>
            <button
              onClick={() => setShowCalendarModal(true)}
              className="p-2 hover:bg-white/5 rounded-lg text-purple-400 hover:text-purple-300 transition-colors"
              title="Manage Calendar Events"
            >
              <CalendarPlus className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                No upcoming events or deadlines scheduled.
              </div>
            ) : (
              upcomingEvents.map((event) => {
                const parts = event.date.split(" ");
                const day = parts[1] ? parts[1].replace(",", "") : "1";
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200/50 dark:border-white/5"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex flex-col items-center justify-center text-purple-700 dark:text-purple-400 font-bold shrink-0">
                      <span className="text-[10px] uppercase font-medium">
                        {parts[0] || "Dec"}
                      </span>
                      <span className="text-base leading-none mt-0.5">
                        {day}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">
                        {event.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {event.type}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                No recent administrative activity logs.
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div
                  key={activity._id || activity.id}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
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
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatTimeAgo(activity.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab("student-import")}
              className="p-4 rounded-xl border border-gray-200 dark:border-white/10 text-left hover:bg-white/5 transition-all space-y-2 group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <p className="font-semibold text-gray-950 dark:text-white text-sm">
                Bulk Import
              </p>
              <p className="text-xs text-gray-500">Register batch students.</p>
            </button>

            <button
              onClick={() => setActiveTab("batch-management")}
              className="p-4 rounded-xl border border-gray-200 dark:border-white/10 text-left hover:bg-white/5 transition-all space-y-2 group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <p className="font-semibold text-gray-950 dark:text-white text-sm">
                Create Batch
              </p>
              <p className="text-xs text-gray-500">Define academic batches.</p>
            </button>

            <button
              onClick={() => setActiveTab("faculty-management")}
              className="p-4 rounded-xl border border-gray-200 dark:border-white/10 text-left hover:bg-white/5 transition-all space-y-2 group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <p className="font-semibold text-gray-950 dark:text-white text-sm">
                Add Faculty
              </p>
              <p className="text-xs text-gray-500">Provision teacher logins.</p>
            </button>

            <button
              onClick={() => setActiveTab("admin-notices")}
              className="p-4 rounded-xl border border-gray-200 dark:border-white/10 text-left hover:bg-white/5 transition-all space-y-2 group"
            >
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <p className="font-semibold text-gray-950 dark:text-white text-sm">
                Broadcast Notice
              </p>
              <p className="text-xs text-gray-500">Publish announcements.</p>
            </button>
          </div>
        </Card>
      </div>

      {/* Calendar Management Modal */}
      <Modal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        title="Manage Campus Calendar Events"
      >
        <div className="space-y-4">
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider">
              Schedule New Event
            </h4>

            <Input
              label="Event / Milestone Title"
              type="text"
              placeholder="e.g. Mid-Term Semester Examinations"
              value={eventForm.title}
              onChange={(e) =>
                setEventForm({ ...eventForm, title: e.target.value })
              }
              required
              className="bg-white/5 text-black dark:border-white/10 dark:text-white placeholder:text-gray-500 focus:border-purple-500"
            />

            <Input
              label="Scheduled Date"
              type="date"
              value={eventForm.date}
              onChange={(e) =>
                setEventForm({ ...eventForm, date: e.target.value })
              }
              required
              className="bg-white/5 text-black dark:border-white/10 dark:text-white focus:border-purple-500"
            />

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={eventForm.broadcast}
                onChange={(e) =>
                  setEventForm({ ...eventForm, broadcast: e.target.checked })
                }
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300 bg-white/10"
              />
              <span>Broadcast announcement as an official notice</span>
            </label>

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={eventSubmitting}
            >
              {eventSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Publish to Calendar"
              )}
            </Button>
          </form>

          <div className="border-t border-gray-200 dark:border-white/10 pt-3 space-y-2">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Scheduled Events
            </h4>
            {calendarLoading ? (
              <div className="py-2 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" />
              </div>
            ) : calendarEvents.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-2">
                No custom events scheduled yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {calendarEvents.map((ev) => (
                  <div
                    key={ev._id}
                    className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{ev.title}</p>
                      <p className="text-gray-400 mt-0.5">
                        {new Date(ev.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(ev._id)}
                      className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-end pt-2">
            <Button variant="ghost" onClick={() => setShowCalendarModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
