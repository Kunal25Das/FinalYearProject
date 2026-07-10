"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function ScheduleTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadSchedules() {
    try {
      const res = await fetch("/api/student/schedules");
      const data = await res.json();
      if (data.success) {
        setSchedules(data.schedules);
      }
    } catch (err) {
      console.error("Error loading student schedules:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchedules();
  }, []);

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i),
  );

  const getClassesForDay = (dayDate) => {
    return schedules.filter((s) => {
      const sDate = new Date(s.rawDate);
      return isSameDay(sDate, dayDate);
    });
  };

  const getSlotColor = (status) => {
    if (status === "cancelled") {
      return "bg-red-100 dark:bg-red-500/10 border-red-400 dark:border-red-500/20 text-red-700 dark:text-red-400 opacity-60 line-through";
    }
    if (status === "rescheduled") {
      return "bg-orange-100 dark:bg-orange-500/20 border-orange-400 dark:border-orange-500/30 text-orange-700 dark:text-orange-300";
    }
    return "bg-violet-100 dark:bg-violet-500/10 border-violet-400 dark:border-violet-500/20 text-violet-700 dark:text-violet-300";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500">Loading schedule...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Schedule
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your classes and assignments
          </p>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
        <button
          onClick={() => setCurrentDate(addDays(currentDate, -7))}
          className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-900 dark:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-lg font-medium text-gray-900 dark:text-white">
          {format(currentDate, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setCurrentDate(addDays(currentDate, 7))}
          className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-900 dark:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekly Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const isToday =
            format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          const dayClasses = getClassesForDay(day);

          return (
            <div key={index} className="space-y-3">
              <div
                className={`text-center p-3 rounded-xl border ${
                  isToday
                    ? "bg-violet-600 text-white border-violet-500"
                    : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10"
                }`}
              >
                <p className="text-xs font-medium uppercase">
                  {format(day, "EEE")}
                </p>
                <p className="text-xl font-bold">{format(day, "d")}</p>
              </div>

              <div className="space-y-2">
                {dayClasses.map((cls) => (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl border ${getSlotColor(cls.status)} cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => setSelectedClass(cls)}
                  >
                    <p className="font-bold text-sm truncate">{cls.subject}</p>
                    <div className="flex items-center gap-1 text-xs opacity-80 mt-1">
                      <Clock className="w-3 h-3" />
                      {cls.time}
                    </div>
                    <p className="text-xs opacity-80 mt-1">{cls.room}</p>
                    {cls.status !== "scheduled" && (
                      <p className="text-[10px] uppercase font-bold mt-1 tracking-wider">
                        {cls.status}
                      </p>
                    )}
                  </motion.div>
                ))}
                {dayClasses.length === 0 && (
                  <div className="h-24 rounded-xl border border-dashed border-gray-300 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-600 text-sm">
                    No classes
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Class Details Modal */}
      <Modal
        isOpen={!!selectedClass}
        onClose={() => setSelectedClass(null)}
        title={selectedClass?.subject || "Class Details"}
      >
        {selectedClass && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedClass.time}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                <p className="text-sm text-gray-600 dark:text-gray-400">Room</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedClass.room}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Faculty
                </p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedClass.faculty}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status
                </p>
                <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                  {selectedClass.status}
                </p>
              </div>
            </div>
            {selectedClass.status === "cancelled" &&
              selectedClass.cancelReason && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-500 font-semibold">
                    Cancellation Reason
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {selectedClass.cancelReason}
                  </p>
                </div>
              )}
            {selectedClass.status === "rescheduled" &&
              selectedClass.rescheduleReason && (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <p className="text-sm text-orange-500 font-semibold">
                    Rescheduling Reason
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {selectedClass.rescheduleReason}
                  </p>
                </div>
              )}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setSelectedClass(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
