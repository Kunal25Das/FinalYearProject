"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Loader2, Award, Plus, Trash2, Save } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ClubSettingsTab({ userRole }) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");
  const [icon, setIcon] = useState("💡");
  const [color, setColor] = useState("from-blue-600 to-purple-600");
  const [achievements, setAchievements] = useState([]);
  const [newAchievement, setNewAchievement] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const colorPresets = [
    { name: "Blue / Cyan", value: "from-blue-600 to-cyan-600" },
    { name: "Purple / Pink", value: "from-purple-600 to-pink-600" },
    { name: "Green / Emerald", value: "from-green-600 to-emerald-600" },
    { name: "Pink / Rose", value: "from-pink-600 to-rose-600" },
    { name: "Orange / Yellow", value: "from-orange-600 to-yellow-600" },
    { name: "Indigo / Violet", value: "from-blue-600 to-purple-600" },
  ];

  const categories = [
    "Technology",
    "Arts",
    "Sports",
    "Music",
    "Career",
    "General",
  ];

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/club/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setDescription(data.settings.description || "");
        setCategory(data.settings.category || "Technology");
        setIcon(data.settings.icon || "💡");
        setColor(data.settings.color || "from-blue-600 to-purple-600");
        setAchievements(data.settings.achievements || []);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/club/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          category,
          icon,
          color,
          achievements,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Club settings saved successfully!");
      } else {
        alert(data.error || "Failed to save settings");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAchievement = () => {
    if (!newAchievement.trim()) return;
    setAchievements([...achievements, newAchievement.trim()]);
    setNewAchievement("");
  };

  const handleRemoveAchievement = (index) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-purple-500 dark:text-purple-400" />
          Club Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your club&apos;s profile, branding, and achievements list.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Branding & Details
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Club Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={userRole === "club-advisor"}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none disabled:opacity-70"
                  rows={4}
                  placeholder="Tell campus students what your club is about..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Club Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={userRole === "club-advisor"}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-70"
                >
                  {categories.map((c) => (
                    <option
                      key={c}
                      value={c}
                      className="bg-white dark:bg-gray-800"
                    >
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Club Icon (Emoji)
                </label>
                <Input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  disabled={userRole === "club-advisor"}
                  placeholder="e.g. 🖥️, 🎭, ⚽, 💡"
                  maxLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Branding Theme Color
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      disabled={userRole === "club-advisor"}
                      onClick={() => setColor(preset.value)}
                      className={`flex items-center justify-between px-3 py-2 border rounded-lg transition-all text-left disabled:opacity-75 ${
                        color === preset.value
                          ? "border-purple-500 bg-purple-500/10 font-medium"
                          : "border-gray-200 dark:border-white/10 hover:border-purple-500/50"
                      }`}
                    >
                      <span className="text-sm text-gray-900 dark:text-white">
                        {preset.name}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full bg-gradient-to-r ${preset.value}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Achievements & Awards
          </h2>
          <div className="space-y-4">
            {userRole !== "club-advisor" && (
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Winner - National Coding Championship 2025"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddAchievement}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            )}

            <div className="space-y-2 mt-2">
              {achievements.map((ach, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500 shrink-0" />
                    <span className="text-gray-800 dark:text-gray-200 text-sm">
                      {ach}
                    </span>
                  </div>
                  {userRole !== "club-advisor" && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="p-1! text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      onClick={() => handleRemoveAchievement(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {achievements.length === 0 && (
                <p className="text-sm text-gray-500 italic py-4 text-center">
                  No achievements listed yet. Showcase your milestones here!
                </p>
              )}
            </div>
          </div>
        </Card>

        {userRole !== "club-advisor" && (
          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Settings
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
