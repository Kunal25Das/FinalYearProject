"use client";

import { useState } from "react";
import { Users, Search, Shield, Crown, UserX, Coins } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion } from "framer-motion";

export default function MembersTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [coinsToAward, setCoinsToAward] = useState(10);

  const [members, setMembers] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "Event Organizer",
      joinedAt: "2024-09-15",
      coinsEarned: 150,
      avatar: "👩‍💻",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@example.com",
      role: "Member",
      joinedAt: "2024-10-01",
      coinsEarned: 50,
      avatar: "👨‍🎓",
    },
    {
      id: 3,
      name: "Charlie Brown",
      email: "charlie@example.com",
      role: "Volunteer",
      joinedAt: "2024-11-10",
      coinsEarned: 75,
      avatar: "🧑‍💼",
    },
    {
      id: 4,
      name: "Diana Prince",
      email: "diana@example.com",
      role: "Event Organizer",
      joinedAt: "2024-08-20",
      coinsEarned: 200,
      avatar: "👩‍🔬",
    },
    {
      id: 5,
      name: "Eve Wilson",
      email: "eve@example.com",
      role: "Member",
      joinedAt: "2025-01-05",
      coinsEarned: 25,
      avatar: "👩‍🎨",
    },
    {
      id: 6,
      name: "Frank Miller",
      email: "frank@example.com",
      role: "Volunteer",
      joinedAt: "2024-12-01",
      coinsEarned: 100,
      avatar: "👨‍🔧",
    },
  ]);

  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 7,
      name: "Grace Lee",
      email: "grace@example.com",
      requestedAt: "2025-12-14",
      avatar: "👩‍🏫",
    },
    {
      id: 8,
      name: "Henry Ford",
      email: "henry@example.com",
      requestedAt: "2025-12-15",
      avatar: "👨‍💼",
    },
  ]);

  const roles = [
    {
      id: "event-organizer",
      label: "Event Organizer",
      description: "Can create and manage events",
      icon: Crown,
    },
    {
      id: "volunteer",
      label: "Volunteer",
      description: "Can assist with events",
      icon: Shield,
    },
    {
      id: "member",
      label: "Member",
      description: "Regular club member",
      icon: Users,
    },
  ];

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAcceptRequest = (requestId) => {
    const request = pendingRequests.find((r) => r.id === requestId);
    if (request) {
      setMembers([
        ...members,
        {
          ...request,
          role: "Member",
          joinedAt: new Date().toISOString().split("T")[0],
          coinsEarned: 0,
        },
      ]);
      setPendingRequests(pendingRequests.filter((r) => r.id !== requestId));
    }
  };

  const handleRejectRequest = (requestId) => {
    setPendingRequests(pendingRequests.filter((r) => r.id !== requestId));
  };

  const handleRemoveMember = (memberId) => {
    setMembers(members.filter((m) => m.id !== memberId));
  };

  const handleAssignRole = (role) => {
    if (selectedMember) {
      setMembers(
        members.map((m) =>
          m.id === selectedMember.id ? { ...m, role: role.label } : m,
        ),
      );
      setIsRoleModalOpen(false);
      setSelectedMember(null);
    }
  };

  const handleAwardCoins = () => {
    if (selectedMember && coinsToAward > 0) {
      setMembers(
        members.map((m) =>
          m.id === selectedMember.id
            ? { ...m, coinsEarned: m.coinsEarned + coinsToAward }
            : m,
        ),
      );
      setIsAwardModalOpen(false);
      setSelectedMember(null);
      setCoinsToAward(10);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Members
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage club members and roles
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search members..."
              className="pl-10! w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="px-2 py-1 bg-orange-500/20 text-orange-500 rounded-full text-sm">
              {pendingRequests.length}
            </span>
            Pending Join Requests
          </h2>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-gray-100 dark:bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center text-2xl">
                    {request.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {request.name}
                    </p>
                    <p className="text-sm text-gray-500">{request.email}</p>
                    <p className="text-xs text-gray-400">
                      Requested on {request.requestedAt}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleAcceptRequest(request.id)}>
                    Accept
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleRejectRequest(request.id)}
                  >
                    Reject
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Members Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Members
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {members.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Event Organizers
          </p>
          <p className="text-3xl font-bold text-purple-500">
            {members.filter((m) => m.role === "Event Organizer").length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Volunteers</p>
          <p className="text-3xl font-bold text-blue-500">
            {members.filter((m) => m.role === "Volunteer").length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Coins Awarded
          </p>
          <p className="text-3xl font-bold text-yellow-500">
            {members.reduce((sum, m) => sum + m.coinsEarned, 0)}
          </p>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Member
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Joined
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Coins Earned
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, index) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-xl">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        member.role === "Event Organizer"
                          ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
                          : member.role === "Volunteer"
                            ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                            : "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                    {member.joinedAt}
                  </td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-1 text-yellow-500 font-medium">
                      <Coins className="w-4 h-4" />
                      {member.coinsEarned}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        className="text-sm! py-1! px-2!"
                        onClick={() => {
                          setSelectedMember(member);
                          setIsAwardModalOpen(true);
                        }}
                      >
                        <Coins className="w-4 h-4 mr-1" />
                        Award
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-sm! py-1! px-2!"
                        onClick={() => {
                          setSelectedMember(member);
                          setIsRoleModalOpen(true);
                        }}
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        Role
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-sm! py-1! px-2! text-red-500!"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assign Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedMember(null);
        }}
        title={`Assign Role - ${selectedMember?.name}`}
      >
        <div className="space-y-3">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleAssignRole(role)}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  selectedMember?.role === role.label
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-gray-200 dark:border-white/10 hover:border-violet-500/50 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-violet-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {role.label}
                  </p>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Award Coins Modal */}
      <Modal
        isOpen={isAwardModalOpen}
        onClose={() => {
          setIsAwardModalOpen(false);
          setSelectedMember(null);
        }}
        title={`Award Coins - ${selectedMember?.name}`}
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <Coins className="w-10 h-10 text-yellow-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Current balance:{" "}
              <span className="font-bold text-yellow-500">
                {selectedMember?.coinsEarned} coins
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Coins to Award
            </label>
            <div className="flex gap-2">
              {[10, 25, 50, 100].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setCoinsToAward(amount)}
                  className={`flex-1 py-2 rounded-lg border transition-all ${
                    coinsToAward === amount
                      ? "border-yellow-500 bg-yellow-500/20 text-yellow-500"
                      : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-yellow-500/50"
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Custom Amount"
            type="number"
            value={coinsToAward}
            onChange={(e) => setCoinsToAward(parseInt(e.target.value) || 0)}
            min={1}
          />

          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setIsAwardModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleAwardCoins}>
              Award {coinsToAward} Coins
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
