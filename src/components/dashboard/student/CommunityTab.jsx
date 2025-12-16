"use client";

import { useState } from "react";
import { Users, Calendar, Award, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function CommunityTab() {
  const [selectedClub, setSelectedClub] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joinedClubs, setJoinedClubs] = useState([1, 3]);

  const clubs = [
    {
      id: 1,
      name: "Computer Science Club",
      description:
        "Learn, code, and innovate together. Join us for workshops, hackathons, and tech talks.",
      members: 234,
      events: 12,
      category: "Technology",
      icon: "🖥️",
      color: "from-blue-500 to-cyan-500",
      upcomingEvents: [
        {
          id: 1,
          name: "Annual Hackathon",
          date: "2025-12-25",
          participants: 50,
        },
        {
          id: 2,
          name: "Web Dev Workshop",
          date: "2025-12-22",
          participants: 30,
        },
      ],
      achievements: [
        "Winner - State Level Hackathon 2024",
        "Best Technical Club Award",
      ],
    },
    {
      id: 2,
      name: "Drama Club",
      description:
        "Express yourself through performing arts. Drama, theater, and creativity.",
      members: 156,
      events: 8,
      category: "Arts",
      icon: "🎭",
      color: "from-purple-500 to-pink-500",
      upcomingEvents: [
        { id: 1, name: "Annual Play", date: "2025-12-28", participants: 25 },
      ],
      achievements: ["Best Performance Award 2024"],
    },
    {
      id: 3,
      name: "Sports Committee",
      description:
        "Stay fit, play hard, and compete. Join various sports teams and tournaments.",
      members: 189,
      events: 15,
      category: "Sports",
      icon: "⚽",
      color: "from-green-500 to-emerald-500",
      upcomingEvents: [
        {
          id: 1,
          name: "Football Tournament",
          date: "2025-12-20",
          participants: 80,
        },
        { id: 2, name: "Cricket Match", date: "2025-12-23", participants: 45 },
      ],
      achievements: ["Inter-College Champions 2024"],
    },
    {
      id: 4,
      name: "Music Society",
      description:
        "Create harmony and rhythm. Jam sessions, concerts, and music workshops.",
      members: 142,
      events: 10,
      category: "Arts",
      icon: "🎵",
      color: "from-orange-500 to-red-500",
      upcomingEvents: [
        { id: 1, name: "Live Concert", date: "2025-12-30", participants: 100 },
      ],
      achievements: ["Best Musical Performance 2024"],
    },
    {
      id: 5,
      name: "Photography Club",
      description:
        "Capture moments, tell stories. Photography walks, exhibitions, and workshops.",
      members: 98,
      events: 6,
      category: "Arts",
      icon: "📷",
      color: "from-indigo-500 to-purple-500",
      upcomingEvents: [],
      achievements: [],
    },
    {
      id: 6,
      name: "Entrepreneurship Cell",
      description:
        "Build, launch, and grow. Startup workshops, pitch competitions, and networking.",
      members: 176,
      events: 9,
      category: "Business",
      icon: "💼",
      color: "from-yellow-500 to-orange-500",
      upcomingEvents: [
        {
          id: 1,
          name: "Startup Pitch Day",
          date: "2025-12-27",
          participants: 20,
        },
      ],
      achievements: ["Most Innovative Club 2024"],
    },
  ];

  const handleClubClick = (club) => {
    setSelectedClub(club);
    setIsModalOpen(true);
  };

  const handleJoinToggle = (clubId) => {
    if (joinedClubs.includes(clubId)) {
      setJoinedClubs(joinedClubs.filter((id) => id !== clubId));
    } else {
      setJoinedClubs([...joinedClubs, clubId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Community
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {joinedClubs.length} clubs joined
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club, index) => {
          const isJoined = joinedClubs.includes(club.id);
          return (
            <motion.div
              key={club.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card hover className="cursor-pointer relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${club.color}`}
                />
                <div className="pt-4" onClick={() => handleClubClick(club)}>
                  <div className="text-5xl mb-4 text-center">{club.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    {club.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center line-clamp-2">
                    {club.description}
                  </p>

                  <div className="flex items-center justify-around mb-4 text-sm">
                    <div className="text-center">
                      <Users className="w-5 h-5 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                      <p className="font-bold text-gray-900 dark:text-white">
                        {club.members}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Members
                      </p>
                    </div>
                    <div className="text-center">
                      <Calendar className="w-5 h-5 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                      <p className="font-bold text-gray-900 dark:text-white">
                        {club.events}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Events
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinToggle(club.id);
                  }}
                  variant={isJoined ? "secondary" : "primary"}
                  className="w-full"
                >
                  {isJoined ? "Joined ✓" : "Join Club"}
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Club Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedClub?.name}
        size="lg"
      >
        {selectedClub && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">{selectedClub.icon}</div>
              <p className="text-gray-700 dark:text-gray-300">
                {selectedClub.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedClub.members}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Members
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedClub.events}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Events
                </p>
              </div>
            </div>

            {selectedClub.upcomingEvents.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Events
                </h3>
                <div className="space-y-2">
                  {selectedClub.upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {event.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {event.date} • {event.participants} participants
                        </p>
                      </div>
                      <Button variant="outline" className="!py-2 !px-4">
                        Register
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedClub.achievements.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements
                </h3>
                <div className="space-y-2">
                  {selectedClub.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                    >
                      <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <p className="text-gray-700 dark:text-gray-300">
                        {achievement}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => handleJoinToggle(selectedClub.id)}
              variant={
                joinedClubs.includes(selectedClub.id) ? "secondary" : "primary"
              }
              className="w-full"
            >
              {joinedClubs.includes(selectedClub.id)
                ? "Leave Club"
                : "Join Club"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
