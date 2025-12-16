"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Bookmark,
  Heart,
  MessageCircle,
  Users,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { posts, clubs } from "@/lib/mockData";

export default function ProfileTab() {
  const [activeSection, setActiveSection] = useState("bookmarks");

  // Lazy initialization to avoid setState in useEffect
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
      // Default communities if none saved
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

  // Mock user data
  const user = {
    name: "Test Student",
    role: "Student",
    email: "student@university.edu",
    phone: "+1 234 567 890",
    department: "Computer Science",
    semester: "6th Semester",
    avatar: "👨‍🎓",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        My Profile
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 h-fit">
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
                <Mail className="w-4 h-4" />
                {user.email}
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                <Phone className="w-4 h-4" />
                {user.phone}
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                {user.semester}
              </div>
            </div>

            <Button variant="outline" className="w-full mt-6">
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
                  <Card className="!p-4">
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
                  <Card className="!p-4 hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg bg-linear-to-r ${club.color} flex items-center justify-center text-2xl`}
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
    </div>
  );
}
