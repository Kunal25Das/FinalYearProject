"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  X,
  AlertTriangle,
  CheckCircle,
  History,
  Send,
  BookOpen,
  Users,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function ScheduleManagerTab() {
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [actionType, setActionType] = useState("cancel");
  const [reason, setReason] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [filter, setFilter] = useState("upcoming");

  const [schedules, setSchedules] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadSchedules() {
    try {
      const res = await fetch("/api/faculty/schedules");
      const data = await res.json();
      if (data.success) {
        setSchedules(data.schedules);
        setHistory(data.history);
      }
    } catch (err) {
      console.error("Error loading schedules:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchedules();
  }, []);

  const filteredSchedules = schedules.filter((schedule) => {
    if (filter === "upcoming") return schedule.status === "scheduled";
    if (filter === "cancelled") return schedule.status === "cancelled";
    if (filter === "rescheduled") return schedule.status === "rescheduled";
    return true;
  });

  const handleOpenAction = (schedule) => {
    setSelectedSchedule(schedule);
    setShowActionModal(true);
    setActionType("cancel");
    setReason("");
    setNewDate("");
    setNewTime("");
  };

  const handleSubmitAction = async () => {
    if (selectedSchedule && reason) {
      try {
        const res = await fetch("/api/faculty/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId: selectedSchedule.classId,
            actionType,
            date: selectedSchedule.date,
            originalTime: selectedSchedule.time,
            newDate: actionType === "reschedule" ? newDate : null,
            newTime: actionType === "reschedule" ? newTime : null,
            reason,
          }),
        });
        const data = await res.json();
        if (data.success) {
          alert(data.message || "Schedule action completed successfully!");
          await loadSchedules();
          setShowActionModal(false);
          setSelectedSchedule(null);
        } else {
          alert(data.error || "Failed to complete schedule action");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred while submitting schedule action");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Scheduled
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
            <X className="w-3 h-3" /> Cancelled
          </span>
        );
      case "rescheduled":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full text-xs font-medium">
            <AlertTriangle className="w-3 h-3" /> Rescheduled
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Schedule Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage class cancellations and reschedules
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {schedules.filter((s) => s.status === "scheduled").length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upcoming Classes
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {schedules.filter((s) => s.status === "cancelled").length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {schedules.filter((s) => s.status === "rescheduled").length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Rescheduled
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {Array.from(
              new Set(schedules.map((s) => s.rawBatch || s.batch)),
            ).reduce((sum, batchKey) => {
              const match = schedules.find(
                (s) => (s.rawBatch || s.batch) === batchKey,
              );
              return sum + (match ? match.students : 0);
            }, 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Students
          </p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { id: "upcoming", label: "Upcoming" },
          { id: "cancelled", label: "Cancelled" },
          { id: "rescheduled", label: "Rescheduled" },
          { id: "all", label: "All" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === tab.id
                ? "bg-purple-600 text-white"
                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Schedule List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredSchedules.map((schedule, index) => (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={schedule.status !== "scheduled" ? "opacity-75" : ""}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-2 h-full min-h-20 rounded-full bg-linear-to-b ${schedule.color}`}
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {schedule.subject}
                        </h3>
                        {getStatusBadge(schedule.status)}
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {schedule.batch}
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {schedule.date} ({schedule.day})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {schedule.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {schedule.room}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {schedule.students} students
                        </span>
                      </div>

                      {schedule.status === "cancelled" &&
                        schedule.cancelReason && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            Reason: {schedule.cancelReason}
                          </p>
                        )}

                      {schedule.status === "rescheduled" && (
                        <p className="mt-2 text-sm text-orange-600 dark:text-orange-400 flex items-center gap-1">
                          <History className="w-4 h-4" />
                          Rescheduled from {schedule.originalDate} •{" "}
                          {schedule.rescheduleReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {schedule.status === "scheduled" && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                        onClick={() => {
                          handleOpenAction(schedule);
                          setActionType("reschedule");
                        }}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Reschedule
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-500/10"
                        onClick={() => handleOpenAction(schedule)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredSchedules.length === 0 && (
          <Card className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No classes found for this filter
            </p>
          </Card>
        )}
      </div>

      {/* History Section */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-purple-500" />
          Recent Actions History
        </h3>
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-100 dark:bg-white/5 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    item.action === "Cancelled"
                      ? "bg-red-500/20"
                      : "bg-orange-500/20"
                  }`}
                >
                  {item.action === "Cancelled" ? (
                    <X className="w-5 h-5 text-red-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-orange-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.action}: {item.subject}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.date} • {item.reason}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Notified on {item.notifiedAt}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={actionType === "cancel" ? "Cancel Class" : "Reschedule Class"}
      >
        {selectedSchedule && (
          <div className="space-y-4">
            {/* Class Info */}
            <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {selectedSchedule.subject}
              </h4>
              <p className="text-sm text-gray-500">{selectedSchedule.batch}</p>
              <p className="text-sm text-gray-500 mt-1">
                {selectedSchedule.date} • {selectedSchedule.time}
              </p>
            </div>

            {/* Action Type Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActionType("cancel")}
                className={`p-4 rounded-lg border text-center transition-all ${
                  actionType === "cancel"
                    ? "border-red-500 bg-red-50 dark:bg-red-500/20"
                    : "border-gray-200 dark:border-white/10"
                }`}
              >
                <X className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <p className="font-medium text-gray-900 dark:text-white">
                  Cancel Class
                </p>
              </button>
              <button
                onClick={() => setActionType("reschedule")}
                className={`p-4 rounded-lg border text-center transition-all ${
                  actionType === "reschedule"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-500/20"
                    : "border-gray-200 dark:border-white/10"
                }`}
              >
                <Clock className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <p className="font-medium text-gray-900 dark:text-white">
                  Reschedule
                </p>
              </button>
            </div>

            {/* Reschedule Date/Time */}
            {actionType === "reschedule" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Date *
                  </label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Time *
                  </label>
                  <Input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason (will be shared with students) *
              </label>
              <textarea
                placeholder="e.g., Faculty meeting / Personal emergency / Lab maintenance..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
              />
            </div>

            {/* Warning */}
            <div className="p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>
                  All <strong>{selectedSchedule.students} students</strong> in{" "}
                  {selectedSchedule.batch} will be notified immediately via app
                  notification and email.
                </span>
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowActionModal(false)}
              >
                Cancel
              </Button>
              <Button
                className={`flex-1 ${actionType === "cancel" ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"}`}
                onClick={handleSubmitAction}
              >
                <Send className="w-4 h-4 mr-2" />
                {actionType === "cancel"
                  ? "Cancel & Notify"
                  : "Reschedule & Notify"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
