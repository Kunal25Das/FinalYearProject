"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  Search,
  Trash2,
  Eye,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  Pin,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminNoticesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAudience, setFilterAudience] = useState("all");
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "Normal",
    audience: "All",
    department: "",
    pinned: false,
    expiresAt: "",
    author: "Administration",
  });

  const priorityOptions = ["Normal", "Important", "Urgent"];
  const audienceOptions = ["All", "Students", "Faculty", "Staff", "Department"];

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notices");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotices(data.notices || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActioningId("create");

    try {
      const res = await fetch("/api/admin/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowCreateModal(false);
      setFormData({
        title: "",
        content: "",
        priority: "Normal",
        audience: "All",
        department: "",
        pinned: false,
        expiresAt: "",
        author: "Administration",
      });
      fetchNotices(); // Reload list
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    setActioningId(id);
    try {
      const res = await fetch(`/api/admin/notices?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotices((prev) =>
        prev.filter((notice) => notice._id !== id && notice.id !== id),
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      filterPriority === "all" || notice.priority === filterPriority;
    const matchesAudience =
      filterAudience === "all" || notice.audience === filterAudience;
    return matchesSearch && matchesPriority && matchesAudience;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500 dark:text-gray-400">
          Loading notice boards...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="font-bold">Failed to load notices</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Campus Notice Board
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Publish, edit, or archive official college announcements for
            students and faculty.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          <span>Publish Notice</span>
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="border border-gray-200 dark:border-white/10 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Filter by Priority */}
            <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-xl">
              <span className="text-xs text-gray-400 font-semibold uppercase">
                Priority:
              </span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none border-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                {priorityOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Audience */}
            <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-xl">
              <span className="text-xs text-gray-400 font-semibold uppercase">
                Target:
              </span>
              <select
                value={filterAudience}
                onChange={(e) => setFilterAudience(e.target.value)}
                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none border-none cursor-pointer"
              >
                <option value="all">All Audiences</option>
                {audienceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Notices Board List */}
      {filteredNotices.length === 0 ? (
        <Card className="text-center py-12 border border-gray-200 dark:border-white/10">
          <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Notice Board Empty
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            No notices are published matching your search filters.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredNotices.map((notice) => (
              <motion.div
                key={notice._id || notice.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Card className="border border-gray-200 dark:border-white/10 relative overflow-hidden">
                  {notice.pinned && (
                    <div className="absolute top-4 right-4 text-purple-400 flex items-center gap-1 text-[10px] uppercase font-bold">
                      <Pin className="w-3.5 h-3.5 fill-purple-400" />
                      <span>Pinned</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Priority Symbol */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        notice.priority === "Urgent"
                          ? "bg-red-500/10 text-red-500"
                          : notice.priority === "Important"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {notice.priority === "Urgent" ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : notice.priority === "Important" ? (
                        <Info className="w-5 h-5" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              notice.priority === "Urgent"
                                ? "bg-red-500/20 text-red-400"
                                : notice.priority === "Important"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {notice.priority}
                          </span>
                          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400">
                            Audience: {notice.audience}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1.5 leading-tight">
                          {notice.title}
                        </h3>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {notice.content}
                      </p>

                      <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex flex-wrap gap-4 text-xs text-gray-400">
                        <span>By {notice.author}</span>
                        <span>•</span>
                        <span>
                          Published:{" "}
                          {new Date(notice.publishedAt).toLocaleDateString()}
                        </span>
                        {notice.expiresAt && (
                          <>
                            <span>•</span>
                            <span>
                              Expires:{" "}
                              {new Date(notice.expiresAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedNotice(notice);
                        setShowViewModal(true);
                      }}
                      className="text-purple-400 hover:bg-purple-500/10 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Read Full</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notice._id || notice.id)}
                      disabled={actioningId !== null}
                      className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Notice Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Publish Official Notice"
      >
        <form
          onSubmit={handleCreateSubmit}
          className="space-y-4 max-h-[75vh] overflow-y-auto pr-2"
        >
          <Input
            label="Notice Title"
            type="text"
            placeholder="e.g. End Semester Exam Timetable Released"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="bg-white/5 border-white/10 text-white focus:border-purple-500"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                {priorityOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Target Audience
              </label>
              <select
                value={formData.audience}
                onChange={(e) =>
                  setFormData({ ...formData, audience: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                {audienceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expiry Date"
              type="date"
              value={formData.expiresAt}
              onChange={(e) =>
                setFormData({ ...formData, expiresAt: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white focus:border-purple-500"
            />

            <Input
              label="Author Office"
              type="text"
              placeholder="e.g. Examination Cell"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="pinned"
              checked={formData.pinned}
              onChange={(e) =>
                setFormData({ ...formData, pinned: e.target.checked })
              }
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 focus:border-transparent outline-none bg-white/5 border-white/10"
            />
            <label
              htmlFor="pinned"
              className="text-sm font-medium text-gray-300 cursor-pointer"
            >
              Pin notice to the top of notice board
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Notice Body Content
            </label>
            <textarea
              required
              rows={5}
              placeholder="Write the complete announcement contents..."
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={actioningId !== null}
            >
              {actioningId === "create" ? "Publishing..." : "Publish Notice"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Read Notice Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Official Notice Announcement"
      >
        {selectedNotice && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-white/10 relative">
              {selectedNotice.pinned && (
                <span className="absolute top-0 right-0 text-purple-400 flex items-center gap-1 text-[10px] uppercase font-bold">
                  <Pin className="w-3.5 h-3.5 fill-purple-400" />
                  <span>Pinned Notice</span>
                </span>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    selectedNotice.priority === "Urgent"
                      ? "bg-red-500/20 text-red-400"
                      : selectedNotice.priority === "Important"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {selectedNotice.priority}
                </span>
                <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400">
                  Target: {selectedNotice.audience}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 leading-tight">
                {selectedNotice.title}
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {selectedNotice.content}
              </p>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-white/5 p-4 rounded-xl text-xs text-gray-400 border border-white/5">
                <div>
                  <span className="block font-semibold uppercase text-gray-500 mb-0.5">
                    Author Office
                  </span>
                  <span className="text-white font-medium">
                    {selectedNotice.author}
                  </span>
                </div>
                <div>
                  <span className="block font-semibold uppercase text-gray-500 mb-0.5">
                    Publish Date
                  </span>
                  <span className="text-white font-medium">
                    {new Date(selectedNotice.publishedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-end">
              <Button variant="ghost" onClick={() => setShowViewModal(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
