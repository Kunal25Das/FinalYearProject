"use client";

import { useState, useEffect } from "react";
import {
  UserPlus,
  UserCheck,
  ShieldAlert,
  Loader2,
  Sparkles,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { motion } from "framer-motion";

export default function UserManagementTab() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    department: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null); // Will hold details of newly created user
  const [departments, setDepartments] = useState([]);

  const roles = [
    { id: "student", label: "Student" },
    { id: "faculty", label: "Faculty Member" },
    { id: "dept-admin", label: "Department Admin (HOD)" },
    { id: "club-admin", label: "Club Admin" },
    { id: "event-organizer", label: "Event Organizer" },
  ];

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await fetch("/api/admin/departments");
        const data = await res.json();
        if (res.ok && data.departments && data.departments.length > 0) {
          setDepartments(data.departments);
          setFormData((prev) => ({
            ...prev,
            department: data.departments[0]._id,
          }));
        }
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setSuccess({
        ...data.user,
        message: data.message,
      });

      // Reset form fields
      setFormData({
        name: "",
        email: "",
        role: "student",
        department: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Provision User Accounts
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Add students, faculty, or administrators. The system will
          auto-generate a one-time login credentials password and email them
          details.
        </p>
      </div>

      <Card className="border border-gray-200 dark:border-white/10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="User's Full Name"
            type="text"
            placeholder="e.g. Dr. Jane Smith"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
          />

          <Input
            label="Institutional Email Address"
            type="email"
            placeholder="e.g. janesmith@college.edu"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                System Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                {departments.map((d) => (
                  <option
                    key={d._id || d.id || d.code}
                    value={d._id || d.id || d.code}
                  >
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/20 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 font-semibold shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating User Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Create and Email Credentials</span>
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Success Notification overlay or block */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl space-y-4"
        >
          <div className="flex items-center gap-3 text-green-400">
            <UserCheck className="w-6 h-6 flex-shrink-0" />
            <h3 className="font-bold text-lg">User Account Provisioned!</h3>
          </div>
          <div className="text-gray-300 text-sm space-y-1">
            <p>
              <strong>Name:</strong> {success.name}
            </p>
            <p>
              <strong>Email:</strong> {success.email}
            </p>
            <p>
              <strong>Role:</strong> {success.role}
            </p>
            {success.department && (
              <p>
                <strong>Department:</strong> {success.department}
              </p>
            )}
          </div>
          <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-lg text-xs text-green-300/80 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span>
              The user has been emailed instructions along with their temporary
              password.
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
