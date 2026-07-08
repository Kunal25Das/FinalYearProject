"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserCheck,
  ShieldAlert,
  Loader2,
  Search,
  Edit2,
  Mail,
  ToggleLeft,
  ToggleRight,
  Plus,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function UserManagementTab() {
  // Form Provisioning State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    department: "",
    batch: "2026",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);

  // Directory State
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [directoryLoading, setDirectoryLoading] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const roles = [
    { id: "student", label: "Student" },
    { id: "faculty", label: "Faculty Member" },
    { id: "dept-admin", label: "Department Admin (HOD)" },
  ];

  const directoryRoleFilters = [
    { id: "all", label: "All Roles" },
    { id: "student", label: "Student" },
    { id: "faculty", label: "Faculty Member" },
    { id: "dept-admin", label: "HOD (Dept Admin)" },
    { id: "club-admin", label: "Club Rep" },
    { id: "event-organizer", label: "Event Organizer" },
    { id: "club-advisor", label: "Club Advisor" },
  ];

  const fetchMetadata = async () => {
    try {
      const deptRes = await fetch("/api/admin/departments");
      const deptData = await deptRes.json();
      if (
        deptRes.ok &&
        deptData.departments &&
        deptData.departments.length > 0
      ) {
        setDepartments(deptData.departments);
        setFormData((prev) => ({
          ...prev,
          department: deptData.departments[0]._id,
        }));
      }

      const batchRes = await fetch("/api/admin/batches");
      const batchData = await batchRes.json();
      if (batchRes.ok && batchData.batches) {
        setBatches(batchData.batches);
      }
    } catch (err) {
      console.error("Failed to load departments or batches:", err);
    }
  };

  const fetchDirectoryUsers = useCallback(async () => {
    setDirectoryLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search: searchQuery,
        department: filterDept,
        role: filterRole,
      });
      const res = await fetch(`/api/admin/users?${queryParams.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setDirectoryUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load directory users:", err);
    } finally {
      setDirectoryLoading(false);
    }
  }, [searchQuery, filterDept, filterRole]);

  useEffect(() => {
    fetchMetadata();
    fetchDirectoryUsers();
  }, [filterDept, filterRole, fetchDirectoryUsers]);

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

      setFormData({
        name: "",
        email: "",
        role: "student",
        department: departments[0]?._id || "",
        batch: "2026",
      });

      // Reload directory users
      fetchDirectoryUsers();

      // Auto-close modal after 2 seconds
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, updateFields) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updateFields }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");
      fetchDirectoryUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = (u) => {
    handleUpdateUser(u._id, { isDisabled: !u.isDisabled });
  };

  const handleOpenEditModal = (u) => {
    setEditingUser(u);
    setEditFormData({
      name: u.name,
      email: u.email,
      department: u.department?._id || u.department || "",
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    await handleUpdateUser(editingUser._id, editFormData);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel matching design specifications */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Query, search, and customize active campus directories.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 self-start sm:self-center py-2.5 px-5 rounded-xl shadow-lg shadow-purple-500/20 font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Create New User</span>
        </Button>
      </div>

      {/* Directory Filter Card */}
      <Card className="border border-gray-200 dark:border-white/10 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Search Name, Email, or Roll No
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchDirectoryUsers()}
                className="pl-10 bg-white/5 dark:border-white/10 dark:text-white"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Filter Department
            </label>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Filter Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              {directoryRoleFilters.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            onClick={fetchDirectoryUsers}
            className="bg-purple-600 hover:bg-purple-700 text-sm py-2 px-5"
          >
            Apply Filters
          </Button>
        </div>
      </Card>

      {/* Directory Table */}
      <Card className="border border-gray-200 dark:border-white/10 overflow-hidden">
        {directoryLoading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
          </div>
        ) : directoryUsers.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            No users matching search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Department & Roll</th>
                  <th className="p-4">Primary Role</th>
                  <th className="p-4">Special Roles</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5 text-sm">
                {directoryUsers.map((u) => (
                  <tr
                    key={u._id}
                    className={`hover:bg-gray-50 dark:hover:bg-white/2 transition-colors ${
                      u.isDisabled ? "opacity-60 bg-red-950/5" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {u.name}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-purple-400" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-700 dark:text-gray-300">
                        {u.department?.code || "N/A"}
                      </div>
                      {u.rollNo && (
                        <div className="text-xs text-purple-400 font-mono mt-0.5">
                          {u.rollNo}
                        </div>
                      )}
                    </td>
                    <td className="p-4 capitalize">
                      {u.role === "dept-admin" ? "HOD" : u.role}
                    </td>
                    <td className="p-4">
                      <select
                        value={
                          Array.isArray(u.specialRoles) &&
                          u.specialRoles.length > 0
                            ? u.specialRoles[0]
                            : ""
                        }
                        onChange={(e) => {
                          const newValue = e.target.value;
                          handleUpdateUser(u._id, {
                            specialRoles: newValue ? [newValue] : [],
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">None</option>
                        {u.role === "student" ? (
                          <>
                            <option value="club-admin">Club Rep</option>
                            <option value="event-organizer">
                              Event Organizer
                            </option>
                          </>
                        ) : (
                          <>
                            <option value="club-advisor">Club Advisor</option>
                            <option value="event-organizer">
                              Event Organizer
                            </option>
                          </>
                        )}
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className="focus:outline-none inline-block"
                        title={
                          u.isDisabled
                            ? "Enable User Account"
                            : "Disable User Account"
                        }
                      >
                        {u.isDisabled ? (
                          <span className="px-2.5 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold flex items-center gap-1">
                            <ToggleLeft className="w-4 h-4" /> Disabled
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold flex items-center gap-1">
                            <ToggleRight className="w-4 h-4" /> Active
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-2 text-gray-400 hover:text-purple-400 hover:bg-white/5 rounded-lg transition-all"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Define User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSuccess(null);
          setError("");
        }}
        title="Create New User"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="User's Full Name"
            type="text"
            placeholder="e.g. Dr. Jane Smith"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-white/5 dark:border-white/10 dark:text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
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
            className="bg-white/5 dark:border-white/10 dark:text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
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

            {formData.role === "student" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Student Batch (Year)
                </label>
                <select
                  value={formData.batch}
                  onChange={(e) =>
                    setFormData({ ...formData, batch: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  {Array.from(
                    new Set([
                      ...batches.map((b) => b.year),
                      "2023",
                      "2024",
                      "2025",
                      "2026",
                      "2027",
                      "2028",
                      "2029",
                      "2030",
                    ]),
                  )
                    .sort((a, b) => b - a)
                    .map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/20 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-2">
              <div className="flex items-center gap-3 text-green-400 text-sm font-semibold">
                <UserCheck className="w-5 h-5 flex-shrink-0" />
                <span>
                  Account provisioned successfully! Credentials emailed.
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowCreateModal(false);
                setSuccess(null);
                setError("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create User</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={editingUser !== null}
        onClose={() => setEditingUser(null)}
        title="Edit User Details"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={editFormData.name}
            onChange={(e) =>
              setEditFormData({ ...editFormData, name: e.target.value })
            }
            required
            className="bg-white/5 dark:border-white/10 dark:text-white"
          />

          <Input
            label="Email Address"
            type="email"
            value={editFormData.email}
            onChange={(e) =>
              setEditFormData({ ...editFormData, email: e.target.value })
            }
            required
            className="bg-white/5 dark:border-white/10 dark:text-white"
          />

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Department
            </label>
            <select
              value={editFormData.department}
              onChange={(e) =>
                setEditFormData({ ...editFormData, department: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">No Department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditingUser(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
