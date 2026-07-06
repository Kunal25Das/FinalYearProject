"use client";

import { useState, useEffect } from "react";
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
import { eventService } from "@/lib/services/eventService";
import { eventRequestService } from "@/lib/services/eventRequestService";
import { useAuth } from "@/contexts/AuthContext";

export default function HappeningsTab() {
  const { user, userProfile } = useAuth();
  const [happenings, setHappenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState("All Categories");
  const [requestStatuses, setRequestStatuses] = useState({});
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const events = await eventService.listAll();
        setHappenings(events);

        if (user?.$id && events.length > 0) {
          const statusMap = {};
          await Promise.all(
            events.map(async (event) => {
              const req = await eventRequestService.getStudentRequest(
                event.$id,
                user.$id,
              );
              if (req) statusMap[event.$id] = req.status;
            }),
          );
          setRequestStatuses(statusMap);
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.$id]);

  const handleRegisterRequest = async (event) => {
    if (!user || !userProfile) return;
    setActionId(event.$id);
    try {
      await eventRequestService.sendRequest({
        clubId: event.clubId,
        eventId: event.$id,
        eventName: event.title,
        studentId: user.$id,
        studentName: user.name,
        studentEmail: user.email,
      });
      setRequestStatuses((prev) => ({ ...prev, [event.$id]: "pending" }));
    } catch (err) {
      console.error("Event joining request failed:", err.message);
      alert(err.message);
    } finally {
      setActionId(null);
    }
  };

  const isButtonDisabled = (eventId) => {
    return (
      actionId === eventId ||
      requestStatuses[eventId] === "pending" ||
      requestStatuses[eventId] === "accepted"
    );
  };

  const filteredHappenings =
    filter === "All Categories"
      ? happenings
      : happenings.filter((h) => h.status === filter.toLowerCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
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
            <option className="bg-white dark:bg-gray-900">Upcoming</option>
            <option className="bg-white dark:bg-gray-900">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filteredHappenings.map((item, index) => (
          <motion.div
            key={item.$id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer group"
            onClick={() => setSelectedEvent(item)}
          >
            <div className="h-48 bg-gradient-to-br from-violet-600 to-indigo-600 relative p-6 flex flex-col justify-end">
              <div className="absolute inset-0 bg-black/20" />
              <span className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10 capitalize">
                {item.status}
              </span>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {item.title}
                </h3>
                <div className="flex items-center gap-4 text-white/90 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.date).toLocaleDateString()}
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
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/5">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {item.time}
                </div>
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
            <div className="h-48 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 relative overflow-hidden flex items-end p-6">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 text-white">
                <span className="inline-block px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-xs font-medium border border-white/10 mb-2 capitalize">
                  {selectedEvent.status}
                </span>
                <h2 className="text-3xl font-bold">{selectedEvent.title}</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  About Event
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-4">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Calendar className="w-5 h-5 text-violet-500" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium">
                        {new Date(selectedEvent.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Clock className="w-5 h-5 text-violet-500" />
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="font-medium">{selectedEvent.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <MapPin className="w-5 h-5 text-violet-500" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-medium">{selectedEvent.location}</p>
                    </div>
                  </div>

                  <Button
                    className={`w-full mt-2 ${
                      requestStatuses[selectedEvent.$id] === "accepted"
                        ? "!bg-green-600 hover:!bg-green-700"
                        : ""
                    }`}
                    onClick={() => handleRegisterRequest(selectedEvent)}
                    disabled={isButtonDisabled(selectedEvent.$id)}
                  >
                    {actionId === selectedEvent.$id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : requestStatuses[selectedEvent.$id] === "pending" ? (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Registration Request Sent
                      </>
                    ) : requestStatuses[selectedEvent.$id] === "accepted" ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Registration Accepted
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Register Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
