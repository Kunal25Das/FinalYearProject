"use client";

import { useState } from "react";
import {
  Bell,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Users,
  Building,
  AlertTriangle,
  Info,
  CheckCircle,
  Send,
  Pin,
  Clock,
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

  const priorityOptions = ["Normal", "Important", "Urgent"];
  const audienceOptions = ["All", "Students", "Faculty", "Staff", "Department"];

  const [notices, setNotices] = useState([
    {
      id: 1,
      title: "End Semester Examination Schedule Released",
      content:
        "The end semester examination schedule for all departments has been released. Students are advised to check the examination portal for detailed timetable and seating arrangements. Please ensure you carry your hall ticket and ID card to the examination hall.",
      priority: "Urgent",
      audience: "Students",
      department: null,
      pinned: true,
      publishedAt: "Dec 16, 2025 09:00 AM",
      expiresAt: "Dec 30, 2025",
      views: 2450,
      author: "Examination Cell",
      status: "active",
    },
    {
      id: 2,
      title: "Winter Vacation Announcement",
      content:
        "The college will remain closed from December 25th to January 2nd for winter vacation. Classes will resume on January 3rd, 2026. All departments are requested to complete pending evaluations before the vacation.",
      priority: "Important",
      audience: "All",
      department: null,
      pinned: true,
      publishedAt: "Dec 15, 2025 02:30 PM",
      expiresAt: "Jan 3, 2026",
      views: 3200,
      author: "Principal Office",
      status: "active",
    },
    {
      id: 3,
      title: "Faculty Development Program Registration",
      content:
        "Registration for the upcoming Faculty Development Program on 'AI in Education' is now open. The 5-day program will be conducted from January 15-19, 2026. Interested faculty members can register through the staff portal.",
      priority: "Normal",
      audience: "Faculty",
      department: null,
      pinned: false,
      publishedAt: "Dec 14, 2025 11:00 AM",
      expiresAt: "Jan 10, 2026",
      views: 450,
      author: "Training & Development Cell",
      status: "active",
    },
    {
      id: 4,
      title: "Campus Recruitment Drive - Tech Companies",
      content:
        "Major tech companies including Google, Microsoft, Amazon, and Meta will be visiting campus for recruitment from January 20-25, 2026. Eligible students should register through the placement portal by January 10th.",
      priority: "Important",
      audience: "Students",
      department: null,
      pinned: false,
      publishedAt: "Dec 12, 2025 04:00 PM",
      expiresAt: "Jan 25, 2026",
      views: 1800,
      author: "Training & Placement Cell",
      status: "active",
    },
    {
      id: 5,
      title: "Library Timing Extended",
      content:
        "Library timing has been extended till 10 PM during the examination period. Students can use the reading rooms and digital resources. Night canteen will remain open till 9:30 PM.",
      priority: "Normal",
      audience: "All",
      department: null,
      pinned: false,
      publishedAt: "Dec 10, 2025 10:00 AM",
      expiresAt: "Dec 30, 2025",
      views: 890,
      author: "Library",
      status: "active",
    },
    {
      id: 6,
      title: "Convocation 2025 Registration",
      content:
        "Registration for Convocation 2025 is now open for graduating students of batch 2021. Please complete your registration and fee payment by December 20th. Gowns will be distributed on the day of convocation.",
      priority: "Urgent",
      audience: "Students",
      department: null,
      pinned: false,
      publishedAt: "Dec 8, 2025 09:00 AM",
      expiresAt: "Dec 20, 2025",
      views: 650,
      author: "Academic Section",
      status: "active",
    },
  ]);

  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    priority: "Normal",
    audience: "All",
    department: "",
    pinned: false,
    expiresAt: "",
  });

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

  const handleCreateNotice = () => {
    if (!newNotice.title || !newNotice.content) return;

    const notice = {
      id: notices.length + 1,
      ...newNotice,
      publishedAt: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      views: 0,
      author: "Admin",
      status: "active",
    };

    setNotices([notice, ...notices]);
    setShowCreateModal(false);
    setNewNotice({
      title: "",
      content: "",
      priority: "Normal",
      audience: "All",
      department: "",
      pinned: false,
      expiresAt: "",
    });
  };

  const handleDeleteNotice = (id) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      setNotices(notices.filter((n) => n.id !== id));
    }
  };

  const handleTogglePin = (id) => {
    setNotices(
      notices.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    );
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Normal:
        "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
      Important:
        "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
      Urgent: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400",
    };
    return colors[priority] || colors.Normal;
  };

  const getPriorityIcon = (priority) => {
    if (priority === "Urgent") return <AlertTriangle className="w-4 h-4" />;
    if (priority === "Important") return <Info className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const stats = {
    total: notices.length,
    active: notices.filter((n) => n.status === "active").length,
    pinned: notices.filter((n) => n.pinned).length,
    totalViews: notices.reduce((sum, n) => sum + n.views, 0),
  };

  // Sort notices: pinned first, then by date
  const sortedNotices = [...filteredNotices].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notices & Announcements
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage college-wide notices and announcements
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Notice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Notices
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-green-500">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.active}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
        </Card>
        <Card className="text-center border-l-4 border-l-yellow-500">
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.pinned}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pinned</p>
        </Card>
        <Card className="text-center border-l-4 border-l-blue-500">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalViews.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Views
          </p>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all" className="bg-white dark:bg-gray-800">
              All Priorities
            </option>
            {priorityOptions.map((p) => (
              <option key={p} value={p} className="bg-white dark:bg-gray-800">
                {p}
              </option>
            ))}
          </select>
          <select
            value={filterAudience}
            onChange={(e) => setFilterAudience(e.target.value)}
            className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all" className="bg-white dark:bg-gray-800">
              All Audiences
            </option>
            {audienceOptions.map((a) => (
              <option key={a} value={a} className="bg-white dark:bg-gray-800">
                {a}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Notices List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedNotices.map((notice) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card
                className={`relative overflow-hidden ${notice.pinned ? "border-l-4 border-l-yellow-500" : ""}`}
              >
                {notice.pinned && (
                  <div className="absolute top-3 right-3">
                    <Pin className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      notice.priority === "Urgent"
                        ? "bg-red-100 dark:bg-red-500/20 text-red-500"
                        : notice.priority === "Important"
                          ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-500"
                          : "bg-blue-100 dark:bg-blue-500/20 text-blue-500"
                    }`}
                  >
                    <Bell className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {notice.title}
                          </h3>
                          <span
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getPriorityColor(notice.priority)}`}
                          >
                            {getPriorityIcon(notice.priority)}
                            {notice.priority}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {notice.content}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {notice.audience}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {notice.publishedAt}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {notice.views.toLocaleString()} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Expires: {notice.expiresAt}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                  <span className="text-sm text-gray-500">
                    Posted by:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {notice.author}
                    </span>
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedNotice(notice);
                        setShowViewModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePin(notice.id)}
                      className={notice.pinned ? "text-yellow-500" : ""}
                    >
                      <Pin
                        className={`w-4 h-4 ${notice.pinned ? "fill-current" : ""}`}
                      />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      onClick={() => handleDeleteNotice(notice.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {sortedNotices.length === 0 && (
          <Card className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No notices found matching your criteria
            </p>
          </Card>
        )}
      </div>

      {/* Create Notice Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Notice"
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <Input
              placeholder="Enter notice title..."
              value={newNotice.title}
              onChange={(e) =>
                setNewNotice({ ...newNotice, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              placeholder="Write the notice content..."
              value={newNotice.content}
              onChange={(e) =>
                setNewNotice({ ...newNotice, content: e.target.value })
              }
              rows={5}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={newNotice.priority}
                onChange={(e) =>
                  setNewNotice({ ...newNotice, priority: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {priorityOptions.map((p) => (
                  <option
                    key={p}
                    value={p}
                    className="bg-white dark:bg-gray-800"
                  >
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Audience
              </label>
              <select
                value={newNotice.audience}
                onChange={(e) =>
                  setNewNotice({ ...newNotice, audience: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {audienceOptions.map((a) => (
                  <option
                    key={a}
                    value={a}
                    className="bg-white dark:bg-gray-800"
                  >
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expiry Date
            </label>
            <Input
              type="date"
              value={newNotice.expiresAt}
              onChange={(e) =>
                setNewNotice({ ...newNotice, expiresAt: e.target.value })
              }
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newNotice.pinned}
                onChange={(e) =>
                  setNewNotice({ ...newNotice, pinned: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pin this notice (will appear at the top)
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateNotice}
              disabled={!newNotice.title || !newNotice.content}
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
        onClose={() => setShowViewModal(false)}
        title={selectedNotice?.title || "Notice Details"}
        size="lg"
      >
        {selectedNotice && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full ${getPriorityColor(selectedNotice.priority)}`}
              >
                {getPriorityIcon(selectedNotice.priority)}
                {selectedNotice.priority}
              </span>
              <span className="flex items-center gap-1 text-sm px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                {selectedNotice.audience}
              </span>
              {selectedNotice.pinned && (
                <span className="flex items-center gap-1 text-sm px-3 py-1 bg-yellow-100 dark:bg-yellow-500/20 rounded-full text-yellow-600 dark:text-yellow-400">
                  <Pin className="w-4 h-4 fill-current" />
                  Pinned
                </span>
              )}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {selectedNotice.content}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Published</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedNotice.publishedAt}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Expires</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedNotice.expiresAt}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Views</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedNotice.views.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Building className="w-4 h-4" />
                  <span className="text-sm">Posted By</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedNotice.author}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
