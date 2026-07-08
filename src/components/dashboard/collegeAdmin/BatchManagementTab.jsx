"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Trash2,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function BatchManagementTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    year: "",
    department: "CSE",
    sectionsText: "",
  });

  const [departments, setDepartments] = useState([]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/batches");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBatches(data.batches || []);
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
    fetchBatches();
    fetchDepartments();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActioningId("create");

    const sections = formData.sectionsText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    try {
      const res = await fetch("/api/admin/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          year: formData.year,
          department: formData.department,
          sections,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowCreateModal(false);
      setFormData({
        name: "",
        year: "",
        department: "CSE",
        sectionsText: "",
      });
      fetchBatches(); // Reload
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this batch? All student allocations will remain intact but the batch grouping will be deleted.",
      )
    )
      return;
    setActioningId(id);
    try {
      const res = await fetch(`/api/admin/batches?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBatches((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch = batch.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDept =
      filterDepartment === "all" ||
      batch.department === filterDepartment ||
      batch.departmentCode === filterDepartment;
    return matchesSearch && matchesDept;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500 dark:text-gray-400">
          Loading Batches...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="font-bold">Failed to load batches</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Batch Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Define dynamic batches, sections, and assign class advisors for your
            students.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          <span>Define New Batch</span>
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="border border-gray-200 dark:border-white/10 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search batches by name..."
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

      {/* Batches Accordion */}
      {filteredBatches.length === 0 ? (
        <Card className="text-center py-12 border border-gray-200 dark:border-white/10">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            No Batches Defined
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            There are no batches registered under this search.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBatches.map((batch) => {
            const isExpanded = expandedBatch === batch.id;
            return (
              <Card
                key={batch.id}
                className="border border-gray-200 dark:border-white/10 overflow-hidden !p-0"
              >
                {/* Accordion Header */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors gap-4"
                  onClick={() => setExpandedBatch(isExpanded ? null : batch.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {batch.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {batch.departmentFull} • Year {batch.year}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between sm:justify-start">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {batch.totalStudents} Students
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {batch.status === "passout" ? (
                        <span className="px-2.5 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-semibold">
                          Passout
                        </span>
                      ) : (
                        batch.year === new Date().getFullYear().toString() && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  `Are you sure you want to mark ${batch.name} as Passout?`,
                                )
                              ) {
                                setActioningId(batch.id);
                                try {
                                  const res = await fetch(
                                    "/api/admin/batches",
                                    {
                                      method: "PUT",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        id: batch.id,
                                        status: "passout",
                                      }),
                                    },
                                  );
                                  if (!res.ok) {
                                    const data = await res.json();
                                    throw new Error(
                                      data.error || "Failed to update batch",
                                    );
                                  }
                                  alert(
                                    "Batch successfully marked as Passout!",
                                  );
                                  fetchBatches();
                                } catch (err) {
                                  alert(err.message);
                                } finally {
                                  setActioningId(null);
                                }
                              }
                            }}
                            disabled={actioningId !== null}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3"
                          >
                            Mark as Passout
                          </Button>
                        )
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(batch.id);
                        }}
                        disabled={actioningId !== null}
                        className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                      <button className="text-gray-400 p-2">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Accordion Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/2"
                    >
                      <div className="p-6 space-y-4">
                        <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-2">
                          <strong className="text-gray-300">
                            Sections defined:
                          </strong>
                          {batch.sections.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-sm font-mono"
                            >
                              Sec {s}
                            </span>
                          ))}
                        </div>

                        {batch.students.length === 0 ? (
                          <div className="text-center py-6 text-gray-500 text-sm">
                            No students registered under this batch yet. Import
                            students to allocate them.
                          </div>
                        ) : (
                          <div className="border border-white/5 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-white/5 text-xs text-gray-400 uppercase border-b border-white/10">
                                  <th className="p-3">Roll No</th>
                                  <th className="p-3">Name</th>
                                  <th className="p-3">Email</th>
                                  <th className="p-3">Section</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                                {batch.students.map((stud) => (
                                  <tr
                                    key={stud.id}
                                    className="hover:bg-white/5"
                                  >
                                    <td className="p-3 font-mono text-purple-400">
                                      {stud.rollNo}
                                    </td>
                                    <td className="p-3 font-medium text-slate dark:text-white">
                                      {stud.name}
                                    </td>
                                    <td className="p-3">{stud.email}</td>
                                    <td className="p-3 font-semibold">
                                      {stud.section}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}

      {/* Define Batch Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Define Academic Batch"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Batch Name"
            type="text"
            placeholder="e.g. CSE Batch 2024"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-white/5 border-white/10 dark:text-white placeholder:text-gray-500 focus:border-purple-500"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Graduation Year"
              type="text"
              placeholder="e.g. 2024"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              required
              className="bg-white/5 border-white/10 dark:text-white placeholder:text-gray-500 focus:border-purple-500"
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
          </div>

          <Input
            label="Sections (optional, comma separated)"
            type="text"
            placeholder="e.g. A, B, C (leave blank if none)"
            value={formData.sectionsText}
            onChange={(e) =>
              setFormData({ ...formData, sectionsText: e.target.value })
            }
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
          />

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
              disabled={actioningId !== null}
            >
              {actioningId === "create" ? "Creating..." : "Define Batch"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
