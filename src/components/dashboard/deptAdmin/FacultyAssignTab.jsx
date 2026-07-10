"use client";

import { useState, useEffect } from "react";
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

  const [batches, setBatches] = useState([{ id: "all", name: "All Batches" }]);
  const [faculty, setFaculty] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [facRes, clsRes, batchRes] = await Promise.all([
        fetch("/api/dept-admin/faculty"),
        fetch("/api/dept-admin/classes"),
        fetch("/api/dept-admin/batches"),
      ]);
      const facData = await facRes.json();
      const clsData = await clsRes.json();
      const batchData = await batchRes.json();
      if (facData.success && clsData.success) {
        setFaculty(facData.faculty);
        setClasses(clsData.classes);
      }
      if (batchData.success) {
        setBatches([{ id: "all", name: "All Batches" }, ...batchData.batches]);
      }
    } catch (err) {
      console.error("Error loading assign data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

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

  const handleAssign = async () => {
    if (!selectedFaculty || !selectedClass) return;

    try {
      const res = await fetch("/api/dept-admin/classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedClass.id,
          assignedFacultyId: selectedFaculty,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadData();
        setShowAssignModal(false);
        setSelectedClass(null);
        setSelectedFaculty("");
      } else {
        alert(data.error || "Failed to assign faculty");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while assigning faculty");
    }
  };

  const handleUnassign = async (cls) => {
    if (!confirm(`Remove ${cls.assignedFaculty} from ${cls.code}?`)) return;

    try {
      const res = await fetch("/api/dept-admin/classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cls.id,
          assignedFacultyId: null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadData();
      } else {
        alert(data.error || "Failed to unassign faculty");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while unassigning faculty");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
