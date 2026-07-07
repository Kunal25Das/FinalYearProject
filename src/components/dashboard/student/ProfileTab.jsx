"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Bookmark,
  Heart,
  MessageCircle,
  Users,
  Loader2,
  Building,
  Globe,
  Activity,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { motion } from "framer-motion";
import { posts, clubs } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext.jsx";

export default function ProfileTab() {
  const { user: authUser, updateSession } = useAuth();
  const [activeSection, setActiveSection] = useState("bookmarks");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // States for College Admin
  const [collegeDetails, setCollegeDetails] = useState(null);
  const [adminActivities, setAdminActivities] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: authUser?.name || "",
    phone: authUser?.phone || "",
  });

  const [bookmarkedPosts] = useState(() => {
    const savedBookmarks = localStorage.getItem("bookmarkedPosts");
    if (savedBookmarks) {
      const bookmarkIds = JSON.parse(savedBookmarks);
      return posts.filter((post) => bookmarkIds.includes(post.id));
    }
    return [];
  });

  const [myCommunities] = useState(() => {
    const savedClubs = localStorage.getItem("joinedClubs");
    if (savedClubs) {
      const clubIds = JSON.parse(savedClubs);
      const filteredClubs = clubs.filter((club) => clubIds.includes(club.id));
      return filteredClubs.map((club) => ({
        ...club,
        role: "Member",
      }));
    } else {
      const defaultClubIds = [1, 3];
      const filteredClubs = clubs.filter((club) =>
        defaultClubIds.includes(club.id),
      );
      return filteredClubs.map((club) => ({
        ...club,
        role: "Member",
      }));
    }
  });

  // Fetch stats details if current user is college-admin
  useEffect(() => {
    const fetchAdminStats = async () => {
      if (authUser?.role !== "college-admin") return;
      setAdminLoading(true);
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (res.ok && data.data) {
          setCollegeDetails(data.data.college);
          setAdminActivities(data.data.recentActivities || []);
        }
      } catch (err) {
        console.error("Failed to load admin stats in profile:", err);
      } finally {
        setAdminLoading(false);
      }
    };

    fetchAdminStats();
  }, [authUser]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Instantly update Next-Auth session
      await updateSession({
        name: formData.name,
        phone: formData.phone,
      });

      setShowEditModal(false);
    } catch (err) {
      alert(err.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 86400);

    if (interval >= 1) return `${interval} d ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} h ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} m ago`;
    return "just now";
  };

  // Render Admin Specific Profile Tab
  if (authUser?.role === "college-admin") {
    const collegeName = collegeDetails?.name || "College Administration";
    const collegeCode = collegeDetails?.code || "ADMIN";

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          System Administration Profile
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1 h-fit border border-gray-200 dark:border-white/10">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center text-4xl mb-4 border-2 border-purple-500/30">
                🏛️
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {authUser?.name || "College Admin"}
              </h2>
              <p className="text-purple-500 dark:text-purple-400 text-sm mb-4 font-semibold uppercase tracking-wider">
                College Administrator
              </p>

              <div className="w-full space-y-3 text-left mt-4 pt-4 border-t border-gray-200 dark:border-white/5">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{authUser?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{authUser?.phone || "+91 98765 43210"}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="truncate">
                    {collegeName}
                    {collegeCode && collegeCode !== collegeName
                      ? ` (${collegeCode})`
                      : ""}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: authUser?.name || "",
                    phone: authUser?.phone || "",
                  });
                  setShowEditModal(true);
                }}
                className="w-full mt-6 border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Edit Profile
              </Button>
            </div>
          </Card>

          {/* Admin Panels */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex gap-4 border-b border-gray-200 dark:border-white/10 pb-2">
              <button
                onClick={() => setActiveSection("bookmarks")} // using bookmarks state as tab 1
                className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                  activeSection === "bookmarks"
                    ? "text-purple-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Institute Profile
                {activeSection === "bookmarks" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                  />
                )}
              </button>

              <button
                onClick={() => setActiveSection("communities")} // using communities state as tab 2
                className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                  activeSection === "communities"
                    ? "text-purple-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Audit & Activity Logs
                {activeSection === "communities" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                  />
                )}
              </button>
            </div>

            {/* Tab 1: College profile details */}
            {activeSection === "bookmarks" && (
              <div className="space-y-4">
                {adminLoading ? (
                  <div className="py-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
                  </div>
                ) : (
                  <Card className="border border-gray-200 dark:border-white/10 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-400 uppercase">
                        College Name
                      </h3>
                      <p className="text-lg text-white font-semibold mt-1">
                        {collegeName}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" />
                          <span>Website URL</span>
                        </h4>
                        <a
                          href={collegeDetails?.website || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-400 hover:underline text-sm block mt-1"
                        >
                          {collegeDetails?.website || "https://university.edu"}
                        </a>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Address</span>
                        </h4>
                        <p className="text-gray-300 text-sm mt-1">
                          {collegeDetails?.address || "University Campus Lane"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5 text-center">
                      <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <span className="block text-2xl font-bold text-purple-400">
                          {collegeDetails?.totalStudents || 0}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">
                          Students
                        </span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <span className="block text-2xl font-bold text-purple-400">
                          {collegeDetails?.totalFaculty || 0}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">
                          Faculty
                        </span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <span className="block text-2xl font-bold text-purple-400">
                          {collegeDetails?.departments || 1}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">
                          Departments
                        </span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Tab 2: Activity logs */}
            {activeSection === "communities" && (
              <Card className="border border-gray-200 dark:border-white/10 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <span>Administrative Action Logs</span>
                </h3>

                <div className="space-y-3.5">
                  {adminActivities.length === 0 ? (
                    <p className="text-center py-6 text-gray-500 text-sm">
                      No actions logged yet.
                    </p>
                  ) : (
                    adminActivities.map((act) => (
                      <div
                        key={act._id}
                        className="flex items-center justify-between text-sm py-2 border-b border-white/5"
                      >
                        <div>
                          <p className="font-semibold text-white">
                            {act.action}
                          </p>
                          <p className="text-xs text-gray-500">{act.details}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(act.createdAt)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Update Profile Information"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="bg-white/5 border-white/10 text-white focus:border-purple-500"
            />

            <Input
              label="Phone Number"
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white focus:border-purple-500"
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="bg-purple-600 hover:bg-purple-700"
                disabled={editLoading}
              >
                {editLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  // Fallback / Standard student profile tab
  const user = {
    name: authUser?.name || "Test User",
    role: authUser?.role
      ? authUser.role.charAt(0).toUpperCase() + authUser.role.slice(1)
      : "Student",
    email: authUser?.email || "student@university.edu",
    phone: authUser?.phone || "+91 98765 43210",
    department: authUser?.department || "Computer Science",
    semester: authUser?.rollNo
      ? `Roll No: ${authUser.rollNo}`
      : "Regular Member",
    avatar:
      authUser?.role === "student"
        ? "👨‍🎓"
        : authUser?.role === "faculty"
          ? "👩‍🏫"
          : "👤",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        My Profile
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 h-fit border border-gray-200 dark:border-white/10">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-violet-500/20 flex items-center justify-center text-4xl mb-4 border-2 border-violet-500/30">
              {user.avatar}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {user.name}
            </h2>
            <p className="text-violet-500 dark:text-violet-400 text-sm mb-4">
              {user.role} • {user.department}
            </p>

            <div className="w-full space-y-3 text-left mt-4 pt-4 border-t border-gray-200 dark:border-white/5">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{user.semester}</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setFormData({
                  name: authUser?.name || "",
                  phone: authUser?.phone || "",
                });
                setShowEditModal(true);
              }}
              className="w-full mt-6 border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 dark:border-white/10 pb-2">
            <button
              onClick={() => setActiveSection("bookmarks")}
              className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                activeSection === "bookmarks"
                  ? "text-violet-500 dark:text-violet-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Bookmarks
              {activeSection === "bookmarks" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400"
                />
              )}
            </button>
            <button
              onClick={() => setActiveSection("communities")}
              className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                activeSection === "communities"
                  ? "text-violet-500 dark:text-violet-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              My Communities
              {activeSection === "communities" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400"
                />
              )}
            </button>
            <button
              onClick={() => setActiveSection("activity")}
              className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                activeSection === "activity"
                  ? "text-violet-500 dark:text-violet-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Activity
              {activeSection === "activity" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400"
                />
              )}
            </button>
          </div>

          {/* Bookmarks List */}
          {activeSection === "bookmarks" && (
            <div className="space-y-4">
              {bookmarkedPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="!p-4 border border-gray-200 dark:border-white/5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-xl shrink-0">
                        {post.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                              {post.author}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {post.timestamp}
                            </p>
                          </div>
                          <Bookmark className="w-4 h-4 text-yellow-500 fill-current" />
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mt-2 mb-3">
                          {post.content}
                        </p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />{" "}
                            {post.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {bookmarkedPosts.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No bookmarks yet
                </div>
              )}
            </div>
          )}

          {/* Communities List */}
          {activeSection === "communities" && (
            <div className="grid gap-4">
              {myCommunities.map((club) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="!p-4 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-r ${club.color} flex items-center justify-center text-2xl`}
                      >
                        {club.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {club.name}
                          </h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5">
                            {club.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
                          <span>{club.category}</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {club.members} Members
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {myCommunities.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  Not joined any communities yet
                </div>
              )}
            </div>
          )}

          {activeSection === "activity" && (
            <div className="text-center py-10 text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Update Profile Information"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white focus:border-purple-500"
          />

          <Input
            label="Phone Number"
            type="text"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="bg-white/5 border-white/10 text-white focus:border-purple-500"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={editLoading}
            >
              {editLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
