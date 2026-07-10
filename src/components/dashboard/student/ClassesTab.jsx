"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function ClassesTab() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Mock data
  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/student/classes");
      const data = await res.json();
      if (data.success) {
        setClasses(data.classes);
        if (selectedClass) {
          const updatedSelected = data.classes.find(
            (c) => c.id === selectedClass.id,
          );
          if (updatedSelected) {
            setSelectedClass(updatedSelected);
          }
        }
      }
    } catch (err) {
      console.error("Error loading classes:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmitModalOpen(true);
    setSelectedFile(null);
    setComments("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;
    if (!selectedFile) {
      alert("Please select a file to submit");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("assignmentId", selectedAssignment.id);
      formData.append("feedback", comments);
      formData.append("file", selectedFile);

      const res = await fetch("/api/student/assignments/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert("Assignment submitted successfully!");
        setIsSubmitModalOpen(false);
        setSelectedFile(null);
        setComments("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        await loadData();
      } else {
        alert(data.error || "Failed to submit assignment");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-500">Loading classes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Classes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Access course materials and assignments
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls, index) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="h-full cursor-pointer hover:border-white/20 transition-colors group"
              onClick={() => setSelectedClass(cls)}
            >
              <div
                className={`h-24 rounded-t-xl bg-linear-to-r ${cls.color} -mx-6 -mt-6 mb-4 relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-4 left-6 text-white">
                  <p className="text-xs font-medium opacity-80">{cls.code}</p>
                  <h3 className="text-xl font-bold">{cls.name}</h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Faculty
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {cls.faculty}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Credits
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {cls.credits}
                  </span>
                </div>

                {cls.notices.length > 0 && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-500">
                        Notice
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                        {cls.notices[0].content}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-white/5 flex justify-between items-center text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" /> {cls.resources.length}{" "}
                    Resources
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />{" "}
                    {
                      cls.assignments.filter((a) => a.status === "pending")
                        .length
                    }{" "}
                    Pending
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Class Details Modal */}
      <Modal
        isOpen={!!selectedClass}
        onClose={() => setSelectedClass(null)}
        title={selectedClass?.name || "Class Details"}
        size="lg"
      >
        {selectedClass && (
          <div className="space-y-8">
            {/* Notices Section */}
            {selectedClass.notices.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Notices
                </h3>
                <div className="space-y-3">
                  {selectedClass.notices.map((notice) => (
                    <div
                      key={notice.id}
                      className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-yellow-500">
                          {notice.title}
                        </h4>
                        <span className="text-xs text-yellow-500/60">
                          {notice.date}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {notice.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-400" />
                Resources
              </h3>
              <div className="space-y-3">
                {selectedClass.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {resource.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {resource.size} • Uploaded {resource.uploadDate}
                        </p>
                      </div>
                    </div>
                    <a
                      href={
                        resource.fileUrl
                          ? resource.fileUrl.replace("/view?", "/download?")
                          : "#"
                      }
                      download
                      className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-500 hover:text-purple-600 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                ))}
                {selectedClass.resources.length === 0 && (
                  <p className="text-gray-500 text-sm italic">
                    No resources uploaded yet.
                  </p>
                )}
              </div>
            </div>

            {/* Assignments Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-400" />
                Assignments
              </h3>
              <div className="space-y-3">
                {selectedClass.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          assignment.status === "pending"
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {assignment.status === "pending" ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {assignment.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Due: {assignment.dueDate}
                        </p>
                      </div>
                    </div>
                    {assignment.status === "pending" ? (
                      <Button
                        size="sm"
                        onClick={() => openSubmitModal(assignment)}
                        className="!py-2 !px-4 !text-sm"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Submit
                      </Button>
                    ) : assignment.status === "graded" ? (
                      <div className="text-right">
                        <span className="text-sm text-green-600 dark:text-green-400 font-bold block">
                          Graded: {assignment.marks}/{assignment.totalMarks}
                        </span>
                        {assignment.feedback && (
                          <span
                            className="text-xs text-gray-500 block italic max-w-[200px] truncate"
                            title={assignment.feedback}
                          >
                            &quot;{assignment.feedback}&quot;
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium px-4">
                        Submitted
                      </span>
                    )}
                  </div>
                ))}
                {selectedClass.assignments.length === 0 && (
                  <p className="text-gray-500 text-sm italic">
                    No assignments due.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Submit Assignment Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Assignment"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-4">
            <p className="text-sm text-violet-500 dark:text-violet-300 font-medium">
              Assignment
            </p>
            <p className="text-gray-900 dark:text-white font-bold">
              {selectedAssignment?.title}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Due: {selectedAssignment?.dueDate}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Description (Optional)
            </label>
            <textarea
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500 h-32 resize-none"
              placeholder="Add any comments..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div
            onClick={() => !isSubmitting && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              selectedFile
                ? "border-green-500/50 bg-green-500/5"
                : "border-gray-300 dark:border-white/20 hover:border-violet-500/50 bg-gray-50 dark:bg-white/5"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setSelectedFile(e.target.files[0] || null)}
              style={{ display: "none" }}
              disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  Remove File
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-900 dark:text-white font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOCX, ZIP up to 10MB
                </p>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => {
                setIsSubmitModalOpen(false);
                setSelectedFile(null);
                setComments("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitAssignment} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
