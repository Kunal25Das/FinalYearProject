"use client";

import { useState } from "react";
import {
  Search,
  Users,
  Coins,
  Filter,
  CheckCircle,
  Plus,
  X,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function VolunteersTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [awardAmount, setAwardAmount] = useState(10);
  const [awardReason, setAwardReason] = useState("");

  const events = [
    { id: "all", name: "All Events" },
    { id: "1", name: "Hackathon 2025" },
    { id: "2", name: "Tech Talk: AI" },
    { id: "3", name: "Coding Workshop" },
  ];

  const [volunteers, setVolunteers] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@example.com",
      role: "Coordinator",
      event: "Hackathon 2025",
      eventId: "1",
      tasks: ["Registration Desk", "Technical Support"],
      coinsEarned: 50,
      status: "active",
    },
    {
      id: 2,
      name: "Priya Singh",
      email: "priya@example.com",
      role: "Volunteer",
      event: "Hackathon 2025",
      eventId: "1",
      tasks: ["Food & Refreshments"],
      coinsEarned: 25,
      status: "active",
    },
    {
      id: 3,
      name: "Amit Kumar",
      email: "amit@example.com",
      role: "Team Lead",
      event: "Tech Talk: AI",
      eventId: "2",
      tasks: ["AV Setup", "Guest Coordination"],
      coinsEarned: 35,
      status: "active",
    },
    {
      id: 4,
      name: "Sneha Patel",
      email: "sneha@example.com",
      role: "Volunteer",
      event: "Coding Workshop",
      eventId: "3",
      tasks: ["Participant Support"],
      coinsEarned: 20,
      status: "completed",
    },
  ]);

  const availableMembers = [
    { id: 101, name: "Neha Gupta", email: "neha@example.com" },
    { id: 102, name: "Vikram Joshi", email: "vikram@example.com" },
    { id: 103, name: "Ananya Roy", email: "ananya@example.com" },
  ];

  const roles = ["Volunteer", "Coordinator", "Team Lead"];

  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch =
      volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEvent =
      selectedEvent === "all" || volunteer.eventId === selectedEvent;
    return matchesSearch && matchesEvent;
  });

  const handleAwardCoins = () => {
    if (selectedVolunteer && awardAmount > 0) {
      setVolunteers(
        volunteers.map((v) =>
          v.id === selectedVolunteer.id
            ? { ...v, coinsEarned: v.coinsEarned + awardAmount }
            : v,
        ),
      );
      setShowAwardModal(false);
      setSelectedVolunteer(null);
      setAwardAmount(10);
      setAwardReason("");
    }
  };

  const handleRemoveVolunteer = (volunteerId) => {
    setVolunteers(volunteers.filter((v) => v.id !== volunteerId));
  };

  const handleChangeRole = (volunteerId, newRole) => {
    setVolunteers(
      volunteers.map((v) =>
        v.id === volunteerId ? { ...v, role: newRole } : v,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Volunteer Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Assign roles and manage volunteers for your events
          </p>
        </div>
        <Button onClick={() => setShowAssignModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Assign Volunteer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {volunteers.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Volunteers
          </p>
        </Card>
        <Card className="text-center">
          <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {volunteers.filter((v) => v.status === "active").length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
        </Card>
        <Card className="text-center">
          <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center mx-auto mb-2">
            <Coins className="w-6 h-6 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {volunteers.reduce((sum, v) => sum + v.coinsEarned, 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Coins Awarded
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search volunteers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {events.map((event) => (
                <option
                  key={event.id}
                  value={event.id}
                  className="bg-white dark:bg-gray-800"
                >
                  {event.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Volunteers List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredVolunteers.map((volunteer, index) => (
            <motion.div
              key={volunteer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {volunteer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {volunteer.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {volunteer.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            volunteer.status === "active"
                              ? "bg-green-500/20 text-green-600 dark:text-green-400"
                              : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {volunteer.status === "active"
                            ? "Active"
                            : "Completed"}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {volunteer.event}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Coins className="w-4 h-4" />
                        <span className="font-medium">
                          {volunteer.coinsEarned}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        coins earned
                      </p>
                    </div>

                    <select
                      value={volunteer.role}
                      onChange={(e) =>
                        handleChangeRole(volunteer.id, e.target.value)
                      }
                      className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {roles.map((role) => (
                        <option
                          key={role}
                          value={role}
                          className="bg-white dark:bg-gray-800"
                        >
                          {role}
                        </option>
                      ))}
                    </select>

                    <Button
                      variant="outline"
                      className="py-1.5! px-3!"
                      onClick={() => {
                        setSelectedVolunteer(volunteer);
                        setShowAwardModal(true);
                      }}
                    >
                      <Coins className="w-4 h-4 mr-1" />
                      Award
                    </Button>

                    <Button
                      variant="ghost"
                      className="py-1.5! px-2! text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      onClick={() => handleRemoveVolunteer(volunteer.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Tasks */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Assigned Tasks:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {volunteer.tasks.map((task, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full text-sm"
                      >
                        {task}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredVolunteers.length === 0 && (
          <Card className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No volunteers found
            </p>
          </Card>
        )}
      </div>

      {/* Assign Volunteer Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Volunteer"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Event
            </label>
            <select className="w-full px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              {events
                .filter((e) => e.id !== "all")
                .map((event) => (
                  <option
                    key={event.id}
                    value={event.id}
                    className="bg-white dark:bg-gray-800"
                  >
                    {event.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Member
            </label>
            <select className="w-full px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              {availableMembers.map((member) => (
                <option
                  key={member.id}
                  value={member.id}
                  className="bg-white dark:bg-gray-800"
                >
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign Role
            </label>
            <select className="w-full px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              {roles.map((role) => (
                <option
                  key={role}
                  value={role}
                  className="bg-white dark:bg-gray-800"
                >
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tasks (comma separated)
            </label>
            <Input placeholder="e.g., Registration Desk, Tech Support" />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowAssignModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => setShowAssignModal(false)}
            >
              Assign Volunteer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Award Coins Modal */}
      <Modal
        isOpen={showAwardModal}
        onClose={() => setShowAwardModal(false)}
        title="Award Coins"
      >
        {selectedVolunteer && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-white/5 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                {selectedVolunteer.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedVolunteer.name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedVolunteer.event}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Coins to Award
              </label>
              <Input
                type="number"
                value={awardAmount}
                onChange={(e) => setAwardAmount(parseInt(e.target.value) || 0)}
                min="1"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current balance: {selectedVolunteer.coinsEarned} coins
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason
              </label>
              <textarea
                value={awardReason}
                onChange={(e) => setAwardReason(e.target.value)}
                placeholder="e.g., Excellent work during registration..."
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowAwardModal(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleAwardCoins}>
                <Coins className="w-4 h-4 mr-2" />
                Award {awardAmount} Coins
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
