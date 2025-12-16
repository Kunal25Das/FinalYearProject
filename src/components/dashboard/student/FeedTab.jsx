"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Card from "@/components/ui/Card";
import { motion } from "framer-motion";

export default function FeedTab() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Computer Science Club",
      authorRole: "Club",
      avatar: "🖥️",
      content:
        "Excited to announce our upcoming Hackathon! Register now and win amazing prizes. Limited slots available!",
      image: null,
      likes: 45,
      comments: 12,
      timestamp: "2 hours ago",
      type: "event",
    },
    {
      id: 2,
      author: "College Admin",
      authorRole: "Admin",
      avatar: "🏛️",
      content:
        "Important: Final exams schedule has been released. Please check your student portal for details.",
      image: null,
      likes: 89,
      comments: 23,
      timestamp: "5 hours ago",
      type: "announcement",
    },
    {
      id: 3,
      author: "Sports Committee",
      authorRole: "Club",
      avatar: "⚽",
      content:
        "Inter-college football tournament next week! Come support your team. Match starts at 3 PM at the main ground.",
      image: null,
      likes: 67,
      comments: 18,
      timestamp: "1 day ago",
      type: "event",
    },
    {
      id: 4,
      author: "Career Development Cell",
      authorRole: "Committee",
      avatar: "💼",
      content:
        "Microsoft is coming to campus for placements! Interested students should register before Dec 20th.",
      image: null,
      likes: 134,
      comments: 45,
      timestamp: "2 days ago",
      type: "opportunity",
    },
  ]);

  const [likedPosts, setLikedPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);

  const handleLike = (postId) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter((id) => id !== postId));
      setPosts(
        posts.map((post) =>
          post.id === postId ? { ...post, likes: post.likes - 1 } : post,
        ),
      );
    } else {
      setLikedPosts([...likedPosts, postId]);
      setPosts(
        posts.map((post) =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post,
        ),
      );
    }
  };

  const handleBookmark = (postId) => {
    if (bookmarkedPosts.includes(postId)) {
      setBookmarkedPosts(bookmarkedPosts.filter((id) => id !== postId));
    } else {
      setBookmarkedPosts([...bookmarkedPosts, postId]);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "event":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      case "announcement":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
      case "opportunity":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Feed
        </h1>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Latest updates
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover>
              <div className="flex items-start gap-4">
                <div className="text-4xl">{post.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {post.author}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {post.authorRole} • {post.timestamp}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(post.type)}`}
                    >
                      {post.type}
                    </span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {post.content}
                  </p>

                  {post.image && (
                    <Image
                      src={post.image}
                      alt="Post"
                      width={800}
                      height={400}
                      className="w-full rounded-lg mb-4"
                    />
                  )}

                  <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 transition-colors ${
                        likedPosts.includes(post.id)
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-600 dark:text-gray-400 hover:text-red-600"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${likedPosts.includes(post.id) ? "fill-current" : ""}`}
                      />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </button>

                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {post.comments}
                      </span>
                    </button>

                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors">
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm font-medium">Share</span>
                    </button>

                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`ml-auto flex items-center gap-2 transition-colors ${
                        bookmarkedPosts.includes(post.id)
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-gray-600 dark:text-gray-400 hover:text-yellow-600"
                      }`}
                    >
                      <Bookmark
                        className={`w-5 h-5 ${bookmarkedPosts.includes(post.id) ? "fill-current" : ""}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
