"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Trash2,
  Eye,
  Mail,
  Building,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function FacultyManagementTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "CSE",
  });

  const [departments, setDepartments] = useState([]);

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faculty");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFaculty(data.faculty || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
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

  useEffect(() => {
    fetchFaculty();
    fetchDepartments();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setActioningId("add");

    try {
      const res = await fetch("/api/admin/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          department: formData.department,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        department: "CSE",
      });
      fetchFaculty(); // Reload list
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this faculty account?"))
      return;
    setActioningId(id);
    try {
      const res = await fetch(`/api/admin/faculty?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFaculty((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      filterDepartment === "all" ||
      f.department === filterDepartment ||
      f.departmentCode === filterDepartment;
    return matchesSearch && matchesDept;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500 dark:text-gray-400">
          Loading Faculty profiles...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="font-bold">Failed to load faculty</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Faculty Directory
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Provision faculty accounts, assign departments, and review academic
            staff lists.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          <span>Provision Faculty</span>
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="border border-gray-200 dark:border-white/10 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search faculty by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterDepartment("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterDepartment === "all"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                  : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
            >
              All Depts
            </button>
            {departments.map((dept) => (
              <button
                key={dept.code}
                onClick={() => setFilterDepartment(dept.code)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filterDepartment === dept.code
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                    : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                }`}
              >
                {dept.code}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Grid view */}
      {filteredFaculty.length === 0 ? (
        <Card className="text-center py-12 border border-gray-200 dark:border-white/10">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            No Faculty Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            There are no faculty accounts matching this search.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredFaculty.map((f) => {
              const initials = f.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="border border-gray-200 dark:border-white/10 flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                          {initials}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                            {f.name}
                          </h3>
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                            {f.department}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{f.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span>{f.designation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFaculty(f);
                          setShowViewModal(true);
                        }}
                        className="text-purple-400 hover:bg-purple-500/10 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Profile</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(f.id)}
                        disabled={actioningId !== null}
                        className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Faculty Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Provision Faculty Account"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="e.g. Dr. Rajesh Sharma"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. rajesh.sharma@college.edu"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
          />

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
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

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={actioningId !== null}
            >
              {actioningId === "add"
                ? "Provisioning..."
                : "Add and Email Credentials"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Profile Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Faculty Profile"
      >
        {selectedFaculty && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {selectedFaculty.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedFaculty.name}
                </h3>
                <p className="text-sm text-purple-400 font-semibold">
                  {selectedFaculty.designation} •{" "}
                  {selectedFaculty.departmentFull}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
              <div>
                <strong className="text-gray-400 block mb-0.5">
                  Email Address
                </strong>
                <span className="text-white font-medium">
                  {selectedFaculty.email}
                </span>
              </div>
              <div>
                <strong className="text-gray-400 block mb-0.5">
                  Primary Contact
                </strong>
                <span className="text-white font-medium">
                  {selectedFaculty.phone}
                </span>
              </div>
              <div>
                <strong className="text-gray-400 block mb-0.5">
                  Qualifications
                </strong>
                <span className="text-white font-medium">
                  {selectedFaculty.qualification}
                </span>
              </div>
              <div>
                <strong className="text-gray-400 block mb-0.5">
                  Joined Date
                </strong>
                <span className="text-white font-medium">
                  {selectedFaculty.joinedAt}
                </span>
              </div>
            </div>
            <div className="text-end">
              <Button variant="ghost" onClick={() => setShowViewModal(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
