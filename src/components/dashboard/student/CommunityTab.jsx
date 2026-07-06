"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  Award,
  Search,
  Filter,
  Loader2,
  Clock,
  CheckCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { motion } from "framer-motion";
import { clubService } from "@/lib/services/clubService";
import { clubRequestService } from "@/lib/services/clubRequestService";
import { useAuth } from "@/contexts/AuthContext";

export default function CommunityTab() {
  const { user, userProfile } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [requestStatuses, setRequestStatuses] = useState({});
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const allClubs = await clubService.listAll();
        setClubs(allClubs);

        if (userProfile?.joinedClubs) {
          setJoinedClubs(userProfile.joinedClubs);
        }

        if (user?.$id && allClubs.length > 0) {
          const statusMap = {};
          await Promise.all(
            allClubs.map(async (club) => {
              const req = await clubRequestService.getStudentRequest(
                club.$id,
                user.$id,
              );
              if (req) statusMap[club.$id] = req.status;
            }),
          );
          setRequestStatuses(statusMap);
        }
      } catch (err) {
        console.error("Failed to load clubs:", err);
      } finally {
        setLoadingClubs(false);
      }
    };
    load();
  }, [userProfile, user]);

  const handleJoinRequest = async (club) => {
    if (!user || !userProfile) return;
    setActionId(club.$id);
    try {
      await clubRequestService.sendRequest({
        clubId: club.$id,
        clubName: club.name,
        studentId: user.$id,
        studentName: user.name,
        studentEmail: user.email,
      });
      setRequestStatuses((prev) => ({ ...prev, [club.$id]: "pending" }));
    } catch (err) {
      console.error("Join request failed:", err.message);
      alert(err.message);
    } finally {
      setActionId(null);
    }
  };

  const getButtonLabel = (clubId) => {
    if (joinedClubs.includes(clubId)) return "Joined";
    const status = requestStatuses[clubId];
    if (status === "pending") return "Requested";
    if (status === "approved") return "Joined";
    return "Join Club";
  };

  const isButtonDisabled = (clubId) => {
    return (
      actionId === clubId ||
      joinedClubs.includes(clubId) ||
      requestStatuses[clubId] === "pending" ||
      requestStatuses[clubId] === "approved"
    );
  };

  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loadingClubs) {
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
          <Button variant="outline" className="px-3">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {filteredClubs.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No clubs found. Check back after an admin approves some!
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map((club, index) => (
          <motion.div
            key={club.$id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="h-full flex flex-col hover:border-white/20 transition-colors group cursor-pointer"
              onClick={() => {
                setSelectedClub(club);
              }}
            >
              <div
                className={`h-24 rounded-t-xl bg-linear-to-r ${club.color} -mx-6 -mt-6 mb-4 relative overflow-visible`}
              >
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-xl bg-[#0a0a0a] border-4 border-[#0a0a0a] flex items-center justify-center text-3xl shadow-lg z-10">
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

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {club.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {club.memberCount} Members
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {club.eventCount} Events
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/5 flex gap-2">
                <Button
                  className="w-full"
                  variant={
                    joinedClubs.includes(club.$id) ||
                    requestStatuses[club.$id] === "approved"
                      ? "outline"
                      : requestStatuses[club.$id] === "pending"
                        ? "ghost"
                        : "primary"
                  }
                  disabled={isButtonDisabled(club.$id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinRequest(club);
                  }}
                >
                  {actionId === club.$id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : requestStatuses[club.$id] === "pending" ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Requested to join
                    </>
                  ) : (
                    getButtonLabel(club.$id)
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
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {selectedClub.description}
                  </p>
                </div>

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
                        <span className="text-gray-700 dark:text-gray-300">
                          {achievement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Members
                    </span>
                    <span className="text-gray-900 dark:text-white font-bold">
                      {selectedClub.memberCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Events
                    </span>
                    <span className="text-gray-900 dark:text-white font-bold">
                      {selectedClub.eventCount}
                    </span>
                  </div>
                </div>

                {requestStatuses[selectedClub.$id] === "pending" ? (
                  <div className="w-full py-2 px-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm text-center flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" /> Request Pending
                  </div>
                ) : joinedClubs.includes(selectedClub.$id) ? (
                  <div className="w-full py-2 px-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm text-center flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> You are a member
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleJoinRequest(selectedClub)}
                  >
                    Join Now
                  </Button>
                )}

                {selectedClub.eventCount > 0 && (
                  <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                      Upcoming Events
                    </h4>
                    <div className="space-y-3">
                      {/* {selectedClub.upcomingEvents.map((event) => (
                        <div key={event.$id} className="text-sm">
                          <p className="text-gray-900 dark:text-white font-medium">
                            {event.name}
                          </p>
                          <p className="text-gray-500">{event.date}</p>
                        </div>
                      ))} */}
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
