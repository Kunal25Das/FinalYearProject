"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { posts as initialPosts } from "@/lib/mockData";

export default function FeedTab() {
  const [posts, setPosts] = useState(initialPosts);
  const [likedPosts, setLikedPosts] = useState([]);

  // Lazy initialization to avoid setState in useEffect
  const [bookmarkedPosts, setBookmarkedPosts] = useState(() => {
    const savedBookmarks = localStorage.getItem("bookmarkedPosts");
    if (savedBookmarks) {
      return JSON.parse(savedBookmarks);
    }
    return [];
  });

  const [activeCommentPost, setActiveCommentPost] = useState(null);

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
    let newBookmarks;
    if (bookmarkedPosts.includes(postId)) {
      newBookmarks = bookmarkedPosts.filter((id) => id !== postId);
    } else {
      newBookmarks = [...bookmarkedPosts, postId];
    }
    setBookmarkedPosts(newBookmarks);
    localStorage.setItem("bookmarkedPosts", JSON.stringify(newBookmarks));
  };

  const handleShare = (postId) => {
    // Mock share functionality
    alert(`Shared post ${postId} to clipboard!`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Campus Feed
        </h1>
        <Button>New Post</Button>
      </div>

      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="!p-0 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-xl">
                    {post.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {post.author}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 font-normal">
                        {post.authorRole}
                      </span>
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {post.timestamp}
                    </p>
                  </div>
                </div>
                <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {post.content}
              </p>

              {post.image && (
                <div className="rounded-xl overflow-hidden mb-4">
                  {/* Image placeholder */}
                  <div className="h-64 bg-gray-200 dark:bg-gray-800 w-full" />
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/5">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      likedPosts.includes(post.id)
                        ? "text-red-500"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        likedPosts.includes(post.id) ? "fill-current" : ""
                      }`}
                    />
                    {post.likes}
                  </button>
                  <button
                    onClick={() =>
                      setActiveCommentPost(
                        activeCommentPost === post.id ? null : post.id,
                      )
                    }
                    className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {post.comments}
                  </button>
                  <button
                    onClick={() => handleShare(post.id)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
                <button
                  onClick={() => handleBookmark(post.id)}
                  className={`transition-colors ${
                    bookmarkedPosts.includes(post.id)
                      ? "text-yellow-500"
                      : "text-gray-400 hover:text-yellow-500"
                  }`}
                >
                  <Bookmark
                    className={`w-5 h-5 ${
                      bookmarkedPosts.includes(post.id) ? "fill-current" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
              {activeCommentPost === post.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-gray-100 dark:bg-black/20 border-t border-gray-200 dark:border-white/5"
                >
                  <div className="p-4 space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-sm text-violet-600 dark:text-violet-300">
                        ME
                      </div>
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Write a comment..."
                          className="!bg-gray-200 dark:!bg-white/5 !border-transparent pr-10"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-500 dark:text-violet-400 hover:text-violet-600 dark:hover:text-violet-300">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {/* Mock Comments */}
                    <div className="space-y-3 pl-11">
                      <div className="bg-gray-200 dark:bg-white/5 rounded-lg p-3">
                        <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                          Alice Cooper
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Cannot wait for this! 🔥
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <button className="hover:text-gray-900 dark:hover:text-white">
                            Like
                          </button>
                          <button className="hover:text-gray-900 dark:hover:text-white">
                            Reply
                          </button>
                          <button className="hover:text-gray-900 dark:hover:text-white">
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
