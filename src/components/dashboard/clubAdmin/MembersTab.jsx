"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Shield,
  Crown,
  UserX,
  Coins,
  Loader2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion } from "framer-motion";

export default function MembersTab({ userRole }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [coinsToAward, setCoinsToAward] = useState(10);

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/club/members");
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
        setPendingRequests(data.pendingRequests || []);
      }
    } catch (err) {
      console.error("Failed to load club members:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await fetch("/api/club/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId: requestId, action: "approve" }),
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.error || "Failed to accept request");
      }
    } catch (err) {
      console.error(err);
      alert("Error approving request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!confirm("Are you sure you want to reject this request?")) return;
    try {
      const res = await fetch("/api/club/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId: requestId, action: "reject" }),
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.error || "Failed to reject request");
      }
    } catch (err) {
      console.error(err);
      alert("Error rejecting request");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm("Are you sure you want to remove this member from the club?"))
      return;
    try {
      const res = await fetch(`/api/club/members?id=${memberId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMembers(members.filter((m) => m.id !== memberId));
      } else {
        alert(data.error || "Failed to remove member");
      }
    } catch (err) {
      console.error(err);
      alert("Error removing member");
    }
  };

  const handleAssignRole = async (roleObj) => {
    if (selectedMember) {
      try {
        const res = await fetch("/api/club/members", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            membershipId: selectedMember.id,
            action: "change-role",
            role: roleObj.label,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setMembers(
            members.map((m) =>
              m.id === selectedMember.id ? { ...m, role: roleObj.label } : m,
            ),
          );
          setIsRoleModalOpen(false);
          setSelectedMember(null);
        } else {
          alert(data.error || "Failed to update role");
        }
      } catch (err) {
        console.error(err);
        alert("Error assigning role");
      }
    }
  };

  const handleAwardCoins = async () => {
    if (selectedMember && coinsToAward > 0) {
      try {
        const res = await fetch("/api/event-organizer/award-coins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberIds: [selectedMember.userId],
            coins: coinsToAward,
            reason: "Awarded by Club Admin",
          }),
        });
        const data = await res.json();
        if (data.success) {
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
        } else {
          alert(data.error || "Failed to award coins");
        }
      } catch (err) {
        console.error(err);
        alert("Error awarding coins");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500">Loading members...</span>
      </div>
    );
  }

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
            <span className="px-2 py-1 bg-orange-500/20 text-orange-500 rounded-full text-sm font-medium">
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
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center text-2xl font-bold">
                    {request.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {request.name}
                    </p>
                    <p className="text-sm text-gray-500">{request.email}</p>
                    <p className="text-xs text-gray-400">
                      Requested {request.requestedAt}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => handleAcceptRequest(request.id)}
                  >
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

      {/* Members Directory */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} hover className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {member.email}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Joined {member.joinedAt}
              </span>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200 dark:border-white/5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full text-xs font-semibold">
                  {member.role}
                </span>
                <span className="text-xs text-yellow-500 font-semibold flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> {member.coinsEarned}
                </span>
              </div>

              {userRole !== "club-advisor" && (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    className="p-2! min-w-0"
                    title="Award Coins"
                    onClick={() => {
                      setSelectedMember(member);
                      setIsAwardModalOpen(true);
                    }}
                  >
                    <Coins className="w-4 h-4 text-yellow-500" />
                  </Button>
                  <Button
                    variant="outline"
                    className="p-2! min-w-0"
                    title="Change Role"
                    onClick={() => {
                      setSelectedMember(member);
                      setIsRoleModalOpen(true);
                    }}
                  >
                    <Crown className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                  </Button>
                  <Button
                    variant="outline"
                    className="p-2! min-w-0 border-red-500/20! hover:bg-red-500/10! text-red-500!"
                    title="Remove Member"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Role Assignment Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title={`Assign Role - ${selectedMember?.name}`}
      >
        <div className="space-y-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                className="w-full flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-violet-500 hover:bg-violet-500/5 transition-all text-left"
                onClick={() => handleAssignRole(role)}
              >
                <div className="p-2 rounded-lg bg-violet-500/20 text-violet-500 dark:text-violet-400">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {role.label}
                  </h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {role.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Award Coins Modal */}
      <Modal
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
        title={`Award Coins - ${selectedMember?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Coins
            </label>
            <Input
              type="number"
              value={coinsToAward}
              onChange={(e) => setCoinsToAward(parseInt(e.target.value) || 0)}
              min="1"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setIsAwardModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleAwardCoins}>
              Award Coins
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
