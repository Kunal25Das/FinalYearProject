"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Tag, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export default function HappeningsTab() {
  const happenings = [
    {
      id: 1,
      title: "Tech Symposium 2025",
      category: "Event",
      date: "Dec 20, 2025",
      time: "10:00 AM",
      location: "Main Auditorium",
      description:
        "Join us for the annual Tech Symposium featuring industry leaders and innovative projects.",
      image: "bg-linear-to-br from-blue-500 to-purple-600",
      tags: ["Tech", "Networking", "Innovation"],
    },
    {
      id: 2,
      title: "Hackathon: Code for Good",
      category: "Competition",
      date: "Jan 15, 2026",
      time: "09:00 AM",
      location: "Innovation Hub",
      description:
        "48-hour hackathon to build solutions for social impact. Great prizes to be won!",
      image: "bg-linear-to-br from-green-500 to-emerald-600",
      tags: ["Coding", "Social Impact", "Prizes"],
    },
    {
      id: 3,
      title: "Cultural Fest: Aura",
      category: "Festival",
      date: "Feb 10, 2026",
      time: "05:00 PM",
      location: "College Ground",
      description:
        "A night of music, dance, and celebration. Don't miss the star performance!",
      image: "bg-linear-to-br from-pink-500 to-rose-600",
      tags: ["Music", "Dance", "Fun"],
    },
    {
      id: 4,
      title: "Career Fair 2026",
      category: "Career",
      date: "Mar 05, 2026",
      time: "11:00 AM",
      location: "Convention Center",
      description:
        "Meet top recruiters and explore internship and job opportunities.",
      image: "bg-linear-to-br from-orange-500 to-yellow-600",
      tags: ["Jobs", "Internships", "Networking"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Happenings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with the latest events and opportunities.
          </p>
        </div>
        <div className="flex gap-2">
          <select className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm">
            <option>All Categories</option>
            <option>Events</option>
            <option>Competitions</option>
            <option>Workshops</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {happenings.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div
              className={`h-48 ${item.image} relative p-6 flex flex-col justify-end`}
            >
              <span className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                {item.category}
              </span>
              <h3 className="text-2xl font-bold text-white mb-2">
                {item.title}
              </h3>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {item.date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {item.time}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {item.location}
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                {item.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <Button className="w-full group">
                View Details
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
