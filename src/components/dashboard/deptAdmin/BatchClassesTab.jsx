"use client";

import { useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Users,
  Clock,
  GraduationCap,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function BatchClassesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    batch: "",
    credits: "",
    type: "theory",
    hoursPerWeek: "",
  });

  const batches = [
    { id: "all", name: "All Batches" },
    { id: "2024", name: "Batch 2024 (1st Year)" },
    { id: "2023", name: "Batch 2023 (2nd Year)" },
    { id: "2022", name: "Batch 2022 (3rd Year)" },
    { id: "2021", name: "Batch 2021 (4th Year)" },
  ];

  const [classes, setClasses] = useState([
    {
      id: 1,
      code: "CS101",
      name: "Introduction to Programming",
      batch: "2024",
      credits: 4,
      type: "theory",
      hoursPerWeek: 4,
      assignedFaculty: "Dr. John Smith",
      students: 120,
    },
    {
      id: 2,
      code: "CS102",
      name: "Digital Logic Design",
      batch: "2024",
      credits: 3,
      type: "theory",
      hoursPerWeek: 3,
      assignedFaculty: "Prof. Sarah Wilson",
      students: 120,
    },
    {
      id: 3,
      code: "CS201",
      name: "Data Structures",
      batch: "2023",
      credits: 4,
      type: "theory",
      hoursPerWeek: 4,
      assignedFaculty: "Dr. Mike Chen",
      students: 115,
    },
    {
      id: 4,
      code: "CS202",
      name: "Object Oriented Programming",
      batch: "2023",
      credits: 4,
      type: "lab",
      hoursPerWeek: 6,
      assignedFaculty: "Prof. Emily Brown",
      students: 115,
    },
    {
      id: 5,
      code: "CS301",
      name: "Database Management Systems",
      batch: "2022",
      credits: 4,
      type: "theory",
      hoursPerWeek: 4,
      assignedFaculty: null,
      students: 110,
    },
    {
      id: 6,
      code: "CS302",
      name: "Computer Networks",
      batch: "2022",
      credits: 4,
      type: "theory",
      hoursPerWeek: 4,
      assignedFaculty: "Dr. John Smith",
      students: 110,
    },
    {
      id: 7,
      code: "CS401",
      name: "Machine Learning",
      batch: "2021",
      credits: 4,
      type: "theory",
      hoursPerWeek: 4,
      assignedFaculty: "Dr. Alex Kumar",
      students: 105,
    },
    {
      id: 8,
      code: "CS402",
      name: "Cloud Computing",
      batch: "2021",
      credits: 3,
      type: "lab",
      hoursPerWeek: 4,
      assignedFaculty: null,
      students: 105,
    },
  ]);

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = selectedBatch === "all" || cls.batch === selectedBatch;
    return matchesSearch && matchesBatch;
  });

  const handleAddClass = () => {
    const newClass = {
      id: classes.length + 1,
      ...formData,
      credits: parseInt(formData.credits),
      hoursPerWeek: parseInt(formData.hoursPerWeek),
      assignedFaculty: null,
      students: 0,
    };
    setClasses([...classes, newClass]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditClass = () => {
    setClasses(
      classes.map((cls) =>
        cls.id === selectedClass.id
          ? {
              ...cls,
              ...formData,
              credits: parseInt(formData.credits),
              hoursPerWeek: parseInt(formData.hoursPerWeek),
            }
          : cls,
      ),
    );
    setShowEditModal(false);
    setSelectedClass(null);
    resetForm();
  };

  const handleDeleteClass = (id) => {
    if (confirm("Are you sure you want to delete this class?")) {
      setClasses(classes.filter((cls) => cls.id !== id));
    }
  };

  const openEditModal = (cls) => {
    setSelectedClass(cls);
    setFormData({
      code: cls.code,
      name: cls.name,
      batch: cls.batch,
      credits: cls.credits.toString(),
      type: cls.type,
      hoursPerWeek: cls.hoursPerWeek.toString(),
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      batch: "",
      credits: "",
      type: "theory",
      hoursPerWeek: "",
    });
  };

  const stats = {
    total: classes.length,
    assigned: classes.filter((c) => c.assignedFaculty).length,
    unassigned: classes.filter((c) => !c.assignedFaculty).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Batch Classes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Assign and manage classes for each batch
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Classes
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-green-500">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.assigned}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Faculty Assigned
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-orange-500">
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {stats.unassigned}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Needs Assignment
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {batches.map((batch) => (
                <option
                  key={batch.id}
                  value={batch.id}
                  className="bg-white dark:bg-gray-800"
                >
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Classes List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredClasses.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                hover
                className={!cls.assignedFaculty ? "border-orange-500/30" : ""}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        cls.type === "theory"
                          ? "bg-blue-500/20 text-blue-500"
                          : "bg-green-500/20 text-green-500"
                      }`}
                    >
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {cls.code}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            cls.type === "theory"
                              ? "bg-blue-500/20 text-blue-500"
                              : "bg-green-500/20 text-green-500"
                          }`}
                        >
                          {cls.type}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {cls.name}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          Batch {cls.batch}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {cls.hoursPerWeek} hrs/week
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {cls.students} students
                        </span>
                        <span>{cls.credits} credits</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase">
                        Assigned Faculty
                      </p>
                      {cls.assignedFaculty ? (
                        <p className="font-medium text-gray-900 dark:text-white">
                          {cls.assignedFaculty}
                        </p>
                      ) : (
                        <p className="text-orange-500 font-medium">
                          Not Assigned
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => openEditModal(cls)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteClass(cls.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredClasses.length === 0 && (
          <Card className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No classes found</p>
          </Card>
        )}
      </div>

      {/* Add Class Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Class"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Class Code *
              </label>
              <Input
                placeholder="e.g., CS101"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Batch *
              </label>
              <select
                value={formData.batch}
                onChange={(e) =>
                  setFormData({ ...formData, batch: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="" className="bg-white dark:bg-gray-800">
                  Select Batch
                </option>
                {batches
                  .filter((b) => b.id !== "all")
                  .map((batch) => (
                    <option
                      key={batch.id}
                      value={batch.id}
                      className="bg-white dark:bg-gray-800"
                    >
                      {batch.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Class Name *
            </label>
            <Input
              placeholder="e.g., Introduction to Programming"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="theory" className="bg-white dark:bg-gray-800">
                  Theory
                </option>
                <option value="lab" className="bg-white dark:bg-gray-800">
                  Lab
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Credits *
              </label>
              <Input
                type="number"
                placeholder="4"
                value={formData.credits}
                onChange={(e) =>
                  setFormData({ ...formData, credits: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hours/Week *
              </label>
              <Input
                type="number"
                placeholder="4"
                value={formData.hoursPerWeek}
                onChange={(e) =>
                  setFormData({ ...formData, hoursPerWeek: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleAddClass}
              disabled={!formData.code || !formData.name || !formData.batch}
            >
              Add Class
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Class Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedClass(null);
          resetForm();
        }}
        title="Edit Class"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Class Code *
              </label>
              <Input
                placeholder="e.g., CS101"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Batch *
              </label>
              <select
                value={formData.batch}
                onChange={(e) =>
                  setFormData({ ...formData, batch: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white"
              >
                {batches
                  .filter((b) => b.id !== "all")
                  .map((batch) => (
                    <option
                      key={batch.id}
                      value={batch.id}
                      className="bg-white dark:bg-gray-800"
                    >
                      {batch.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Class Name *
            </label>
            <Input
              placeholder="e.g., Introduction to Programming"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="theory" className="bg-white dark:bg-gray-800">
                  Theory
                </option>
                <option value="lab" className="bg-white dark:bg-gray-800">
                  Lab
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Credits *
              </label>
              <Input
                type="number"
                placeholder="4"
                value={formData.credits}
                onChange={(e) =>
                  setFormData({ ...formData, credits: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hours/Week *
              </label>
              <Input
                type="number"
                placeholder="4"
                value={formData.hoursPerWeek}
                onChange={(e) =>
                  setFormData({ ...formData, hoursPerWeek: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleEditClass}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
