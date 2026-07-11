"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function HappeningsTab() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState("All Categories");
  const [happenings, setHappenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/student/happenings");
      const data = await res.json();
      if (data.success) {
        setHappenings(data.happenings);
      }
    } catch (err) {
      console.error("Failed to load happenings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredHappenings =
    filter === "All Categories"
      ? happenings
      : happenings.filter((h) => h.category === filter);

  const handleRegister = async (eventId) => {
    setRegistering(true);
    try {
      const res = await fetch("/api/student/happenings/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (data.success) {
        setHappenings((prev) =>
          prev.map((h) =>
            h.id === eventId ? { ...h, isRegistered: true } : h,
          ),
        );
        if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent((prev) => ({ ...prev, isRegistered: true }));
        }
      } else {
        alert(data.error || "Failed to register for event");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred during registration");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500">Loading campus happenings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Happenings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with the latest events and opportunities.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-violet-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option className="bg-white dark:bg-gray-900">
              All Categories
            </option>
            <option className="bg-white dark:bg-gray-900">Event</option>
            <option className="bg-white dark:bg-gray-900">Competition</option>
            <option className="bg-white dark:bg-gray-900">Festival</option>
            <option className="bg-white dark:bg-gray-900">Career</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filteredHappenings.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer group"
            onClick={() => setSelectedEvent(item)}
          >
            <div
              className={`h-48 ${item.image} relative p-6 flex flex-col justify-end group-hover:scale-105 transition-transform duration-500`}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <span className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                {item.category}
              </span>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {item.title}
                </h3>
                <div className="flex items-center gap-4 text-white/90 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {item.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {item.location}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-[#0a0a0a] relative z-20">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {item.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {item.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-md bg-gray-200 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/5">
                <span className="text-sm text-gray-500">
                  By {item.organizer}
                </span>
                <span className="text-violet-500 dark:text-violet-400 text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Details <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Event Details Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || "Event Details"}
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-6">
            <div
              className={`h-48 rounded-xl ${selectedEvent.image} relative overflow-hidden flex items-end p-6`}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 text-white">
                <span className="inline-block px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-xs font-medium border border-white/10 mb-2">
                  {selectedEvent.category}
                </span>
                <h2 className="text-3xl font-bold">{selectedEvent.title}</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    About Event
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/5 text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-4">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Calendar className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium">{selectedEvent.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Clock className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="font-medium">{selectedEvent.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <MapPin className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-medium">{selectedEvent.location}</p>
                    </div>
                  </div>

                  <Button
                    className={`w-full mt-2 ${selectedEvent.isRegistered ? "!bg-green-600 hover:!bg-green-700" : ""}`}
                    onClick={() => handleRegister(selectedEvent.id)}
                    disabled={selectedEvent.isRegistered || registering}
                  >
                    {selectedEvent.isRegistered ? (
                      <>
                        Registered <CheckCircle className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        {registering ? "Registering..." : "Register Now"}{" "}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <p className="text-xs text-gray-500 mb-1">Organized by</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedEvent.organizer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
