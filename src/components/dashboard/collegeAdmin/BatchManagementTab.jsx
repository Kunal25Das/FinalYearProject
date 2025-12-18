"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  GraduationCap,
  Building,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Download,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function BatchManagementTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState("all");

  const departments = [
    { id: "cse", name: "Computer Science & Engineering" },
    { id: "ece", name: "Electronics & Communication" },
    { id: "me", name: "Mechanical Engineering" },
    { id: "ce", name: "Civil Engineering" },
    { id: "ee", name: "Electrical Engineering" },
    { id: "it", name: "Information Technology" },
  ];

  const [batches, setBatches] = useState([
    {
      id: 1,
      name: "CSE Batch 2024",
      year: "2024",
      department: "CSE",
      departmentFull: "Computer Science & Engineering",
      totalStudents: 120,
      activeStudents: 118,
      sections: ["A", "B", "C"],
      classAdvisor: "Dr. Sharma",
      createdAt: "Aug 15, 2024",
      status: "active",
      students: [
        {
          id: 1,
          name: "John Doe",
          rollNo: "CSE2024001",
          email: "john@univ.edu",
          section: "A",
        },
        {
          id: 2,
          name: "Jane Smith",
          rollNo: "CSE2024002",
          email: "jane@univ.edu",
          section: "A",
        },
        {
          id: 3,
          name: "Mike Johnson",
          rollNo: "CSE2024003",
          email: "mike@univ.edu",
          section: "B",
        },
      ],
    },
    {
      id: 2,
      name: "ECE Batch 2024",
      year: "2024",
      department: "ECE",
      departmentFull: "Electronics & Communication",
      totalStudents: 115,
      activeStudents: 115,
      sections: ["A", "B"],
      classAdvisor: "Dr. Patel",
      createdAt: "Aug 15, 2024",
      status: "active",
      students: [],
    },
    {
      id: 3,
      name: "CSE Batch 2023",
      year: "2023",
      department: "CSE",
      departmentFull: "Computer Science & Engineering",
      totalStudents: 110,
      activeStudents: 108,
      sections: ["A", "B"],
      classAdvisor: "Prof. Kumar",
      createdAt: "Aug 10, 2023",
      status: "active",
      students: [],
    },
    {
      id: 4,
      name: "ME Batch 2024",
      year: "2024",
      department: "ME",
      departmentFull: "Mechanical Engineering",
      totalStudents: 90,
      activeStudents: 88,
      sections: ["A", "B"],
      classAdvisor: "Dr. Singh",
      createdAt: "Aug 15, 2024",
      status: "active",
      students: [],
    },
    {
      id: 5,
      name: "CSE Batch 2021",
      year: "2021",
      department: "CSE",
      departmentFull: "Computer Science & Engineering",
      totalStudents: 100,
      activeStudents: 0,
      sections: ["A", "B"],
      classAdvisor: "Dr. Rao",
      createdAt: "Aug 10, 2021",
      status: "graduated",
      students: [],
    },
  ]);

  const [newBatch, setNewBatch] = useState({
    name: "",
    year: new Date().getFullYear().toString(),
    department: "",
    sections: ["A"],
    classAdvisor: "",
  });

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      filterDepartment === "all" ||
      batch.department.toLowerCase() === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const handleCreateBatch = () => {
    if (!newBatch.name || !newBatch.department) return;

    const dept = departments.find((d) => d.id === newBatch.department);
    const batch = {
      id: batches.length + 1,
      name: newBatch.name,
      year: newBatch.year,
      department: newBatch.department.toUpperCase(),
      departmentFull: dept?.name || newBatch.department,
      totalStudents: 0,
      activeStudents: 0,
      sections: newBatch.sections,
      classAdvisor: newBatch.classAdvisor,
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "active",
      students: [],
    };

    setBatches([batch, ...batches]);
    setShowCreateModal(false);
    setNewBatch({
      name: "",
      year: new Date().getFullYear().toString(),
      department: "",
      sections: ["A"],
      classAdvisor: "",
    });
  };

  const handleDeleteBatch = (id) => {
    if (
      confirm(
        "Are you sure you want to delete this batch? This action cannot be undone.",
      )
    ) {
      setBatches(batches.filter((b) => b.id !== id));
    }
  };

  const addSection = () => {
    const nextSection = String.fromCharCode(65 + newBatch.sections.length);
    if (newBatch.sections.length < 6) {
      setNewBatch({
        ...newBatch,
        sections: [...newBatch.sections, nextSection],
      });
    }
  };

  const removeSection = () => {
    if (newBatch.sections.length > 1) {
      setNewBatch({ ...newBatch, sections: newBatch.sections.slice(0, -1) });
    }
  };

  const stats = {
    totalBatches: batches.length,
    activeBatches: batches.filter((b) => b.status === "active").length,
    totalStudents: batches.reduce((sum, b) => sum + b.totalStudents, 0),
    activeStudents: batches.reduce((sum, b) => sum + b.activeStudents, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Batch Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage student batches across departments
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Batch
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalBatches}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Batches
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-green-500">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.activeBatches}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active Batches
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-blue-500">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalStudents}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Students
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-purple-500">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.activeStudents}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active Students
          </p>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all" className="bg-white dark:bg-gray-800">
              All Departments
            </option>
            {departments.map((dept) => (
              <option
                key={dept.id}
                value={dept.id}
                className="bg-white dark:bg-gray-800"
              >
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Batches List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredBatches.map((batch) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="overflow-hidden">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setExpandedBatch(
                      expandedBatch === batch.id ? null : batch.id,
                    )
                  }
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        batch.status === "active"
                          ? "bg-linear-to-br from-purple-500 to-indigo-500"
                          : "bg-gray-400"
                      }`}
                    >
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {batch.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            batch.status === "active"
                              ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                              : "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {batch.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {batch.departmentFull}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {batch.activeStudents}
                      </p>
                      <p className="text-xs text-gray-500">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                        {batch.sections.length}
                      </p>
                      <p className="text-xs text-gray-500">Sections</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBatch(batch);
                          setShowViewModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBatch(batch.id);
                        }}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {expandedBatch === batch.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedBatch === batch.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-gray-200 dark:border-white/10">
                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Year</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {batch.year}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Building className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Sections</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {batch.sections.join(", ")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">
                                Class Advisor
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {batch.classAdvisor || "Not Assigned"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Created</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {batch.createdAt}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Students
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export List
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Batch
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredBatches.length === 0 && (
          <Card className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No batches found matching your criteria
            </p>
          </Card>
        )}
      </div>

      {/* Create Batch Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Batch"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Batch Name *
            </label>
            <Input
              placeholder="e.g., CSE Batch 2025"
              value={newBatch.name}
              onChange={(e) =>
                setNewBatch({ ...newBatch, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department *
              </label>
              <select
                value={newBatch.department}
                onChange={(e) =>
                  setNewBatch({ ...newBatch, department: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" className="bg-white dark:bg-gray-800">
                  Select department
                </option>
                {departments.map((dept) => (
                  <option
                    key={dept.id}
                    value={dept.id}
                    className="bg-white dark:bg-gray-800"
                  >
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year *
              </label>
              <select
                value={newBatch.year}
                onChange={(e) =>
                  setNewBatch({ ...newBatch, year: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {[2025, 2024, 2023, 2022, 2021].map((year) => (
                  <option
                    key={year}
                    value={year}
                    className="bg-white dark:bg-gray-800"
                  >
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sections
            </label>
            <div className="flex items-center gap-3">
              <div className="flex gap-2 flex-wrap">
                {newBatch.sections.map((section) => (
                  <span
                    key={section}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg font-medium"
                  >
                    Section {section}
                  </span>
                ))}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={addSection}>
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeSection}
                  disabled={newBatch.sections.length <= 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Class Advisor (Optional)
            </label>
            <Input
              placeholder="e.g., Dr. Sharma"
              value={newBatch.classAdvisor}
              onChange={(e) =>
                setNewBatch({ ...newBatch, classAdvisor: e.target.value })
              }
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateBatch}
              disabled={!newBatch.name || !newBatch.department}
            >
              Create Batch
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Batch Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={selectedBatch?.name || "Batch Details"}
        size="lg"
      >
        {selectedBatch && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Department</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedBatch.departmentFull}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Year</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedBatch.year}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Total Students</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedBatch.totalStudents}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Active Students</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedBatch.activeStudents}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Section Distribution
              </h4>
              <div className="flex gap-3">
                {selectedBatch.sections.map((section) => (
                  <div
                    key={section}
                    className="flex-1 p-4 bg-linear-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl text-center"
                  >
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {Math.floor(
                        selectedBatch.activeStudents /
                          selectedBatch.sections.length,
                      )}
                    </p>
                    <p className="text-sm text-gray-500">Section {section}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedBatch.students.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Recent Students
                </h4>
                <div className="space-y-2">
                  {selectedBatch.students.slice(0, 5).map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.rollNo}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-purple-600 dark:text-purple-400">
                        Section {student.section}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
