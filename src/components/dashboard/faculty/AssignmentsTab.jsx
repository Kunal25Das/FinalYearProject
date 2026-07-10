"use client";

import { useState, useEffect, useRef } from "react";
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

  const [assignments, setAssignments] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    classId: "",
    dueDate: "",
    dueTime: "23:59",
    totalMarks: 100,
    attachments: [],
  });

  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeMarks, setGradeMarks] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");

  async function loadData() {
    try {
      const res = await fetch("/api/faculty/assignments");
      const data = await res.json();
      if (data.success) {
        setAssignments(data.assignments);
        setMyClasses(data.myClasses);
      }
    } catch (err) {
      console.error("Error loading assignments data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadSubmissions(assignmentId) {
    try {
      const res = await fetch(
        `/api/faculty/assignments/submissions?assignmentId=${assignmentId}`,
      );
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error("Error loading submissions:", err);
    }
  }

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

  const handleCreateAssignment = async () => {
    if (
      !assignmentForm.title ||
      !assignmentForm.classId ||
      !assignmentForm.dueDate
    ) {
      alert("Please fill all required fields");
      return;
    }

    setIsUploadingFile(true);

    try {
      const isEditing = !!editingAssignment;
      const formData = new FormData();
      if (isEditing) {
        formData.append("id", editingAssignment.id);
      }
      formData.append("title", assignmentForm.title);
      formData.append("description", assignmentForm.description || "");
      formData.append("classId", assignmentForm.classId);
      formData.append("dueDate", assignmentForm.dueDate);
      formData.append("dueTime", assignmentForm.dueTime);
      formData.append("totalMarks", String(assignmentForm.totalMarks));

      if (selectedFile) {
        formData.append("file", selectedFile);
      } else if (
        assignmentForm.attachments &&
        assignmentForm.attachments.length > 0
      ) {
        formData.append(
          "existingAttachments",
          JSON.stringify(assignmentForm.attachments),
        );
      } else {
        formData.append("existingAttachments", JSON.stringify([]));
      }

      const res = await fetch("/api/faculty/assignments", {
        method: isEditing ? "PUT" : "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        await loadData();
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
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        alert(data.error || "Failed to save assignment");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving assignment");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      title: assignment.title,
      description: assignment.description,
      classId: assignment.classId,
      dueDate: assignment.rawDueDate || "",
      dueTime: assignment.dueTime,
      totalMarks: assignment.totalMarks,
      attachments: [],
    });
    setShowCreateModal(true);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      const res = await fetch(`/api/faculty/assignments?id=${assignmentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await loadData();
      } else {
        alert(data.error || "Failed to delete assignment");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting assignment");
    }
  };

  const handleViewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    await loadSubmissions(assignment.id);
    setShowSubmissionsModal(true);
  };

  const handleSaveGrade = async () => {
    if (!gradingSubmission || gradeMarks === "") return;

    try {
      const res = await fetch("/api/faculty/assignments/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: gradingSubmission.id,
          marks: parseInt(gradeMarks),
          feedback: gradeFeedback,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Submission graded successfully!");
        await loadSubmissions(selectedAssignment.id);
        await loadData();
        setGradingSubmission(null);
        setGradeMarks("");
        setGradeFeedback("");
      } else {
        alert(data.error || "Failed to save grade");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while grading");
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`p-4 rounded-lg border-2 border-dashed text-center cursor-pointer transition-colors ${
              selectedFile
                ? "border-green-500/50 bg-green-500/5"
                : "border-gray-300 dark:border-white/20 hover:border-purple-400 bg-gray-100 dark:bg-white/5"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setSelectedFile(e.target.files[0] || null)}
              style={{ display: "none" }}
            />
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <span className="text-xl">📄</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1 max-w-[250px] truncate text-sm">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(0)} KB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Remove File
                </button>
              </div>
            ) : assignmentForm.attachments &&
              assignmentForm.attachments.length > 0 ? (
              <div className="flex flex-col items-center">
                <span className="text-xl">📎</span>
                <p className="font-medium text-purple-600 dark:text-purple-400 mt-1 max-w-[250px] truncate text-sm">
                  {assignmentForm.attachments[0].name}
                </p>
                <p className="text-xs text-gray-500">
                  Existing attachment (Click to replace)
                </p>
              </div>
            ) : (
              <>
                <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drag & drop assignment files or click to upload
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, DOC, ZIP up to 50MB
                </p>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setShowCreateModal(false);
                setEditingAssignment(null);
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
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
              disabled={isUploadingFile}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateAssignment}
              disabled={isUploadingFile}
            >
              {isUploadingFile ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : editingAssignment ? (
                "Update Assignment"
              ) : (
                "Create Assignment"
              )}
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
                        <a
                          href={submission.attachmentUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <a
                          href={
                            submission.attachmentUrl
                              ? submission.attachmentUrl.replace(
                                  "/view?",
                                  "/download?",
                                )
                              : "#"
                          }
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          download
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                    {(submission.status === "submitted" ||
                      submission.status === "late") && (
                      <Button
                        variant="outline"
                        className="py-1! px-2! text-sm!"
                        onClick={() => {
                          setGradingSubmission(submission);
                          setGradeMarks(submission.marks?.toString() || "");
                          setGradeFeedback(submission.feedback || "");
                        }}
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

      {/* Grade Submission Modal */}
      <Modal
        isOpen={!!gradingSubmission}
        onClose={() => setGradingSubmission(null)}
        title={`Grade: ${gradingSubmission?.studentName || ""}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Submit marks and feedback for this assignment submission.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Marks (Max {selectedAssignment?.totalMarks || 100})
            </label>
            <Input
              type="number"
              min="0"
              max={selectedAssignment?.totalMarks || 100}
              placeholder="Enter marks"
              value={gradeMarks}
              onChange={(e) => setGradeMarks(e.target.value)}
              className="bg-white/5 dark:bg-white/5 dark:border-white/10 dark:text-white placeholder:text-gray-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Feedback / Comments
            </label>
            <textarea
              placeholder="e.g. Well researched, good format..."
              value={gradeFeedback}
              onChange={(e) => setGradeFeedback(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setGradingSubmission(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={handleSaveGrade}
            >
              Save Grade
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
