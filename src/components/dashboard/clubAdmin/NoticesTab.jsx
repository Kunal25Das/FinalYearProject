"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Info,
  Calendar,
  Pin,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion } from "framer-motion";
import { clubService } from "@/lib/services/clubService";
import { noticeService } from "@/lib/services/noticeService";

export default function NoticesTab() {
  const [notices, setNotices] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [currentClubId, setCurrentClubId] = useState(null);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    type: "info",
    clubId: "",
    pinned: false,
  });

  const noticeTypes = [
    { id: "urgent", label: "Urgent", color: "red", icon: AlertCircle },
    { id: "info", label: "Information", color: "blue", icon: Info },
    { id: "update", label: "Update", color: "green", icon: Bell },
    { id: "event", label: "Event", color: "purple", icon: Calendar },
  ];

  useEffect(() => {
    const initializeNotices = async () => {
      try {
        const club = await clubService.clubContext();

        if (club) {
          setCurrentClubId(club.clubId);

          const clubNotices = await noticeService.getByClubId(club.clubId);
          setNotices(clubNotices);
        }
      } catch (error) {
        console.error("Error initializing notices data:", error);
      }
    };

    initializeNotices();
  }, []);

  const handleCreateNotice = async () => {
    try {
      const createdNotice = await noticeService.create({
        title: newNotice.title,
        content: newNotice.content,
        type: newNotice.type,
        pinned: newNotice.pinned,
        clubId: currentClubId,
      });

      setNotices([createdNotice, ...notices]);
      setIsCreateModalOpen(false);
      setNewNotice({
        title: "",
        content: "",
        type: "info",
        clubId: "",
        pinned: false,
      });
    } catch (error) {
      console.error("Error creating notice:", error);
      alert("Failed to create notice. Please try again.");
    }
  };

  const handleUpdateNotice = async () => {
    if (!editingNotice) return;

    if (!editingNotice.title || !editingNotice.content || !editingNotice.type) {
      setError("Title, content, and type are required.");
      return;
    }

    try {
      const updated = await noticeService.update(editingNotice.$id, {
        title: editingNotice.title,
        content: editingNotice.content,
        type: editingNotice.type,
        pinned: editingNotice.pinned,
      });

      setNotices(
        notices.map((n) => (n.$id === editingNotice.$id ? updated : n)),
      );
      setIsEditModalOpen(false);
      setEditingNotice(null);
    } catch (error) {
      console.error("Error updating notice:", error);
      alert("Failed to update notice. Please try again.");
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    try {
      await noticeService.delete(noticeId);
      setNotices(notices.filter((n) => n.$id !== noticeId));
    } catch (error) {
      console.error("Error deleting notice:", error);
      alert("Failed to delete notice.");
    }
  };

  const togglePin = async (noticeId) => {
    try {
      const updated = await noticeService.update(noticeId, {
        pinned: !notices.find((n) => n.$id === noticeId)?.pinned,
      });

      setNotices(notices.map((n) => (n.$id === noticeId ? updated : n)));
    } catch (error) {
      console.error("Error pinning notice:", error);
      alert("Failed to pin notice. Please try again.");
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
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Post Notice
        </Button>
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
                  className={`w-10 h-10 rounded-lg bg-${type.color}-500/20 flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 text-${type.color}-500`} />
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
              key={notice.$id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative ${notice.pinned ? "border-2 border-violet-500/50" : ""}`}
              >
                {notice.pinned && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center">
                    <Pin className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                        notice.type === "urgent"
                          ? "bg-red-500/20"
                          : notice.type === "info"
                            ? "bg-blue-500/20"
                            : notice.type === "update"
                              ? "bg-green-500/20"
                              : "bg-purple-500/20"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          notice.type === "urgent"
                            ? "text-red-500"
                            : notice.type === "info"
                              ? "text-blue-500"
                              : notice.type === "update"
                                ? "text-green-500"
                                : "text-purple-500"
                        }`}
                      />
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

                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => togglePin(notice.$id)}
                      className={`p-2 rounded-lg transition-colors ${
                        notice.pinned
                          ? "bg-violet-500/20 text-violet-500"
                          : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
                      }`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingNotice(notice);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNotice(notice.$id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
            Create your first notice to inform club members
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Post Notice
          </Button>
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
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
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-gray-200 dark:border-white/10 hover:border-violet-500/50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 text-${type.color}-500`} />
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
              className="w-5 h-5 rounded border-gray-300 text-violet-500 focus:ring-violet-500"
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
        isOpen={isEditModalOpen}
        onClose={() => {
          setEditingNotice(null);
          setIsEditModalOpen(false);
        }}
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
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
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-gray-200 dark:border-white/10 hover:border-violet-500/50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 text-${type.color}-500`} />
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
                onClick={() => {
                  setEditingNotice(null);
                  setIsEditModalOpen(false);
                }}
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
