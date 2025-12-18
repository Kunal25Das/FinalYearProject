"use client";

import { useState } from "react";
import {
  UserCheck,
  Search,
  Filter,
  BookOpen,
  Users,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function FacultyAssignTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState("");

  const batches = [
    { id: "all", name: "All Batches" },
    { id: "2024", name: "Batch 2024" },
    { id: "2023", name: "Batch 2023" },
    { id: "2022", name: "Batch 2022" },
    { id: "2021", name: "Batch 2021" },
  ];

  const [faculty, setFaculty] = useState([
    {
      id: 1,
      name: "Dr. John Smith",
      designation: "Professor",
      specialization: "Networks, Security",
      currentLoad: 12,
      maxLoad: 16,
    },
    {
      id: 2,
      name: "Prof. Sarah Wilson",
      designation: "Associate Professor",
      specialization: "Data Science, ML",
      currentLoad: 14,
      maxLoad: 16,
    },
    {
      id: 3,
      name: "Dr. Mike Chen",
      designation: "Assistant Professor",
      specialization: "Algorithms, DS",
      currentLoad: 10,
      maxLoad: 14,
    },
    {
      id: 4,
      name: "Prof. Emily Brown",
      designation: "Associate Professor",
      specialization: "OOP, Software Eng",
      currentLoad: 8,
      maxLoad: 14,
    },
    {
      id: 5,
      name: "Dr. Alex Kumar",
      designation: "Professor",
      specialization: "AI, Deep Learning",
      currentLoad: 12,
      maxLoad: 16,
    },
    {
      id: 6,
      name: "Dr. Lisa Park",
      designation: "Assistant Professor",
      specialization: "DBMS, Big Data",
      currentLoad: 6,
      maxLoad: 14,
    },
  ]);

  const [classes, setClasses] = useState([
    {
      id: 1,
      code: "CS101",
      name: "Introduction to Programming",
      batch: "2024",
      hoursPerWeek: 4,
      assignedFaculty: null,
      assignedFacultyId: null,
    },
    {
      id: 2,
      code: "CS102",
      name: "Digital Logic Design",
      batch: "2024",
      hoursPerWeek: 3,
      assignedFaculty: "Prof. Sarah Wilson",
      assignedFacultyId: 2,
    },
    {
      id: 3,
      code: "CS201",
      name: "Data Structures",
      batch: "2023",
      hoursPerWeek: 4,
      assignedFaculty: "Dr. Mike Chen",
      assignedFacultyId: 3,
    },
    {
      id: 4,
      code: "CS202",
      name: "Object Oriented Programming",
      batch: "2023",
      hoursPerWeek: 6,
      assignedFaculty: "Prof. Emily Brown",
      assignedFacultyId: 4,
    },
    {
      id: 5,
      code: "CS301",
      name: "Database Management Systems",
      batch: "2022",
      hoursPerWeek: 4,
      assignedFaculty: null,
      assignedFacultyId: null,
    },
    {
      id: 6,
      code: "CS302",
      name: "Computer Networks",
      batch: "2022",
      hoursPerWeek: 4,
      assignedFaculty: "Dr. John Smith",
      assignedFacultyId: 1,
    },
    {
      id: 7,
      code: "CS401",
      name: "Machine Learning",
      batch: "2021",
      hoursPerWeek: 4,
      assignedFaculty: "Dr. Alex Kumar",
      assignedFacultyId: 5,
    },
    {
      id: 8,
      code: "CS402",
      name: "Cloud Computing",
      batch: "2021",
      hoursPerWeek: 4,
      assignedFaculty: null,
      assignedFacultyId: null,
    },
  ]);

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = selectedBatch === "all" || cls.batch === selectedBatch;
    return matchesSearch && matchesBatch;
  });

  const unassignedClasses = classes.filter((c) => !c.assignedFaculty);

  const openAssignModal = (cls) => {
    setSelectedClass(cls);
    setSelectedFaculty(cls.assignedFacultyId?.toString() || "");
    setShowAssignModal(true);
  };

  const handleAssign = () => {
    if (!selectedFaculty || !selectedClass) return;

    const facultyMember = faculty.find(
      (f) => f.id === parseInt(selectedFaculty),
    );
    const previousFacultyId = selectedClass.assignedFacultyId;

    // Update class assignment
    setClasses(
      classes.map((cls) =>
        cls.id === selectedClass.id
          ? {
              ...cls,
              assignedFaculty: facultyMember.name,
              assignedFacultyId: facultyMember.id,
            }
          : cls,
      ),
    );

    // Update faculty load
    setFaculty(
      faculty.map((f) => {
        if (f.id === facultyMember.id) {
          return {
            ...f,
            currentLoad: f.currentLoad + selectedClass.hoursPerWeek,
          };
        }
        if (f.id === previousFacultyId) {
          return {
            ...f,
            currentLoad: f.currentLoad - selectedClass.hoursPerWeek,
          };
        }
        return f;
      }),
    );

    setShowAssignModal(false);
    setSelectedClass(null);
    setSelectedFaculty("");
  };

  const handleUnassign = (cls) => {
    if (!confirm(`Remove ${cls.assignedFaculty} from ${cls.code}?`)) return;

    const facultyMember = faculty.find((f) => f.id === cls.assignedFacultyId);

    setClasses(
      classes.map((c) =>
        c.id === cls.id
          ? { ...c, assignedFaculty: null, assignedFacultyId: null }
          : c,
      ),
    );

    if (facultyMember) {
      setFaculty(
        faculty.map((f) =>
          f.id === facultyMember.id
            ? { ...f, currentLoad: f.currentLoad - cls.hoursPerWeek }
            : f,
        ),
      );
    }
  };

  const getLoadColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-orange-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Faculty Assignment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Assign faculty members to classes
          </p>
        </div>
        {unassignedClasses.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-orange-500 font-medium">
              {unassignedClasses.length} class(es) need assignment
            </span>
          </div>
        )}
      </div>

      {/* Faculty Load Overview */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Faculty Load Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {faculty.map((f) => (
            <div
              key={f.id}
              className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl"
            >
              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                {f.name}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`text-lg font-bold ${getLoadColor(f.currentLoad, f.maxLoad)}`}
                >
                  {f.currentLoad}/{f.maxLoad}
                </span>
                <span className="text-xs text-gray-500">hrs</span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    f.currentLoad / f.maxLoad >= 0.9
                      ? "bg-red-500"
                      : f.currentLoad / f.maxLoad >= 0.7
                        ? "bg-orange-500"
                        : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min((f.currentLoad / f.maxLoad) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

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
                        cls.assignedFaculty
                          ? "bg-green-500/20 text-green-500"
                          : "bg-orange-500/20 text-orange-500"
                      }`}
                    >
                      {cls.assignedFaculty ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <AlertCircle className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {cls.code}
                        </h3>
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-500 text-xs rounded-full">
                          Batch {cls.batch}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {cls.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {cls.hoursPerWeek} hours/week
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {cls.assignedFaculty ? (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-500 uppercase">
                            Assigned To
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {cls.assignedFaculty}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => handleUnassign(cls)}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => openAssignModal(cls)}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => openAssignModal(cls)}>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Assign Faculty
                      </Button>
                    )}
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

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedClass(null);
          setSelectedFaculty("");
        }}
        title="Assign Faculty"
      >
        {selectedClass && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedClass.code} - {selectedClass.name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Batch {selectedClass.batch} • {selectedClass.hoursPerWeek}{" "}
                hours/week
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Faculty Member
              </label>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" className="bg-white dark:bg-gray-800">
                  Select a faculty member
                </option>
                {faculty.map((f) => {
                  const newLoad = f.currentLoad + selectedClass.hoursPerWeek;
                  const isOverloaded = newLoad > f.maxLoad;
                  return (
                    <option
                      key={f.id}
                      value={f.id}
                      className="bg-white dark:bg-gray-800"
                      disabled={
                        isOverloaded && f.id !== selectedClass.assignedFacultyId
                      }
                    >
                      {f.name} ({f.currentLoad}/{f.maxLoad} hrs)
                      {isOverloaded && f.id !== selectedClass.assignedFacultyId
                        ? " - Overloaded"
                        : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedFaculty && (
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {(() => {
                    const f = faculty.find(
                      (f) => f.id === parseInt(selectedFaculty),
                    );
                    if (!f) return null;
                    const adjustment =
                      selectedClass.assignedFacultyId === f.id
                        ? 0
                        : selectedClass.hoursPerWeek;
                    return (
                      <>
                        <strong>{f.name}</strong> will have{" "}
                        <strong>
                          {f.currentLoad + adjustment}/{f.maxLoad}
                        </strong>{" "}
                        hours after assignment.
                      </>
                    );
                  })()}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAssign}
                disabled={!selectedFaculty}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Assign
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
