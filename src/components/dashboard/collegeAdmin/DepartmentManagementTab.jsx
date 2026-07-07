"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  User,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle,
  XOctagon,
  RefreshCw,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function DepartmentManagementTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHodModal, setShowHodModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    hodId: "",
  });

  const [hodForm, setHodForm] = useState({
    hodId: "",
  });

  const fetchDepartmentsData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/departments");
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to load departments data");

      setDepartments(data.departments || []);
      setFaculty(data.faculty || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentsData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert("Name and Code are required.");
      return;
    }

    setActioningId("create");
    try {
      const res = await fetch("/api/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create department");

      setShowCreateModal(false);
      setFormData({ name: "", code: "", hodId: "" });
      fetchDepartmentsData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleUpdateHodSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDept) return;

    setActioningId("hod");
    try {
      const res = await fetch(`/api/admin/departments?id=${selectedDept._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hodId: hodForm.hodId || null }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update HOD");

      setShowHodModal(false);
      setSelectedDept(null);
      setHodForm({ hodId: "" });
      fetchDepartmentsData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleToggleStatus = async (dept) => {
    const nextStatus = dept.status === "active" ? "inactive" : "active";
    if (
      !confirm(
        `Are you sure you want to make the ${dept.code} department ${nextStatus}?`,
      )
    ) {
      return;
    }

    setActioningId(dept._id);
    try {
      const res = await fetch(`/api/admin/departments?id=${dept._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle status");

      fetchDepartmentsData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const filteredDepts = departments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || dept.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500 dark:text-gray-400">
          Loading Departments Directory...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="font-bold">Failed to load departments</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-purple-500" />
            <span>Academic Departments</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Charter academic departments, appoint Head of Departments (HOD), and
            manage status.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by department name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 uppercase">
            Status:
          </span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Grid View */}
      {filteredDepts.length === 0 ? (
        <Card className="border border-gray-200 dark:border-white/10 text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            No Departments Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            No departments chartered match your active search criteria.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepts.map((dept) => {
            const isActive = dept.status === "active";
            return (
              <Card
                key={dept._id}
                className="border border-gray-200 dark:border-white/10 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {dept.name}
                      </h3>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold font-mono text-xs">
                        {dept.code}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {dept.status}
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 dark:border-white/5 pt-3 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-400" />
                      <div>
                        <span className="text-gray-400 block">
                          Head of Department (HOD)
                        </span>
                        <span className="text-white font-medium">
                          {dept.hod?.name || "Unassigned / Vacant"}
                        </span>
                        {dept.hod?.email && (
                          <span className="text-gray-500 block font-mono">
                            {dept.hod.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-100 dark:border-white/5 pt-4 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDept(dept);
                      setHodForm({ hodId: dept.hod?._id || "" });
                      setShowHodModal(true);
                    }}
                    className="flex-1 text-xs border-purple-500/20 hover:bg-purple-500/10 text-purple-400"
                  >
                    <Shield className="w-3.5 h-3.5 mr-1.5" />
                    Appoint HOD
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => handleToggleStatus(dept)}
                    disabled={actioningId !== null}
                    className={`px-3 ${
                      isActive
                        ? "text-red-500 hover:bg-red-500/10"
                        : "text-green-500 hover:bg-green-500/10"
                    }`}
                  >
                    <XOctagon className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Department Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Charter Academic Department"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Department Name"
            type="text"
            placeholder="e.g. Civil Engineering"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
          />

          <Input
            label="Department Code"
            type="text"
            placeholder="e.g. CE"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
          />

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Appoint Initial HOD (Optional)
            </label>
            <select
              value={formData.hodId}
              onChange={(e) =>
                setFormData({ ...formData, hodId: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-955 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="" className="text-gray-950 dark:text-white">
                Leave Vacant
              </option>
              {faculty.map((f) => (
                <option
                  key={f._id}
                  value={f._id}
                  className="text-gray-955 dark:text-white"
                >
                  {f.name} ({f.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={actioningId === "create"}
            >
              {actioningId === "create"
                ? "Chartering..."
                : "Charter Department"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Appoint HOD Modal */}
      <Modal
        isOpen={showHodModal}
        onClose={() => {
          setShowHodModal(false);
          setSelectedDept(null);
        }}
        title={`Appoint HOD - ${selectedDept?.code}`}
      >
        <form onSubmit={handleUpdateHodSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Select Department Head
            </label>
            <select
              value={hodForm.hodId}
              onChange={(e) => setHodForm({ hodId: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-955 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="" className="text-gray-950 dark:text-white">
                Leave Vacant / Remove HOD
              </option>
              {faculty.map((f) => (
                <option
                  key={f._id}
                  value={f._id}
                  className="text-gray-955 dark:text-white"
                >
                  {f.name} ({f.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowHodModal(false);
                setSelectedDept(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={actioningId === "hod"}
            >
              {actioningId === "hod" ? "Appointing..." : "Confirm Appointment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
