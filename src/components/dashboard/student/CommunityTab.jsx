"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Calendar, Award, Search, Filter, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { motion } from "framer-motion";

export default function CommunityTab() {
  const [selectedClub, setSelectedClub] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingClubId, setProcessingClubId] = useState(null);

  const loadClubs = useCallback(async () => {
    try {
      const res = await fetch("/api/student/clubs");
      const data = await res.json();
      if (data.success) {
        setClubs(data.clubs || []);

        // Keep selectedClub in sync if open
        if (selectedClub) {
          const updated = data.clubs.find((c) => c.id === selectedClub.id);
          if (updated) {
            setSelectedClub(updated);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load clubs list:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedClub]);

  useEffect(() => {
    loadClubs();
  }, [loadClubs]);

  const handleJoinToggle = async (clubId, membershipStatus) => {
    setProcessingClubId(clubId);
    const isJoinedOrPending =
      membershipStatus === "approved" || membershipStatus === "pending";
    const action = isJoinedOrPending ? "leave" : "join";

    try {
      const res = await fetch("/api/student/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId, action }),
      });
      const data = await res.json();
      if (data.success) {
        // Trigger reload
        await loadClubs();
      } else {
        alert(data.error || "Failed to process request");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred. Please try again.");
    } finally {
      setProcessingClubId(null);
    }
  };

  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500">Loading campus clubs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Communities
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find your tribe and grow together
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search clubs..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="!px-3">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map((club, index) => (
          <motion.div
            key={club.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="h-full flex flex-col hover:border-white/20 transition-colors group cursor-pointer"
              onClick={() => setSelectedClub(club)}
            >
              <div
                className={`h-24 rounded-t-xl bg-linear-to-r ${club.color} -mx-6 -mt-6 mb-4 relative overflow-visible`}
              >
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-xl bg-gray-200 dark:bg-[#0a0a0a] border-4 border-gray-200 dark:border-[#0a0a0a] flex items-center justify-center text-3xl shadow-lg z-10">
                  {club.icon}
                </div>
              </div>

              <div className="mt-4 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors">
                    {club.name}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5">
                    {club.category}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 font-light">
                  {club.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {club.members}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {club.events} Events
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/5 flex gap-2">
                <Button
                  className="flex-1"
                  variant={
                    club.membershipStatus === "approved" ||
                    club.membershipStatus === "pending"
                      ? "outline"
                      : "primary"
                  }
                  disabled={processingClubId === club.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinToggle(club.id, club.membershipStatus);
                  }}
                >
                  {processingClubId === club.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-purple-600" />
                  ) : club.membershipStatus === "approved" ? (
                    "Joined"
                  ) : club.membershipStatus === "pending" ? (
                    "Pending Approval"
                  ) : (
                    "Join Club"
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Club Details Modal */}
      <Modal
        isOpen={!!selectedClub}
        onClose={() => setSelectedClub(null)}
        title={selectedClub?.name || "Club Details"}
        size="lg"
      >
        {selectedClub && (
          <div className="space-y-6">
            <div
              className={`h-32 rounded-xl bg-linear-to-r ${selectedClub.color} relative overflow-hidden flex items-center justify-center`}
            >
              <div className="text-6xl">{selectedClub.icon}</div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    About
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                    {selectedClub.description}
                  </p>
                </div>

                {selectedClub.achievements &&
                  selectedClub.achievements.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                        Achievements
                      </h3>
                      <div className="space-y-2">
                        {selectedClub.achievements.map((achievement, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5"
                          >
                            <Award className="w-5 h-5 text-yellow-500" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                              {achievement}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Members
                    </span>
                    <span className="text-gray-900 dark:text-white font-bold">
                      {selectedClub.members}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Events
                    </span>
                    <span className="text-gray-900 dark:text-white font-bold">
                      {selectedClub.events}
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    variant={
                      selectedClub.membershipStatus === "approved" ||
                      selectedClub.membershipStatus === "pending"
                        ? "outline"
                        : "primary"
                    }
                    disabled={processingClubId === selectedClub.id}
                    onClick={() =>
                      handleJoinToggle(
                        selectedClub.id,
                        selectedClub.membershipStatus,
                      )
                    }
                  >
                    {processingClubId === selectedClub.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto text-purple-600" />
                    ) : selectedClub.membershipStatus === "approved" ? (
                      "Leave Club"
                    ) : selectedClub.membershipStatus === "pending" ? (
                      "Cancel Join Request"
                    ) : (
                      "Join Now"
                    )}
                  </Button>
                </div>

                {selectedClub.upcomingEvents &&
                  selectedClub.upcomingEvents.length > 0 && (
                    <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">
                        Upcoming Events
                      </h4>
                      <div className="space-y-3">
                        {selectedClub.upcomingEvents.map((event) => (
                          <div
                            key={event.id}
                            className="text-sm border-b border-gray-200 dark:border-white/5 pb-2 last:border-0 last:pb-0"
                          >
                            <p className="text-gray-900 dark:text-white font-medium">
                              {event.name}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {event.date}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
