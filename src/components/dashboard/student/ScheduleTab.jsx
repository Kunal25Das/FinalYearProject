"use client";

import { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
// import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
// import Input from "@/components/ui/Input";
import { motion } from "framer-motion";

export default function ScheduleTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState(null);

  // Mock data
  const classes = [
    {
      id: 1,
      name: "Computer Networks",
      time: "09:00 - 11:00",
      room: "Room 301",
      faculty: "Dr. Smith",
      status: "scheduled",
      day: 1, // Monday
      color:
        "bg-blue-100 dark:bg-blue-500/20 border-blue-400 dark:border-blue-500/50 text-blue-700 dark:text-blue-300",
    },
    {
      id: 2,
      name: "Data Structures",
      time: "11:30 - 13:30",
      room: "Room 205",
      faculty: "Prof. Johnson",
      status: "rescheduled",
      day: 1,
      color:
        "bg-purple-100 dark:bg-purple-500/20 border-purple-400 dark:border-purple-500/50 text-purple-700 dark:text-purple-300",
    },
    {
      id: 3,
      name: "Database Systems",
      time: "14:00 - 16:00",
      room: "Lab 102",
      faculty: "Dr. Williams",
      status: "scheduled",
      day: 2, // Tuesday
      color:
        "bg-green-100 dark:bg-green-500/20 border-green-400 dark:border-green-500/50 text-green-700 dark:text-green-300",
    },
    {
      id: 4,
      name: "Operating Systems",
      time: "10:00 - 12:00",
      room: "Room 401",
      faculty: "Dr. Brown",
      status: "scheduled",
      day: 3, // Wednesday
      color:
        "bg-orange-100 dark:bg-orange-500/20 border-orange-400 dark:border-orange-500/50 text-orange-700 dark:text-orange-300",
    },
  ];

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i),
  );

  const getClassesForDay = (dayIndex) => {
    // dayIndex: 0 = Monday, 6 = Sunday (adjusted for weekStartsOn: 1)
    // In date-fns startOfWeek with weekStartsOn: 1, the array starts with Monday.
    // My mock data uses 1 for Monday, 2 for Tuesday, etc.
    return classes.filter((c) => c.day === dayIndex + 1);
  };

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
          const dayClasses = getClassesForDay(index);

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
                    className={`p-3 rounded-xl border ${cls.color} cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => setSelectedClass(cls)}
                  >
                    <p className="font-bold text-sm truncate">{cls.name}</p>
                    <div className="flex items-center gap-1 text-xs opacity-80 mt-1">
                      <Clock className="w-3 h-3" />
                      {cls.time}
                    </div>
                    <p className="text-xs opacity-80 mt-1">{cls.room}</p>
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
        title={selectedClass?.name || "Class Details"}
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
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setSelectedClass(null)}>
                Close
              </Button>
              <Button>Join Class Link</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
