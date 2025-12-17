"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { motion } from "framer-motion";

export default function CreateClubTab({ onClubCreated }) {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [clubData, setClubData] = useState({
    name: "",
    description: "",
    category: "Technology",
    icon: "🖥️",
    color: "from-blue-600 to-cyan-600",
  });

  const categories = [
    "Technology",
    "Arts",
    "Sports",
    "Science",
    "Music",
    "Literature",
    "Social Service",
    "Business",
    "Other",
  ];

  const icons = [
    "🖥️",
    "🎭",
    "⚽",
    "🔬",
    "🎵",
    "📚",
    "🤝",
    "💼",
    "🎨",
    "🎮",
    "📸",
    "🌍",
  ];

  const colors = [
    { name: "Blue-Cyan", value: "from-blue-600 to-cyan-600" },
    { name: "Purple-Pink", value: "from-purple-600 to-pink-600" },
    { name: "Green-Emerald", value: "from-green-600 to-emerald-600" },
    { name: "Orange-Red", value: "from-orange-600 to-red-600" },
    { name: "Indigo-Purple", value: "from-indigo-600 to-purple-600" },
    { name: "Yellow-Orange", value: "from-yellow-500 to-orange-500" },
  ];

  const handleCreateClub = () => {
    setIsCreating(true);
    // Simulate API call
    setTimeout(() => {
      setIsCreating(false);
      setStep(4); // Success step
      if (onClubCreated) {
        onClubCreated(clubData);
      }
    }, 1500);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Let&apos;s create your club
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Start by giving your club a name and description
              </p>
            </div>

            <Input
              label="Club Name"
              placeholder="e.g., Computer Science Club"
              value={clubData.name}
              onChange={(e) =>
                setClubData({ ...clubData, name: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                rows={4}
                placeholder="Describe what your club is about..."
                value={clubData.description}
                onChange={(e) =>
                  setClubData({ ...clubData, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setClubData({ ...clubData, category })}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      clubData.category === category
                        ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400"
                        : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-violet-500/50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => setStep(2)}
              disabled={!clubData.name || !clubData.description}
            >
              Continue
            </Button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Choose an icon
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Pick an emoji that represents your club
              </p>
            </div>

            <div className="grid grid-cols-6 gap-3">
              {icons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setClubData({ ...clubData, icon })}
                  className={`p-4 rounded-xl text-3xl transition-all ${
                    clubData.icon === icon
                      ? "bg-violet-500/20 border-2 border-violet-500 scale-110"
                      : "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:scale-105"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Select a theme color
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a gradient color for your club banner
              </p>
            </div>

            {/* Preview */}
            <div
              className={`h-32 rounded-xl bg-linear-to-r ${clubData.color} flex items-center justify-center`}
            >
              <div className="text-center">
                <span className="text-5xl">{clubData.icon}</span>
                <p className="text-white font-bold mt-2">{clubData.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() =>
                    setClubData({ ...clubData, color: color.value })
                  }
                  className={`h-16 rounded-xl bg-linear-to-r ${color.value} transition-all ${
                    clubData.color === color.value
                      ? "ring-4 ring-violet-500 ring-offset-2 ring-offset-white dark:ring-offset-[#050505] scale-105"
                      : "hover:scale-105"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateClub}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Club"}
              </Button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Club Created Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your club &quot;{clubData.name}&quot; is now live. Start inviting
              members and creating events!
            </p>

            {/* Club Preview */}
            <div
              className={`h-24 rounded-xl bg-linear-to-r ${clubData.color} flex items-center justify-center mb-6 mx-auto max-w-md`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{clubData.icon}</span>
                <div className="text-left text-white">
                  <p className="font-bold text-lg">{clubData.name}</p>
                  <p className="text-white/80 text-sm">{clubData.category}</p>
                </div>
              </div>
            </div>

            <Button onClick={() => window.location.reload()}>
              Go to Dashboard
            </Button>
          </motion.div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        {/* Progress Steps */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s === step
                      ? "bg-violet-500 text-white"
                      : s < step
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-white/10 text-gray-500"
                  }`}
                >
                  {s < step ? "✓" : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded ${
                      s < step ? "bg-green-500" : "bg-gray-200 dark:bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {renderStep()}
      </Card>
    </div>
  );
}
