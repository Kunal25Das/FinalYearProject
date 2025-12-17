"use client";

import { useState } from "react";
import {
  BookOpen,
  Users,
  FileText,
  Upload,
  Calendar,
  Bell,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  X,
  Clock,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function MyClassesTab() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeClassTab, setActiveClassTab] = useState("resources");
  const [resourceForm, setResourceForm] = useState({
    title: "",
    description: "",
    type: "notes",
  });
  const [scheduleAction, setScheduleAction] = useState("cancel");
  const [scheduleReason, setScheduleReason] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const [classes, setClasses] = useState([
    {
      id: 1,
      subject: "Data Structures",
      code: "CS301",
      batch: "CS-A 2024",
      students: 45,
      schedule: "Mon, Wed, Fri - 9:00 AM",
      room: "Room 301",
      color: "from-blue-500 to-cyan-500",
      resources: [
        {
          id: 1,
          title: "Week 1 - Introduction to DS",
          type: "notes",
          date: "Dec 10, 2025",
          downloads: 38,
        },
        {
          id: 2,
          title: "Linked List Implementation",
          type: "code",
          date: "Dec 12, 2025",
          downloads: 42,
        },
        {
          id: 3,
          title: "Assignment 1 - Arrays",
          type: "assignment",
          date: "Dec 14, 2025",
          downloads: 45,
        },
      ],
      notices: [
        {
          id: 1,
          title: "Assignment deadline extended to Dec 20",
          date: "Dec 15, 2025",
          priority: "important",
        },
      ],
    },
    {
      id: 2,
      subject: "Algorithm Design",
      code: "CS401",
      batch: "CS-B 2024",
      students: 52,
      schedule: "Tue, Thu - 11:00 AM",
      room: "Room 205",
      color: "from-purple-500 to-pink-500",
      resources: [
        {
          id: 1,
          title: "Sorting Algorithms Overview",
          type: "notes",
          date: "Dec 8, 2025",
          downloads: 48,
        },
        {
          id: 2,
          title: "Dynamic Programming Examples",
          type: "code",
          date: "Dec 11, 2025",
          downloads: 50,
        },
      ],
      notices: [],
    },
    {
      id: 3,
      subject: "Database Systems",
      code: "CS302",
      batch: "CS-A 2023",
      students: 40,
      schedule: "Mon, Wed - 2:00 PM",
      room: "Lab 102",
      color: "from-green-500 to-emerald-500",
      resources: [
        {
          id: 1,
          title: "SQL Basics Presentation",
          type: "slides",
          date: "Dec 5, 2025",
          downloads: 35,
        },
        {
          id: 2,
          title: "Normalization Exercise",
          type: "assignment",
          date: "Dec 13, 2025",
          downloads: 40,
        },
      ],
      notices: [
        {
          id: 1,
          title: "Lab practical on Dec 18 - Bring laptops",
          date: "Dec 14, 2025",
          priority: "info",
        },
      ],
    },
    {
      id: 4,
      subject: "Computer Networks",
      code: "CS403",
      batch: "CS-C 2024",
      students: 50,
      schedule: "Fri - 3:00 PM",
      room: "Room 401",
      color: "from-orange-500 to-red-500",
      resources: [],
      notices: [],
    },
  ]);

  const resourceTypes = [
    { value: "notes", label: "Lecture Notes", icon: "📝" },
    { value: "slides", label: "Slides/PPT", icon: "📊" },
    { value: "code", label: "Code Examples", icon: "💻" },
    { value: "assignment", label: "Assignment", icon: "📋" },
    { value: "video", label: "Video Link", icon: "🎥" },
    { value: "other", label: "Other", icon: "📁" },
  ];

  const handleShareResource = () => {
    if (selectedClass && resourceForm.title) {
      const newResource = {
        id: Date.now(),
        title: resourceForm.title,
        type: resourceForm.type,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        downloads: 0,
      };

      setClasses(
        classes.map((cls) =>
          cls.id === selectedClass.id
            ? { ...cls, resources: [...cls.resources, newResource] }
            : cls,
        ),
      );

      setShowResourceModal(false);
      setResourceForm({ title: "", description: "", type: "notes" });
    }
  };

  const handleScheduleAction = () => {
    // In real app, this would send notification to students
    setShowScheduleModal(false);
    setScheduleReason("");
    setNewDate("");
    setNewTime("");
  };

  const handleDeleteResource = (classId, resourceId) => {
    setClasses(
      classes.map((cls) =>
        cls.id === classId
          ? {
              ...cls,
              resources: cls.resources.filter((r) => r.id !== resourceId),
            }
          : cls,
      ),
    );
  };

  const getResourceIcon = (type) => {
    const found = resourceTypes.find((r) => r.value === type);
    return found ? found.icon : "📁";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Classes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your assigned classes and resources
          </p>
        </div>
      </div>

      {/* Class Cards */}
      {!selectedClass ? (
        <div className="grid md:grid-cols-2 gap-4">
          {classes.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                hover
                className="cursor-pointer"
                onClick={() => setSelectedClass(cls)}
              >
                <div
                  className={`h-3 rounded-t-lg bg-linear-to-r ${cls.color} -mx-5 -mt-5 mb-4`}
                />
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {cls.subject}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {cls.code} • {cls.batch}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="p-2!"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {cls.students} students
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {cls.resources.length} resources
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {cls.schedule}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{cls.room}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Class Detail View */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Header */}
          <Card className="mb-6">
            <div
              className={`h-4 rounded-t-lg bg-linear-to-r ${selectedClass.color} -mx-5 -mt-5 mb-4`}
            />
            <div className="flex items-start justify-between">
              <div>
                <Button
                  variant="ghost"
                  className="mb-2 -ml-2 text-sm!"
                  onClick={() => setSelectedClass(null)}
                >
                  ← Back to Classes
                </Button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedClass.subject}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedClass.code} • {selectedClass.batch}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleModal(true)}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule Action
                </Button>
                <Button onClick={() => setShowResourceModal(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Share Resource
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedClass.students}
                </span>{" "}
                students
              </span>
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5 text-green-500" />
                {selectedClass.schedule}
              </span>
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <BookOpen className="w-5 h-5 text-purple-500" />
                {selectedClass.room}
              </span>
            </div>
          </Card>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {["resources", "notices"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveClassTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  activeClassTab === tab
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Resources Tab */}
          {activeClassTab === "resources" && (
            <Card>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Shared Resources
              </h3>

              {selectedClass.resources.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {selectedClass.resources.map((resource) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-4 bg-gray-100 dark:bg-white/5 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getResourceIcon(resource.type)}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {resource.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {resource.date} • {resource.downloads} downloads
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" className="p-2!">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" className="p-2!">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="p-2! text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                            onClick={() =>
                              handleDeleteResource(
                                selectedClass.id,
                                resource.id,
                              )
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No resources shared yet
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setShowResourceModal(true)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Share First Resource
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Notices Tab */}
          {activeClassTab === "notices" && (
            <Card>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" />
                Class Notices
              </h3>

              {selectedClass.notices.length > 0 ? (
                <div className="space-y-3">
                  {selectedClass.notices.map((notice) => (
                    <div
                      key={notice.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        notice.priority === "important"
                          ? "bg-orange-50 dark:bg-orange-500/10 border-orange-500"
                          : notice.priority === "urgent"
                            ? "bg-red-50 dark:bg-red-500/10 border-red-500"
                            : "bg-blue-50 dark:bg-blue-500/10 border-blue-500"
                      }`}
                    >
                      <p className="font-medium text-gray-900 dark:text-white">
                        {notice.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {notice.date}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No notices for this class
                  </p>
                </div>
              )}
            </Card>
          )}
        </motion.div>
      )}

      {/* Share Resource Modal */}
      <Modal
        isOpen={showResourceModal}
        onClose={() => setShowResourceModal(false)}
        title="Share Resource"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resource Title *
            </label>
            <Input
              placeholder="e.g., Week 3 - Binary Trees"
              value={resourceForm.title}
              onChange={(e) =>
                setResourceForm({ ...resourceForm, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resource Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {resourceTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() =>
                    setResourceForm({ ...resourceForm, type: type.value })
                  }
                  className={`p-3 rounded-lg border text-center transition-all ${
                    resourceForm.type === type.value
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-500/20"
                      : "border-gray-200 dark:border-white/10 hover:border-purple-300"
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                    {type.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              placeholder="Add a description for students..."
              value={resourceForm.description}
              onChange={(e) =>
                setResourceForm({
                  ...resourceForm,
                  description: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
            />
          </div>

          <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-lg border-2 border-dashed border-gray-300 dark:border-white/20 text-center">
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag & drop files here or click to upload
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, DOC, PPT, ZIP up to 50MB
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowResourceModal(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleShareResource}>
              <Upload className="w-4 h-4 mr-2" />
              Share Resource
            </Button>
          </div>
        </div>
      </Modal>

      {/* Schedule Action Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Action"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Action Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setScheduleAction("cancel")}
                className={`p-4 rounded-lg border text-center transition-all ${
                  scheduleAction === "cancel"
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
                onClick={() => setScheduleAction("reschedule")}
                className={`p-4 rounded-lg border text-center transition-all ${
                  scheduleAction === "reschedule"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/20"
                    : "border-gray-200 dark:border-white/10"
                }`}
              >
                <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="font-medium text-gray-900 dark:text-white">
                  Reschedule
                </p>
              </button>
            </div>
          </div>

          {scheduleAction === "reschedule" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Date
                </label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Time
                </label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason (will be shared with students)
            </label>
            <textarea
              placeholder="e.g., Faculty meeting / Personal emergency..."
              value={scheduleReason}
              onChange={(e) => setScheduleReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
            />
          </div>

          <div className="p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              ⚠️ All {selectedClass?.students || 0} students in{" "}
              {selectedClass?.batch || "this class"} will be notified
              immediately.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowScheduleModal(false)}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 ${scheduleAction === "cancel" ? "bg-red-600 hover:bg-red-700" : ""}`}
              onClick={handleScheduleAction}
            >
              {scheduleAction === "cancel"
                ? "Cancel Class"
                : "Reschedule Class"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
