"use client";

import { useState } from "react";
import {
  Coins,
  Users,
  Search,
  Trophy,
  Gift,
  TrendingUp,
  Award,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion } from "framer-motion";

export default function AwardsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [coinsToAward, setCoinsToAward] = useState(10);
  const [awardReason, setAwardReason] = useState("");

  const members = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      coinsEarned: 150,
      avatar: "👩‍💻",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@example.com",
      coinsEarned: 50,
      avatar: "👨‍🎓",
    },
    {
      id: 3,
      name: "Charlie Brown",
      email: "charlie@example.com",
      coinsEarned: 75,
      avatar: "🧑‍💼",
    },
    {
      id: 4,
      name: "Diana Prince",
      email: "diana@example.com",
      coinsEarned: 200,
      avatar: "👩‍🔬",
    },
    {
      id: 5,
      name: "Eve Wilson",
      email: "eve@example.com",
      coinsEarned: 25,
      avatar: "👩‍🎨",
    },
    {
      id: 6,
      name: "Frank Miller",
      email: "frank@example.com",
      coinsEarned: 100,
      avatar: "👨‍🔧",
    },
  ];

  const recentAwards = [
    {
      id: 1,
      member: "Alice Johnson",
      coins: 50,
      reason: "Hackathon Participation",
      date: "2025-12-15",
    },
    {
      id: 2,
      member: "Volunteer Team",
      coins: 100,
      reason: "Event Setup Assistance",
      date: "2025-12-14",
    },
    {
      id: 3,
      member: "Bob Smith",
      coins: 25,
      reason: "Workshop Attendance",
      date: "2025-12-12",
    },
    {
      id: 4,
      member: "Diana Prince",
      coins: 75,
      reason: "Outstanding Contribution",
      date: "2025-12-10",
    },
  ];

  const awardPresets = [
    { label: "Event Participation", coins: 25, icon: "🎉" },
    { label: "Volunteer Work", coins: 50, icon: "🙌" },
    { label: "Competition Winner", coins: 100, icon: "🏆" },
    { label: "Outstanding Contribution", coins: 75, icon: "⭐" },
    { label: "Workshop Completion", coins: 30, icon: "📚" },
  ];

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const topEarners = [...members]
    .sort((a, b) => b.coinsEarned - a.coinsEarned)
    .slice(0, 5);

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  const handleAwardCoins = () => {
    // In a real app, this would make an API call
    // Award coins logic would go here
    setIsAwardModalOpen(false);
    setSelectedMembers([]);
    setCoinsToAward(10);
    setAwardReason("");
  };

  const selectPreset = (preset) => {
    setCoinsToAward(preset.coins);
    setAwardReason(preset.label);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Awards & Coins
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Reward members for their contributions
          </p>
        </div>
        <Button onClick={() => setIsAwardModalOpen(true)}>
          <Coins className="w-4 h-4 mr-2" />
          Award Coins
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Coins className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {members.reduce((sum, m) => sum + m.coinsEarned, 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Awarded
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {members.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Members Rewarded
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {recentAwards.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This Month
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(
                  members.reduce((sum, m) => sum + m.coinsEarned, 0) /
                    members.length,
                )}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg per Member
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <Card className="md:col-span-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Earners
          </h2>
          <div className="space-y-3">
            {topEarners.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-white/5 rounded-lg"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0
                      ? "bg-yellow-500 text-yellow-900"
                      : index === 1
                        ? "bg-gray-300 text-gray-700"
                        : index === 2
                          ? "bg-orange-400 text-orange-900"
                          : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {member.name}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-yellow-500 font-bold">
                  <Coins className="w-4 h-4" />
                  {member.coinsEarned}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Awards */}
        <Card className="md:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-500" />
            Recent Awards
          </h2>
          <div className="space-y-3">
            {recentAwards.map((award) => (
              <motion.div
                key={award.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-gray-100 dark:bg-white/5 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {award.member}
                  </p>
                  <p className="text-sm text-gray-500">{award.reason}</p>
                  <p className="text-xs text-gray-400 mt-1">{award.date}</p>
                </div>
                <span className="flex items-center gap-1 text-yellow-500 font-bold text-lg">
                  +{award.coins}
                  <Coins className="w-5 h-5" />
                </span>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Award Modal */}
      <Modal
        isOpen={isAwardModalOpen}
        onClose={() => {
          setIsAwardModalOpen(false);
          setSelectedMembers([]);
        }}
        title="Award Coins"
        size="lg"
      >
        <div className="space-y-6">
          {/* Quick Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {awardPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => selectPreset(preset)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
                    awardReason === preset.label &&
                    coinsToAward === preset.coins
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-gray-200 dark:border-white/10 hover:border-violet-500/50"
                  }`}
                >
                  <span className="text-2xl">{preset.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {preset.label}
                    </p>
                    <p className="text-xs text-yellow-500">
                      {preset.coins} coins
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Coins Amount"
              type="number"
              value={coinsToAward}
              onChange={(e) => setCoinsToAward(parseInt(e.target.value) || 0)}
              min={1}
            />
            <Input
              label="Reason"
              placeholder="Enter reason for award"
              value={awardReason}
              onChange={(e) => setAwardReason(e.target.value)}
            />
          </div>

          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Select Members ({selectedMembers.length} selected)
            </label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                className="pl-10!"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => toggleMemberSelection(member.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    selectedMembers.includes(member.id)
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-gray-200 dark:border-white/10 hover:border-violet-500/50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-xl">
                    {member.avatar}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                  {selectedMembers.includes(member.id) && (
                    <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {selectedMembers.length > 0 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                Total: {coinsToAward * selectedMembers.length} coins to{" "}
                {selectedMembers.length} member(s)
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setIsAwardModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleAwardCoins}
              disabled={selectedMembers.length === 0 || coinsToAward <= 0}
            >
              Award {coinsToAward * selectedMembers.length} Coins
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
