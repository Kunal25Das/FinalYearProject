"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  AlertTriangle,
  Info,
  AlertCircle,
  Send,
  Users,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function ClassNoticesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    classId: "",
    priority: "info",
    pinned: false,
  });

  const [notices, setNotices] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadNotices() {
    try {
      const res = await fetch("/api/faculty/notices");
      const data = await res.json();
      if (data.success) {
        setNotices(data.notices);
        setMyClasses(data.myClasses);
      }
    } catch (err) {
      console.error("Error loading notices:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotices();
  }, []);

  const priorityOptions = [
    {
      value: "info",
      label: "Information",
      icon: Info,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500",
    },
    {
      value: "important",
      label: "Important",
      icon: AlertCircle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
      borderColor: "border-orange-500",
    },
    {
      value: "urgent",
      label: "Urgent",
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500",
    },
  ];

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      selectedClass === "all" || notice.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Sort: pinned first, then by date
  const sortedNotices = [...filteredNotices].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const handleCreateNotice = async () => {
    if (!noticeForm.title || !noticeForm.content || !noticeForm.classId) {
      alert("Title, Content, and Class ID are required");
      return;
    }

    try {
      const isEditing = !!editingNotice;
      const res = await fetch("/api/faculty/notices", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: isEditing ? editingNotice.id : undefined,
          title: noticeForm.title,
          content: noticeForm.content,
          classId: noticeForm.classId,
          priority: noticeForm.priority,
          pinned: noticeForm.pinned,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadNotices();
        setShowNoticeModal(false);
        setEditingNotice(null);
        setNoticeForm({
          title: "",
          content: "",
          classId: "",
          priority: "info",
          pinned: false,
        });
      } else {
        alert(data.error || "Failed to save notice");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving notice");
    }
  };

  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
    setNoticeForm({
      title: notice.title,
      content: notice.content,
      classId: notice.classId,
      priority: notice.priority,
      pinned: notice.pinned,
    });
    setShowNoticeModal(true);
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!confirm("Are you sure you want to archive/delete this notice?"))
      return;

    try {
      const res = await fetch(`/api/faculty/notices?id=${noticeId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await loadNotices();
      } else {
        alert(data.error || "Failed to delete notice");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting notice");
    }
  };

  const handleTogglePin = async (noticeId) => {
    const notice = notices.find((n) => n.id === noticeId);
    if (!notice) return;

    try {
      const res = await fetch("/api/faculty/notices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: noticeId,
          pinned: !notice.pinned,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadNotices();
      } else {
        alert(data.error || "Failed to toggle pin state");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while pinning notice");
    }
  };

  const getPriorityConfig = (priority) => {
    return (
      priorityOptions.find((p) => p.value === priority) || priorityOptions[0]
    );
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
            Class Notices
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Post and manage class-specific notices
          </p>
        </div>
        <Button onClick={() => setShowNoticeModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Post Notice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {notices.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Notices
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {notices.filter((n) => n.pinned).length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pinned</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {notices.filter((n) => n.priority === "urgent").length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Urgent</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
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
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {myClasses.map((cls) => (
              <option
                key={cls.id}
                value={cls.id}
                className="bg-white dark:bg-gray-800"
              >
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Notices List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedNotices.map((notice, index) => {
            const priorityConfig = getPriorityConfig(notice.priority);
            const PriorityIcon = priorityConfig.icon;

            return (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border-l-4 ${priorityConfig.borderColor}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {notice.pinned && (
                          <span className="flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/20 px-2 py-0.5 rounded-full">
                            <Pin className="w-3 h-3" /> Pinned
                          </span>
                        )}
                        <span
                          className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${priorityConfig.bgColor} ${priorityConfig.color}`}
                        >
                          <PriorityIcon className="w-3 h-3" />
                          {priorityConfig.label}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                          {notice.className}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {notice.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {notice.content}
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span>{notice.date}</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {notice.views} views
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        className={`p-2! ${notice.pinned ? "text-purple-600 dark:text-purple-400" : ""}`}
                        onClick={() => handleTogglePin(notice.id)}
                      >
                        <Pin className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="p-2!"
                        onClick={() => handleEditNotice(notice)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="p-2! text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        onClick={() => handleDeleteNotice(notice.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {sortedNotices.length === 0 && (
          <Card className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No notices found</p>
            <Button className="mt-4" onClick={() => setShowNoticeModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Post First Notice
            </Button>
          </Card>
        )}
      </div>

      {/* Create/Edit Notice Modal */}
      <Modal
        isOpen={showNoticeModal}
        onClose={() => {
          setShowNoticeModal(false);
          setEditingNotice(null);
          setNoticeForm({
            title: "",
            content: "",
            classId: "",
            priority: "info",
            pinned: false,
          });
        }}
        title={editingNotice ? "Edit Notice" : "Post New Notice"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Class *
            </label>
            <select
              value={noticeForm.classId}
              onChange={(e) =>
                setNoticeForm({ ...noticeForm, classId: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="bg-white dark:bg-gray-800">
                Choose a class...
              </option>
              {myClasses
                .filter((c) => c.id !== "all")
                .map((cls) => (
                  <option
                    key={cls.id}
                    value={cls.id}
                    className="bg-white dark:bg-gray-800"
                  >
                    {cls.name} ({cls.students} students)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notice Title *
            </label>
            <Input
              placeholder="e.g., Assignment Deadline Extended"
              value={noticeForm.title}
              onChange={(e) =>
                setNoticeForm({ ...noticeForm, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notice Content *
            </label>
            <textarea
              placeholder="Write your notice content here..."
              value={noticeForm.content}
              onChange={(e) =>
                setNoticeForm({ ...noticeForm, content: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {priorityOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() =>
                      setNoticeForm({ ...noticeForm, priority: option.value })
                    }
                    className={`p-3 rounded-lg border text-center transition-all ${
                      noticeForm.priority === option.value
                        ? `${option.borderColor} ${option.bgColor}`
                        : "border-gray-200 dark:border-white/10 hover:border-gray-300"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${option.color}`} />
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {option.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-white/5 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={noticeForm.pinned}
              onChange={(e) =>
                setNoticeForm({ ...noticeForm, pinned: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Pin className="w-4 h-4" /> Pin this notice
              </p>
              <p className="text-xs text-gray-500">
                Pinned notices appear at the top
              </p>
            </div>
          </label>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setShowNoticeModal(false);
                setEditingNotice(null);
                setNoticeForm({
                  title: "",
                  content: "",
                  classId: "",
                  priority: "info",
                  pinned: false,
                });
              }}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleCreateNotice}>
              <Send className="w-4 h-4 mr-2" />
              {editingNotice ? "Update Notice" : "Post Notice"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
