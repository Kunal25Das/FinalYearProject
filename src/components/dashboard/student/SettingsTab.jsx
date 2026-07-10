"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Lock,
  Bell,
  Sun,
  Moon,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useTheme } from "@/contexts/ThemeContext.jsx";
import { useAuth } from "@/contexts/AuthContext.jsx";

export default function SettingsTab() {
  const { theme, toggleTheme } = useTheme();
  const { userRole } = useAuth();

  // Faculty Max Load settings for HOD
  const [defaultMaxLoad, setDefaultMaxLoad] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loadSuccess, setLoadSuccess] = useState("");
  const [loadLoading, setLoadLoading] = useState(false);

  useEffect(() => {
    if (userRole === "dept-admin") {
      async function fetchDeptSettings() {
        try {
          const res = await fetch("/api/dept-admin/settings");
          const data = await res.json();
          if (data.success) {
            setDefaultMaxLoad(data.defaultMaxLoad.toString());
          }
        } catch (err) {
          console.error("Error loading department settings:", err);
        }
      }
      fetchDeptSettings();
    }
  }, [userRole]);

  const handleMaxLoadSubmit = async (e) => {
    e.preventDefault();
    setLoadError("");
    setLoadSuccess("");
    setLoadLoading(true);

    try {
      const res = await fetch("/api/dept-admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultMaxLoad: parseInt(defaultMaxLoad),
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to update max load limit");

      setLoadSuccess("Department load limit updated successfully!");
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoadLoading(false);
    }
  };

  // Password Update State
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  // Notification Preferences State (Persisted in localStorage)
  const [notifPrefs, setNotifPrefs] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notifPrefs");
      if (saved) return JSON.parse(saved);
    }
    return {
      placementAlerts: true,
      campusNotices: true,
      eventInvites: false,
    };
  });

  const handleNotifToggle = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("notifPrefs", JSON.stringify(updated));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (passwords.newPassword.length < 8) {
      setPassError("Password must be at least 8 characters long");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassError("Passwords do not match");
      return;
    }

    setPassLoading(true);

    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: passwords.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      setPassSuccess("Password updated successfully!");
      setPasswords({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPassError(err.message);
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-purple-500" />
          <span>System Settings</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Customize your experience, notification rules, and secure your account
          credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Preferences */}
        <Card className="border border-gray-200 dark:border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="w-5 h-5 text-purple-400" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500" />
            )}
            <span>App Customization</span>
          </h3>
          <p className="text-xs text-gray-500">
            Switch between light and dark modes according to your visual
            workspace preference.
          </p>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-white/5">
            <div>
              <p className="text-sm font-semibold text-gray-950 dark:text-white">
                Theme Select
              </p>
              <p className="text-xs text-gray-500 capitalize">
                Currently {theme} theme active
              </p>
            </div>
            <Button
              variant="outline"
              onClick={toggleTheme}
              className="border-white/10 dark:text-white bg-white/5"
            >
              Toggle Mode
            </Button>
          </div>
        </Card>

        {/* Notifications rules */}
        <Card className="border border-gray-200 dark:border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-500" />
            <span>Notification Preferences</span>
          </h3>
          <p className="text-xs text-gray-500">
            Configure system rules to receive alerts on relevant updates.
          </p>

          <div className="space-y-3.5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Placement Alerts
              </span>
              <input
                type="checkbox"
                checked={notifPrefs.placementAlerts}
                onChange={() => handleNotifToggle("placementAlerts")}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300 bg-white/10"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Campus Notices
              </span>
              <input
                type="checkbox"
                checked={notifPrefs.campusNotices}
                onChange={() => handleNotifToggle("campusNotices")}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300 bg-white/10"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Event Invites
              </span>
              <input
                type="checkbox"
                checked={notifPrefs.eventInvites}
                onChange={() => handleNotifToggle("eventInvites")}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300 bg-white/10"
              />
            </label>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security / Password updates */}
        <Card className="border border-gray-200 dark:border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-500" />
            <span>Update Password</span>
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Min 8 characters"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Retype password"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmPassword: e.target.value })
              }
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
            />

            {passError && (
              <div className="flex items-center gap-2 p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="flex items-center gap-2 p-3 text-xs bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={passLoading}
            >
              {passLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </Card>

        {/* PWA installation guide card */}
        <Card className="border border-gray-200 dark:border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-500" />
            <span>PWA Installation Info</span>
          </h3>
          <p className="text-xs text-gray-500">
            Run campus-connect natively on your mobile phone for quick desktop
            notifications and instant launch.
          </p>

          <div className="space-y-3.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            <div>
              <strong className="text-gray-900 dark:text-white block mb-0.5">
                Android Devices
              </strong>
              <span>
                Tap the three dots on Google Chrome settings and select{" "}
                <strong>&quot;Add to Home Screen&quot;</strong> or accept the
                pop-up prompt to install.
              </span>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white block mb-0.5">
                iOS Devices (Safari)
              </strong>
              <span>
                Tap the Share icon in Safari and select{" "}
                <strong>&quot;Add to Home Screen&quot;</strong>. Notifications
                can be configured in your settings panel.
              </span>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white block mb-0.5">
                System Status
              </strong>
              <span>
                App version: <strong>1.0.0 (Production Build)</strong>.
                Persistent local database connected successfully.
              </span>
            </div>
          </div>
        </Card>
      </div>

      {userRole === "dept-admin" && (
        <Card className="border border-gray-200 dark:border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-500" />
            <span>Department Faculty Load Settings</span>
          </h3>
          <p className="text-xs text-gray-500">
            Set the default maximum weekly teaching hours limit for faculty in
            your department.
          </p>

          <form onSubmit={handleMaxLoadSubmit} className="space-y-4 max-w-md">
            <Input
              label="Default Max Load Limit (hours/week)"
              type="number"
              min="1"
              max="40"
              placeholder="e.g. 16"
              value={defaultMaxLoad}
              onChange={(e) => setDefaultMaxLoad(e.target.value)}
              required
              className="bg-white/5 dark:bg-white/5 dark:border-white/10 dark:text-white placeholder:text-gray-500 focus:border-purple-500"
            />

            {loadError && (
              <div className="flex items-center gap-2 p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loadError}</span>
              </div>
            )}

            {loadSuccess && (
              <div className="flex items-center gap-2 p-3 text-xs bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{loadSuccess}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loadLoading}
            >
              {loadLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                "Save Configuration"
              )}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
