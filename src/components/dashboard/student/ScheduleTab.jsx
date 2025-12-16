"use client";

import { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, AlertCircle, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { motion } from "framer-motion";

export default function ScheduleTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data - will be replaced with API calls
  const classes = [
    {
      id: 1,
      name: "Computer Networks",
      time: "9:00 AM - 11:00 AM",
      room: "Room 301",
      faculty: "Dr. Smith",
      status: "scheduled",
      date: new Date(),
    },
    {
      id: 2,
      name: "Data Structures",
      time: "11:30 AM - 1:30 PM",
      room: "Room 205",
      faculty: "Prof. Johnson",
      status: "rescheduled",
      date: new Date(),
      notification: "Rescheduled to 2:00 PM",
    },
    {
      id: 3,
      name: "Database Systems",
      time: "2:00 PM - 4:00 PM",
      room: "Lab 102",
      faculty: "Dr. Williams",
      status: "cancelled",
      date: new Date(),
      notification: "Class cancelled",
    },
  ];

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(currentDate), i),
  );

  const getClassesForDate = (date) => {
    return classes.filter(
      (c) => format(c.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
    );
  };

  const handleClassClick = (classItem) => {
    setSelectedClass(classItem);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Schedule
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentDate(addDays(currentDate, -7))}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayClasses = getClassesForDate(day);
            const isToday =
              format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            const isSelected =
              format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedDate(day)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : isToday
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className="text-sm font-medium mb-2">
                  {format(day, "EEE")}
                </div>
                <div className="text-2xl font-bold mb-2">
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayClasses.slice(0, 2).map((cls) => (
                    <div
                      key={cls.id}
                      className={`text-xs p-1 rounded ${
                        isSelected
                          ? "bg-blue-700"
                          : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    >
                      {cls.name.substring(0, 15)}...
                    </div>
                  ))}
                  {dayClasses.length > 2 && (
                    <div className="text-xs opacity-70">
                      +{dayClasses.length - 2} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Classes List for Selected Date */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Classes for {format(selectedDate, "EEEE, MMMM d")}
        </h2>
        <div className="space-y-4">
          {getClassesForDate(selectedDate).length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No classes scheduled for this day
              </p>
            </Card>
          ) : (
            getClassesForDate(selectedDate).map((classItem) => (
              <motion.div
                key={classItem.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleClassClick(classItem)}
              >
                <Card hover className="cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {classItem.name}
                        </h3>
                        {classItem.notification && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              classItem.status === "cancelled"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                            }`}
                          >
                            {classItem.notification}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {classItem.time}
                        </div>
                        <span>•</span>
                        <span>{classItem.room}</span>
                        <span>•</span>
                        <span>{classItem.faculty}</span>
                      </div>
                    </div>
                    {classItem.notification && (
                      <AlertCircle
                        className={`w-5 h-5 ${
                          classItem.status === "cancelled"
                            ? "text-red-500"
                            : "text-yellow-500"
                        }`}
                      />
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Class Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedClass?.name}
      >
        {selectedClass && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedClass.time}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Room</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedClass.room}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Faculty
              </p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedClass.faculty}
              </p>
            </div>
            {selectedClass.notification && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  {selectedClass.notification}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
