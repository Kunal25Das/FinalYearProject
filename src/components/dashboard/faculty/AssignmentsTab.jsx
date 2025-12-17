"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  Eye,
  Download,
  Trash2,
  Edit2,
  Filter,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function AssignmentsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    classId: "",
    dueDate: "",
    dueTime: "23:59",
    totalMarks: 100,
    attachments: [],
  });

  const myClasses = [
    { id: "all", name: "All Classes" },
    { id: "1", name: "Data Structures (CS-A 2024)", students: 45 },
    { id: "2", name: "Algorithm Design (CS-B 2024)", students: 52 },
    { id: "3", name: "Database Systems (CS-A 2023)", students: 40 },
    { id: "4", name: "Computer Networks (CS-C 2024)", students: 50 },
  ];

  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: "Assignment 1: Arrays and Linked Lists",
      description:
        "Implement basic operations on arrays and linked lists. Include time complexity analysis.",
      classId: "1",
      className: "Data Structures",
      batch: "CS-A 2024",
      dueDate: "Dec 20, 2025",
      dueTime: "11:59 PM",
      totalMarks: 100,
      totalStudents: 45,
      submitted: 38,
      graded: 25,
      status: "active",
      createdAt: "Dec 10, 2025",
    },
    {
      id: 2,
      title: "Assignment 2: Sorting Algorithms",
      description:
        "Compare and implement various sorting algorithms with benchmarks.",
      classId: "2",
      className: "Algorithm Design",
      batch: "CS-B 2024",
      dueDate: "Dec 22, 2025",
      dueTime: "11:59 PM",
      totalMarks: 100,
      totalStudents: 52,
      submitted: 20,
      graded: 0,
      status: "active",
      createdAt: "Dec 12, 2025",
    },
    {
      id: 3,
      title: "Lab Exercise: SQL Queries",
      description: "Write SQL queries for the given database schema.",
      classId: "3",
      className: "Database Systems",
      batch: "CS-A 2023",
      dueDate: "Dec 15, 2025",
      dueTime: "11:59 PM",
      totalMarks: 50,
      totalStudents: 40,
      submitted: 40,
      graded: 40,
      status: "completed",
      createdAt: "Dec 5, 2025",
    },
    {
      id: 4,
      title: "Assignment 3: Binary Trees",
      description: "Implement binary tree traversals and BST operations.",
      classId: "1",
      className: "Data Structures",
      batch: "CS-A 2024",
      dueDate: "Dec 28, 2025",
      dueTime: "11:59 PM",
      totalMarks: 100,
      totalStudents: 45,
      submitted: 0,
      graded: 0,
      status: "active",
      createdAt: "Dec 16, 2025",
    },
  ]);

  const [submissions] = useState([
    {
      id: 1,
      studentName: "Alice Johnson",
      studentId: "CS2024001",
      submittedAt: "Dec 18, 2025 10:30 PM",
      status: "graded",
      marks: 85,
      feedback: "Good work!",
    },
    {
      id: 2,
      studentName: "Bob Smith",
      studentId: "CS2024002",
      submittedAt: "Dec 19, 2025 2:15 PM",
      status: "graded",
      marks: 72,
      feedback: "Needs improvement in complexity analysis",
    },
    {
      id: 3,
      studentName: "Charlie Brown",
      studentId: "CS2024003",
      submittedAt: "Dec 19, 2025 8:45 PM",
      status: "submitted",
      marks: null,
      feedback: null,
    },
    {
      id: 4,
      studentName: "Diana Prince",
      studentId: "CS2024004",
      submittedAt: "Dec 20, 2025 11:30 PM",
      status: "late",
      marks: null,
      feedback: null,
    },
    {
      id: 5,
      studentName: "Eve Wilson",
      studentId: "CS2024005",
      submittedAt: null,
      status: "pending",
      marks: null,
      feedback: null,
    },
  ]);

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = assignment.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesClass =
      selectedClass === "all" || assignment.classId === selectedClass;
    const matchesStatus =
      statusFilter === "all" || assignment.status === statusFilter;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleCreateAssignment = () => {
    if (
      assignmentForm.title &&
      assignmentForm.classId &&
      assignmentForm.dueDate
    ) {
      const targetClass = myClasses.find(
        (c) => c.id === assignmentForm.classId,
      );

      if (editingAssignment) {
        setAssignments(
          assignments.map((a) =>
            a.id === editingAssignment.id
              ? {
                  ...a,
                  title: assignmentForm.title,
                  description: assignmentForm.description,
                  classId: assignmentForm.classId,
                  className: targetClass?.name.split(" (")[0] || "",
                  batch: targetClass?.name.match(/\(([^)]+)\)/)?.[1] || "",
                  dueDate: new Date(assignmentForm.dueDate).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  ),
                  dueTime:
                    assignmentForm.dueTime === "23:59"
                      ? "11:59 PM"
                      : assignmentForm.dueTime,
                  totalMarks: assignmentForm.totalMarks,
                }
              : a,
          ),
        );
      } else {
        const newAssignment = {
          id: Date.now(),
          title: assignmentForm.title,
          description: assignmentForm.description,
          classId: assignmentForm.classId,
          className: targetClass?.name.split(" (")[0] || "",
          batch: targetClass?.name.match(/\(([^)]+)\)/)?.[1] || "",
          dueDate: new Date(assignmentForm.dueDate).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric", year: "numeric" },
          ),
          dueTime:
            assignmentForm.dueTime === "23:59"
              ? "11:59 PM"
              : assignmentForm.dueTime,
          totalMarks: assignmentForm.totalMarks,
          totalStudents: targetClass?.students || 0,
          submitted: 0,
          graded: 0,
          status: "active",
          createdAt: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        };
        setAssignments([newAssignment, ...assignments]);
      }

      setShowCreateModal(false);
      setEditingAssignment(null);
      setAssignmentForm({
        title: "",
        description: "",
        classId: "",
        dueDate: "",
        dueTime: "23:59",
        totalMarks: 100,
        attachments: [],
      });
    }
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      title: assignment.title,
      description: assignment.description,
      classId: assignment.classId,
      dueDate: "",
      dueTime: "23:59",
      totalMarks: assignment.totalMarks,
      attachments: [],
    });
    setShowCreateModal(true);
  };

  const handleDeleteAssignment = (assignmentId) => {
    setAssignments(assignments.filter((a) => a.id !== assignmentId));
  };

  const handleViewSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionsModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
            Active
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
            Completed
          </span>
        );
      case "draft":
        return (
          <span className="px-2 py-1 bg-gray-500/20 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
            Draft
          </span>
        );
      default:
        return null;
    }
  };

  const getSubmissionStatusBadge = (status) => {
    switch (status) {
      case "graded":
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
            Graded
          </span>
        );
      case "submitted":
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
            Submitted
          </span>
        );
      case "late":
        return (
          <span className="px-2 py-1 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full text-xs font-medium">
            Late
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
            Not Submitted
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Assignments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage class assignments
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {assignments.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Assignments
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {assignments.filter((a) => a.status === "active").length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {assignments.reduce((sum, a) => sum + a.submitted, 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Submissions
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {assignments.reduce((sum, a) => sum + a.graded, 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Graded</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {myClasses.map((cls) => (
                <option
                  key={cls.id}
                  value={cls.id}
                  className="bg-white dark:bg-gray-800"
                >
                  {cls.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all" className="bg-white dark:bg-gray-800">
                All Status
              </option>
              <option value="active" className="bg-white dark:bg-gray-800">
                Active
              </option>
              <option value="completed" className="bg-white dark:bg-gray-800">
                Completed
              </option>
              <option value="draft" className="bg-white dark:bg-gray-800">
                Draft
              </option>
            </select>
          </div>
        </div>
      </Card>

      {/* Assignments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredAssignments.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-purple-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {assignment.title}
                      </h3>
                      {getStatusBadge(assignment.status)}
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {assignment.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">
                        {assignment.className} • {assignment.batch}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Due: {assignment.dueDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {assignment.dueTime}
                      </span>
                      <span>Max Marks: {assignment.totalMarks}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Submissions: {assignment.submitted}/
                          {assignment.totalStudents}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          Graded: {assignment.graded}/{assignment.submitted}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full flex">
                          <div
                            className="bg-green-500 transition-all"
                            style={{
                              width: `${(assignment.graded / assignment.totalStudents) * 100}%`,
                            }}
                          />
                          <div
                            className="bg-blue-500 transition-all"
                            style={{
                              width: `${((assignment.submitted - assignment.graded) / assignment.totalStudents) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />{" "}
                          Graded
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />{" "}
                          Pending Review
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-300 dark:bg-white/20 rounded-full" />{" "}
                          Not Submitted
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      onClick={() => handleViewSubmissions(assignment)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      View Submissions
                    </Button>
                    <Button
                      variant="ghost"
                      className="p-2!"
                      onClick={() => handleEditAssignment(assignment)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="p-2! text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredAssignments.length === 0 && (
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No assignments found
            </p>
            <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Assignment
            </Button>
          </Card>
        )}
      </div>

      {/* Create/Edit Assignment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingAssignment(null);
          setAssignmentForm({
            title: "",
            description: "",
            classId: "",
            dueDate: "",
            dueTime: "23:59",
            totalMarks: 100,
            attachments: [],
          });
        }}
        title={editingAssignment ? "Edit Assignment" : "Create Assignment"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Class *
            </label>
            <select
              value={assignmentForm.classId}
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  classId: e.target.value,
                })
              }
              className="w-full px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="bg-white dark:bg-gray-800">
                Choose a class...
              </option>
              {myClasses
                .filter((c) => c.id !== "all")
                .map((cls) => (
                  <option
                    key={cls.id}
                    value={cls.id}
                    className="bg-white dark:bg-gray-800"
                  >
                    {cls.name} ({cls.students} students)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assignment Title *
            </label>
            <Input
              placeholder="e.g., Assignment 1: Arrays and Linked Lists"
              value={assignmentForm.title}
              onChange={(e) =>
                setAssignmentForm({ ...assignmentForm, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              placeholder="Describe the assignment requirements..."
              value={assignmentForm.description}
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  description: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date *
              </label>
              <Input
                type="date"
                value={assignmentForm.dueDate}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    dueDate: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Time
              </label>
              <Input
                type="time"
                value={assignmentForm.dueTime}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    dueTime: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Marks
            </label>
            <Input
              type="number"
              value={assignmentForm.totalMarks}
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  totalMarks: parseInt(e.target.value) || 0,
                })
              }
              min="1"
              max="1000"
            />
          </div>

          <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-lg border-2 border-dashed border-gray-300 dark:border-white/20 text-center cursor-pointer hover:border-purple-400 transition-colors">
            <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag & drop assignment files or click to upload
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, DOC, ZIP up to 50MB
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setShowCreateModal(false);
                setEditingAssignment(null);
                setAssignmentForm({
                  title: "",
                  description: "",
                  classId: "",
                  dueDate: "",
                  dueTime: "23:59",
                  totalMarks: 100,
                  attachments: [],
                });
              }}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleCreateAssignment}>
              {editingAssignment ? "Update Assignment" : "Create Assignment"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Submissions Modal */}
      <Modal
        isOpen={showSubmissionsModal}
        onClose={() => {
          setShowSubmissionsModal(false);
          setSelectedAssignment(null);
        }}
        title={`Submissions: ${selectedAssignment?.title || ""}`}
      >
        {selectedAssignment && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-white/5 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAssignment.className} • {selectedAssignment.batch}
                </p>
                <p className="text-sm text-gray-500">
                  Due: {selectedAssignment.dueDate}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedAssignment.submitted}/
                  {selectedAssignment.totalStudents} submitted
                </p>
                <p className="text-sm text-gray-500">
                  {selectedAssignment.graded} graded
                </p>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {submission.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {submission.studentName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {submission.studentId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {submission.submittedAt && (
                      <p className="text-xs text-gray-500">
                        {submission.submittedAt}
                      </p>
                    )}
                    {getSubmissionStatusBadge(submission.status)}
                    {submission.marks !== null && (
                      <span className="font-medium text-gray-900 dark:text-white">
                        {submission.marks}/{selectedAssignment.totalMarks}
                      </span>
                    )}
                    {submission.status !== "pending" && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" className="p-1.5!">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" className="p-1.5!">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {(submission.status === "submitted" ||
                      submission.status === "late") && (
                      <Button
                        variant="outline"
                        className="py-1! px-2! text-sm!"
                      >
                        Grade
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowSubmissionsModal(false)}
              >
                Close
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
