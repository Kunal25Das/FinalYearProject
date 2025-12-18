"use client";

import { useState } from "react";
import {
  Bell,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Send,
  Users,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function DeptNoticesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium",
    targetAudience: "all",
    targetBatch: "",
  });

  const priorities = [
    { id: "all", name: "All Priorities" },
    { id: "high", name: "High", color: "red" },
    { id: "medium", name: "Medium", color: "yellow" },
    { id: "low", name: "Low", color: "green" },
  ];

  const audiences = [
    { id: "all", name: "All (Faculty & Students)" },
    { id: "faculty", name: "Faculty Only" },
    { id: "students", name: "Students Only" },
    { id: "batch", name: "Specific Batch" },
  ];

  const batches = [
    { id: "2024", name: "Batch 2024" },
    { id: "2023", name: "Batch 2023" },
    { id: "2022", name: "Batch 2022" },
    { id: "2021", name: "Batch 2021" },
  ];

  const [notices, setNotices] = useState([
    {
      id: 1,
      title: "Mid-Semester Examination Schedule",
      content:
        "The mid-semester examinations for all batches will commence from December 20, 2025. Detailed timetable has been uploaded to the portal. Students are advised to check their respective schedules and prepare accordingly. Any conflicts should be reported to the department office within 48 hours.",
      priority: "high",
      targetAudience: "all",
      targetBatch: null,
      createdAt: "Dec 16, 2025 10:30 AM",
      createdBy: "Dr. HOD",
      views: 245,
      status: "published",
    },
    {
      id: 2,
      title: "Faculty Meeting - Curriculum Review",
      content:
        "All faculty members are requested to attend the curriculum review meeting scheduled for December 20, 2025, at 11:00 AM in the Conference Room. Please bring your syllabus suggestions and feedback from the current semester.",
      priority: "high",
      targetAudience: "faculty",
      targetBatch: null,
      createdAt: "Dec 15, 2025 02:15 PM",
      createdBy: "Dr. HOD",
      views: 18,
      status: "published",
    },
    {
      id: 3,
      title: "Lab Equipment Maintenance",
      content:
        "Computer Lab 2 will be under maintenance on December 18-19, 2025. All scheduled lab sessions will be moved to Lab 3. Please check the updated schedule on the department portal.",
      priority: "medium",
      targetAudience: "all",
      targetBatch: null,
      createdAt: "Dec 14, 2025 09:00 AM",
      createdBy: "Dr. HOD",
      views: 156,
      status: "published",
    },
    {
      id: 4,
      title: "Project Submission Deadline Extended",
      content:
        "The deadline for final year project submission has been extended to January 15, 2026. Students should ensure all documentation is complete before submission.",
      priority: "medium",
      targetAudience: "batch",
      targetBatch: "2021",
      createdAt: "Dec 13, 2025 04:30 PM",
      createdBy: "Dr. HOD",
      views: 89,
      status: "published",
    },
    {
      id: 5,
      title: "Holiday Notice - Christmas",
      content:
        "The department will remain closed from December 24-26, 2025, on account of Christmas holidays. Regular classes will resume from December 27, 2025.",
      priority: "low",
      targetAudience: "all",
      targetBatch: null,
      createdAt: "Dec 12, 2025 11:00 AM",
      createdBy: "Dr. HOD",
      views: 312,
      status: "published",
    },
  ]);

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || notice.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleCreateNotice = () => {
    const newNotice = {
      id: notices.length + 1,
      ...formData,
      targetBatch:
        formData.targetAudience === "batch" ? formData.targetBatch : null,
      createdAt: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      createdBy: "Dr. HOD",
      views: 0,
      status: "published",
    };

    setNotices([newNotice, ...notices]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleDeleteNotice = (id) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      setNotices(notices.filter((n) => n.id !== id));
    }
  };

  const viewNotice = (notice) => {
    setSelectedNotice(notice);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      priority: "medium",
      targetAudience: "all",
      targetBatch: "",
    });
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-4 h-4" />;
      case "medium":
        return <Info className="w-4 h-4" />;
      case "low":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-500";
      case "medium":
        return "bg-yellow-500/20 text-yellow-500";
      case "low":
        return "bg-green-500/20 text-green-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const getAudienceLabel = (notice) => {
    if (notice.targetAudience === "batch") {
      return `Batch ${notice.targetBatch}`;
    }
    return notice.targetAudience === "all"
      ? "Everyone"
      : notice.targetAudience === "faculty"
        ? "Faculty"
        : "Students";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Department Notices
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Issue and manage department notices
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Notice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {notices.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Notices
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-red-500">
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {notices.filter((n) => n.priority === "high").length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            High Priority
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-yellow-500">
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {notices.filter((n) => n.priority === "medium").length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Medium Priority
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-green-500">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {notices.reduce((sum, n) => sum + n.views, 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Views
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {priorities.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  className="bg-white dark:bg-gray-800"
                >
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Notices List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredNotices.map((notice, index) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notice.priority)}`}
                      >
                        {getPriorityIcon(notice.priority)}
                        {notice.priority.charAt(0).toUpperCase() +
                          notice.priority.slice(1)}
                      </span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-500 rounded-full text-xs font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {getAudienceLabel(notice)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {notice.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                      {notice.content}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {notice.createdAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {notice.views} views
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" onClick={() => viewNotice(notice)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteNotice(notice.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredNotices.length === 0 && (
          <Card className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No notices found</p>
          </Card>
        )}
      </div>

      {/* Create Notice Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create New Notice"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <Input
              placeholder="Enter notice title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content *
            </label>
            <textarea
              placeholder="Enter notice content..."
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="high" className="bg-white dark:bg-gray-800">
                  High
                </option>
                <option value="medium" className="bg-white dark:bg-gray-800">
                  Medium
                </option>
                <option value="low" className="bg-white dark:bg-gray-800">
                  Low
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Audience *
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) =>
                  setFormData({ ...formData, targetAudience: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white"
              >
                {audiences.map((a) => (
                  <option
                    key={a.id}
                    value={a.id}
                    className="bg-white dark:bg-gray-800"
                  >
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.targetAudience === "batch" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Batch *
              </label>
              <select
                value={formData.targetBatch}
                onChange={(e) =>
                  setFormData({ ...formData, targetBatch: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="" className="bg-white dark:bg-gray-800">
                  Select a batch
                </option>
                {batches.map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    className="bg-white dark:bg-gray-800"
                  >
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateNotice}
              disabled={
                !formData.title ||
                !formData.content ||
                (formData.targetAudience === "batch" && !formData.targetBatch)
              }
            >
              <Send className="w-4 h-4 mr-2" />
              Publish Notice
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Notice Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedNotice(null);
        }}
        title="Notice Details"
        size="lg"
      >
        {selectedNotice && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedNotice.priority)}`}
              >
                {getPriorityIcon(selectedNotice.priority)}
                {selectedNotice.priority.charAt(0).toUpperCase() +
                  selectedNotice.priority.slice(1)}{" "}
                Priority
              </span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-500 rounded-full text-xs font-medium">
                {getAudienceLabel(selectedNotice)}
              </span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedNotice.title}
            </h2>

            <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-xl">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {selectedNotice.content}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200 dark:border-white/10">
              <span>Published by {selectedNotice.createdBy}</span>
              <span>{selectedNotice.createdAt}</span>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowViewModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
