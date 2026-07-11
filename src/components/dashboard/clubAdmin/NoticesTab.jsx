"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Info,
  Calendar,
  Pin,
  Loader2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion } from "framer-motion";

export default function NoticesTab({ userRole }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    type: "info",
    pinned: false,
  });

  const noticeTypes = [
    { id: "urgent", label: "Urgent", color: "red", icon: AlertCircle },
    { id: "info", label: "Information", color: "blue", icon: Info },
    { id: "update", label: "Update", color: "green", icon: Bell },
    { id: "event", label: "Event", color: "purple", icon: Calendar },
  ];

  const loadNotices = useCallback(async () => {
    try {
      const res = await fetch("/api/club/notices");
      const data = await res.json();
      if (data.success) {
        setNotices(data.notices || []);
      }
    } catch (err) {
      console.error("Failed to load club notices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const handleCreateNotice = async () => {
    if (!newNotice.title || !newNotice.content) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      const res = await fetch("/api/club/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotice),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        setNewNotice({ title: "", content: "", type: "info", pinned: false });
        loadNotices();
      } else {
        alert(data.error || "Failed to create notice");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while creating notice");
    }
  };

  const handleUpdateNotice = async () => {
    try {
      const res = await fetch("/api/club/notices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticeId: editingNotice.id,
          title: editingNotice.title,
          content: editingNotice.content,
          type: editingNotice.type,
          pinned: editingNotice.pinned,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingNotice(null);
        loadNotices();
      } else {
        alert(data.error || "Failed to update notice");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while updating notice");
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch(`/api/club/notices?id=${noticeId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        loadNotices();
      } else {
        alert(data.error || "Failed to delete notice");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while deleting notice");
    }
  };

  const togglePin = async (noticeId, currentPinned) => {
    try {
      const res = await fetch("/api/club/notices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noticeId, pinned: !currentPinned }),
      });
      const data = await res.json();
      if (data.success) {
        loadNotices();
      } else {
        alert(data.error || "Failed to toggle pin state");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeConfig = (type) => {
    return noticeTypes.find((t) => t.id === type) || noticeTypes[1];
  };

  const sortedNotices = [...notices].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500">Loading notices...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notices
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage club announcements
          </p>
        </div>
        {userRole !== "club-advisor" && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Post Notice
          </Button>
        )}
      </div>

      {/* Notice Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {noticeTypes.map((type) => {
          const Icon = type.icon;
          const count = notices.filter((n) => n.type === type.id).length;
          return (
            <Card key={type.id} hover>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    type.id === "urgent"
                      ? "bg-red-500/20 text-red-500"
                      : type.id === "info"
                        ? "bg-blue-500/20 text-blue-500"
                        : type.id === "update"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-purple-500/20 text-purple-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {count}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {type.label}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {sortedNotices.map((notice, index) => {
          const typeConfig = getTypeConfig(notice.type);
          const Icon = typeConfig.icon;
          return (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative ${notice.pinned ? "border-2 border-purple-500/50" : ""}`}
              >
                {notice.pinned && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Pin className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                        notice.type === "urgent"
                          ? "bg-red-500/20 text-red-500"
                          : notice.type === "info"
                            ? "bg-blue-500/20 text-blue-500"
                            : notice.type === "update"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-purple-500/20 text-purple-500"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {notice.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            notice.type === "urgent"
                              ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                              : notice.type === "info"
                                ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                : notice.type === "update"
                                  ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                                  : "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
                          }`}
                        >
                          {typeConfig.label}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {notice.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        Posted on {notice.createdAt}
                      </p>
                    </div>
                  </div>

                  {userRole !== "club-advisor" && (
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => togglePin(notice.id, notice.pinned)}
                        className={`p-2 rounded-lg transition-colors ${
                          notice.pinned
                            ? "bg-purple-500/20 text-purple-500"
                            : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
                        }`}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingNotice(notice)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {notices.length === 0 && (
        <Card className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No notices yet
          </h3>
          <p className="text-gray-500 mb-4">
            {userRole === "club-advisor"
              ? "Stay tuned for upcoming announcements from club representatives."
              : "Create your first notice to inform club members"}
          </p>
          {userRole !== "club-advisor" && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Post Notice
            </Button>
          )}
        </Card>
      )}

      {/* Create Notice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Post New Notice"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="Notice title"
            value={newNotice.title}
            onChange={(e) =>
              setNewNotice({ ...newNotice, title: e.target.value })
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Content
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              rows={4}
              placeholder="Notice content"
              value={newNotice.content}
              onChange={(e) =>
                setNewNotice({ ...newNotice, content: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {noticeTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() =>
                      setNewNotice({ ...newNotice, type: type.id })
                    }
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                      newNotice.type === type.id
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-200 dark:border-white/10 hover:border-purple-500/50"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        type.id === "urgent"
                          ? "text-red-500"
                          : type.id === "info"
                            ? "text-blue-500"
                            : type.id === "update"
                              ? "text-green-500"
                              : "text-purple-500"
                      }`}
                    />
                    <span className="text-gray-900 dark:text-white text-sm">
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={newNotice.pinned}
              onChange={(e) =>
                setNewNotice({ ...newNotice, pinned: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
            />
            <span className="text-gray-900 dark:text-white">
              Pin this notice
            </span>
          </label>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleCreateNotice}>
              Post Notice
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Notice Modal */}
      <Modal
        isOpen={!!editingNotice}
        onClose={() => setEditingNotice(null)}
        title="Edit Notice"
      >
        {editingNotice && (
          <div className="space-y-4">
            <Input
              label="Title"
              placeholder="Notice title"
              value={editingNotice.title}
              onChange={(e) =>
                setEditingNotice({ ...editingNotice, title: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Content
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                rows={4}
                placeholder="Notice content"
                value={editingNotice.content}
                onChange={(e) =>
                  setEditingNotice({
                    ...editingNotice,
                    content: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {noticeTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() =>
                        setEditingNotice({ ...editingNotice, type: type.id })
                      }
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                        editingNotice.type === type.id
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-gray-200 dark:border-white/10 hover:border-purple-500/50"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          type.id === "urgent"
                            ? "text-red-500"
                            : type.id === "info"
                              ? "text-blue-500"
                              : type.id === "update"
                                ? "text-green-500"
                                : "text-purple-500"
                        }`}
                      />
                      <span className="text-gray-900 dark:text-white text-sm">
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setEditingNotice(null)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleUpdateNotice}>
                Update Notice
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
